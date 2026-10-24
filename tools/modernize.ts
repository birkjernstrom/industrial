import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { z } from "zod";

const POSTS = "data/posts.json";
const ACCOUNTS = "data/accounts.json";
const OUT = "data/modern.json";

type Post = { id: string; accountId: string; date: string; chapter: number; kind: string; headline?: string; text: string; type: string; replyTo: string | null };
type Account = { id: string; name: string; handle: string; bio: string; historical: boolean };

const Version = z.object({ headline: z.string(), text: z.string() });
const Result = z.object({
  posts: z.array(z.object({ id: z.string(), plain: Version, casual: Version, unhinged: Version })),
});
export type Modern = Record<string, Omit<z.infer<typeof Result>["posts"][number], "id">>;

const SYSTEM = `You rewrite posts from "The Mechanical Age", a social-media-style feed of the British Industrial Revolution (1760–1859). Readers find the period English hard going, so every post gets three modern versions. Readers flip between the original and these versions, and each is labelled as an AI rewrite.

Levels:
- plain: clear, natural modern English. Same meaning, same voice and person (first person stays first person), same claims. Untangle long sentences, replace archaic words and spellings. No slang. Roughly the same length or shorter.
- casual: how this person might post it in 2026. Conversational, contractions, the odd bit of current slang, an emoji at most if it fits. Still readable to anyone.
- unhinged: terminally online, all lowercase. Lean into internet slang, acronyms and meme formats: bruh, ngmi, wagmi, fr, ong, no cap, lowkey/highkey, it's giving, ratio, cope, based, L/W, "not the ___", 💀 😭 🔥 etc. Vary it from post to post rather than stuffing every one with the same words. Funny, but the reader must still learn what the post actually says.

Rules for every level:
- Keep every fact: names, places, dates, numbers, wages, hours, machines, events. Don't add facts, and don't have people know about anything after their own date.
- Keep each speaker's point of view and attitude, even when it is self-serving or wrong. Don't add modern moral commentary.
- Posts about death, injury, hunger or child labour keep their weight. In the unhinged version the voice can be online, but never make the victims or the suffering the joke.
- headline: rewrite the headline for news cards; use "" for posts that have no headline.
- Return every post id you were given, exactly once.`;

const client = new Anthropic();

async function modernize(chapter: number, batch: Post[], accounts: Record<string, Account>, all: Record<string, Post>) {
  const items = batch.map((p) => {
    const a = accounts[p.accountId];
    const parent = p.replyTo ? all[p.replyTo] : null;
    return {
      id: p.id,
      author: `${a.name} (${a.handle}): ${a.bio}`,
      date: p.date,
      kind: p.kind,
      ...(p.headline ? { headline: p.headline } : {}),
      text: p.text,
      ...(parent ? { replyingTo: `${accounts[parent.accountId].name}: ${parent.text}` } : {}),
    };
  });
  const response = await client.beta.messages
    .stream({
      model: "claude-opus-5-5",
      max_tokens: 64000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: betaZodOutputFormat(Result) },
      system: SYSTEM,
      messages: [{ role: "user", content: `Chapter ${chapter} posts:\n\n${JSON.stringify(items, null, 2)}` }],
    })
    .finalMessage();
  if (response.stop_reason === "refusal") throw new Error(`chapter ${chapter}: refused (${response.stop_details?.category})`);
  if (response.stop_reason === "max_tokens") throw new Error(`chapter ${chapter}: hit max_tokens`);
  const parsed = response.parsed_output;
  if (!parsed) throw new Error(`chapter ${chapter}: no parsable output`);
  const wanted = new Set(batch.map((p) => p.id));
  return parsed.posts.filter((p) => wanted.has(p.id));
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const only = new Set(args.filter((a) => !a.startsWith("--")));
  const posts: Post[] = JSON.parse(readFileSync(POSTS, "utf8"));
  const accounts: Record<string, Account> = Object.fromEntries((JSON.parse(readFileSync(ACCOUNTS, "utf8")) as Account[]).map((a) => [a.id, a]));
  const postById = Object.fromEntries(posts.map((p) => [p.id, p]));
  const existing: Modern = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};

  const todo = posts.filter((p) => (only.size ? only.has(p.id) : force || !existing[p.id]));
  if (!todo.length) {
    console.log("Nothing to do. Pass post ids or --force to regenerate.");
    return;
  }
  const chapters = [...new Set(todo.map((p) => p.chapter))];
  console.log(`Modernising ${todo.length} posts across ${chapters.length} chapters…`);

  const results = await Promise.allSettled(
    chapters.map(async (c) => {
      const batch = todo.filter((p) => p.chapter === c);
      const out = await modernize(c, batch, accounts, postById);
      for (const { id, ...v } of out) existing[id] = v;
      console.log(`  chapter ${c}: ${out.length}/${batch.length}`);
    })
  );
  const ordered: Modern = Object.fromEntries(posts.filter((p) => existing[p.id]).map((p) => [p.id, existing[p.id]]));
  writeFileSync(OUT, JSON.stringify(ordered, null, 2) + "\n");

  const failed = results.filter((r) => r.status === "rejected");
  for (const f of failed) console.error(`  ${(f as PromiseRejectedResult).reason}`);
  const missing = todo.filter((p) => !ordered[p.id]).map((p) => p.id);
  if (missing.length) console.error(`Missing: ${missing.join(", ")}`);
  process.exit(failed.length || missing.length ? 1 : 0);
}

main();
