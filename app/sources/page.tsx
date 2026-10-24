import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import { accountById, chapters, posts, type Post, type Source } from "@/lib/data";
import { excerpt, formatDate, ROMAN } from "@/lib/format";

export const metadata: Metadata = {
  title: "Sources & Method",
  description: "Every verified source behind The Mechanical Age, and how its reconstructed posts were written.",
};

const PostLink = ({ p }: { p: Post }) => <Link href={`/post/${p.id}`}>{formatDate(p.date, p.datePrecision)}</Link>;

const UrlLink = ({ u }: { u?: string }) =>
  u ? (
    <a href={u} target="_blank" rel="noopener">
      {u.replace(/^https?:\/\//, "")}
    </a>
  ) : (
    <>no online copy linked</>
  );

export default function SourcesPage() {
  const checked = posts.filter((p) => p.verificationStatus === "checked");
  const needs = posts.filter((p) => p.verificationStatus === "needs-verification");
  const recon = posts.filter((p) => p.type === "reconstructed");
  const accountCount = new Set(posts.map((p) => p.accountId)).size;
  const pct = Math.round((100 * checked.length) / posts.length);

  const groups = new Map<string, { source: Source; posts: Post[] }>();
  for (const p of checked) {
    const s = p.source!;
    const key = `${s.title}|${s.url}`;
    if (!groups.has(key)) groups.set(key, { source: s, posts: [] });
    groups.get(key)!.posts.push(p);
  }
  const sorted = [...groups.values()].sort((a, b) => a.source.year! - b.source.year! || a.source.author!.localeCompare(b.source.author!));

  const stats: [number, string][] = [
    [posts.length, "posts"],
    [accountCount, "accounts"],
    [checked.length, `verified (${pct}%)`],
    [needs.length, "need verification"],
    [recon.length, "reconstructed"],
  ];

  return (
    <>
      <Masthead eyebrow="The Mechanical Age" title="Sources & Method" sub="How we know what we claim to know." />
      <main className="doc">
        <div className="stats">
          {stats.map(([n, l]) => (
            <div className="stat" key={l}>
              <b>{n}</b>
              <span>{l}</span>
            </div>
          ))}
        </div>

        <h2>Two kinds of post</h2>
        <p>Every post in the feed is one of two kinds, and the badge on it says which.</p>
        <p>
          <b>Verified</b> posts are real words from a public-domain source: a book, pamphlet, letter, speech or parliamentary record from the period. They may be trimmed, with the cut shown by an ellipsis (…), but they are never reworded. The seal opens the full citation and a link to an online copy.
        </p>
        <p>
          <b>Reconstructed</b> posts were written for this feed, in period voice, to fill gaps in the record, mostly the voices of working people, whose words were rarely printed. Each one carries a note on the documented facts it rests on: dates, wages, hours, events, customs. The facts are sourced; the wording is invented. Reconstructed posts never appear with the verified seal.
        </p>

        <h2>How verified quotes were checked</h2>
        <p>
          For each quotation we downloaded a plain-text copy of a public-domain edition (Project Gutenberg, Internet Archive scans, Wikisource, or Hansard) and compared every trimmed fragment of the quotation with it, letter by letter, ignoring punctuation and spacing. The text checked is linked from each citation.
        </p>
        <ul>
          <li>
            <b>Exact match:</b> every fragment appears in the source.
          </li>
          <li>
            <b>Scan-error match:</b> for scanned books, a fragment may differ from the scan by a few characters, such as <i>lingers</i> for <i>fingers</i> or a page header in mid-sentence. These were inspected by hand and accepted only where every difference was a scanning error. One real error turned up this way (Adam Smith&apos;s &ldquo;invention&rdquo;, not &ldquo;inventions&rdquo;) and was corrected.
          </li>
          <li>
            <b>Needs verification:</b> wording we could not match to a reliable public-domain text, or that matches only a later paraphrase. These posts carry an amber badge, are hidden by the &ldquo;Verified only&rdquo; filter, and are not counted as verified.
          </li>
        </ul>
        <p>
          The check can be rerun at any time with <code>python3 tools/verify_quotes.py</code>, which fetches each source and reports a result for every verified post.
        </p>

        <h3>Caveats</h3>
        <ul className="warnlist">
          <li>
            <b>Reprints.</b> Some texts were checked against faithful later reprints instead of first editions: Oastler&apos;s &ldquo;Yorkshire Slavery&rdquo; letter as reprinted in Kydd&apos;s <i>History of the Factory Movement</i> (1857); Luddite documents as transcribed from Home Office papers by J. L. and Barbara Hammond (1919); and one Southey passage as quoted in Macaulay&apos;s review. The citation says so in each case.
          </li>
          <li>
            <b>Recollections.</b> Bamford&apos;s account of Peterloo was published in 1844, twenty-five years after the event, and Kemble&apos;s letters in 1878. Each post is dated to the event or letter, and the feed shows the later publication year beside it.
          </li>
          <li>
            <b>Translation.</b> Engels wrote in German in 1845. His words appear in Florence Kelley Wischnewetzky&apos;s English translation of 1887.
          </li>
          <li>
            <b>Fiction.</b> Lines from novels (Disraeli, Gaskell, Dickens) are quoted accurately, but some are spoken by characters. The notes say so.
          </li>
          <li>
            <b>Attribution.</b> Boulton&apos;s &ldquo;I sell here, Sir…&rdquo; survives only because Boswell wrote it down. It is accurately quoted from Boswell, and the note says that the attribution rests on him.
          </li>
        </ul>

        <h2>How reconstructed posts were written</h2>
        <p>Reconstructed posts follow three rules:</p>
        <ul>
          <li>
            <b>Grounded in documented conditions.</b> Hours, wages, punishments, places and events come from contemporary testimony, parliamentary evidence or standard histories, and the note on each post names what it draws on. Where a figure was itself disputed at the time, as with the miles a piecer walked, the note says so.
          </li>
          <li>
            <b>Period attitudes, not modern ones.</b> The voices complain about what people of the time complained about: bread prices, piece-rates, the loss of a trade, the workhouse, the vote. They do not anticipate later arguments.
          </li>
          <li>
            <b>Clearly labelled personas.</b> Four worker accounts (a cropper, a hand-loom weaver, a piecer and a navvy) are <i>composites</i>: invented people built from many real lives. Their profiles say so, and their avatars have a dashed frame. Where a real person is given reconstructed words (Arkwright, Watt, Oastler, Lovett), the post is badged as reconstructed like any other.
          </li>
        </ul>
        <p>
          <b>News cards</b> come from <i>The Mechanical Age Gazette</i>, an editorial account written for this feed. It is not a real newspaper. The cards summarise well-documented events and are badged as reconstructed.
        </p>
        <p>
          <b>Then &amp; Now</b> notes on some posts describe modern arguments about AI that echo the historical one. They are paraphrases of common positions, labelled as modern commentary, and deliberately not attributed to named people.
        </p>
        <p>
          <b>Modern voices.</b> The slider above the feed, and the &ldquo;Modernise&rdquo; button on each post, swap in an AI rewrite of the post in plain modern English, casual 2026 English, or full internet slang. Rewrites were generated once with Claude, keep the post&apos;s facts and point of view, and are labelled &ldquo;AI rewrite&rdquo; wherever they appear. They are not quotations: the verified wording is always the original, one tap away.
        </p>
        <p>
          Modern avatars are generated with <a href="https://www.dicebear.com" target="_blank" rel="noopener">DiceBear</a>: &ldquo;Notionists&rdquo; by Zoish (CC0) and &ldquo;Adventurer&rdquo; by Lisa Wischofsky, licensed under{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>. They are cartoons, not likenesses.
        </p>
        <p>
          <b>Engagement numbers</b> (&ldquo;Hear Hears&rdquo;, &ldquo;Reprints&rdquo;) are decorative and generated. They do not measure anything.
        </p>

        <h2 id="needs">Needs verification</h2>
        {needs.map((p) => (
          <div className="src" id={p.id} key={p.id}>
            <div>
              <b>{accountById[p.accountId].name}</b>, <PostLink p={p} />: &ldquo;{excerpt(p.text)}&rdquo;
            </div>
            <div className="m">{p.source?.title || ""}</div>
            <div className="m">{p.notes}</div>
          </div>
        ))}

        <h2 id="verified">Verified sources</h2>
        <p>Grouped by work. Each entry lists the posts that quote it.</p>
        {sorted.map(({ source: s, posts: ps }) => (
          <div className="src" key={`${s.title}|${s.url}`}>
            <div>
              <b>{s.author}</b>, <span className="t">{s.title}</span> ({s.year})
            </div>
            <div className="m">
              <UrlLink u={s.url} />
            </div>
            <ul>
              {ps.map((p) => (
                <li id={p.id} key={p.id}>
                  <PostLink p={p} />, {p.source?.location || ""}: &ldquo;{excerpt(p.text, 90)}&rdquo;
                </li>
              ))}
            </ul>
          </div>
        ))}

        <h2 id="reconstructed">Reconstructed posts and their evidence</h2>
        {chapters.map((c) => {
          const ps = recon.filter((p) => p.chapter === c.id);
          if (!ps.length) return null;
          return (
            <div key={c.id}>
              <h3>
                {ROMAN[c.id]}. {c.title}
              </h3>
              {ps.map((p) => (
                <div className="src" id={p.id} key={p.id}>
                  <div>
                    <b>{accountById[p.accountId].name}</b>, <PostLink p={p} />
                    {p.kind === "news" && ` (news card: ${p.headline})`}
                  </div>
                  <div className="m">{p.notes}</div>
                </div>
              ))}
            </div>
          );
        })}
      </main>
    </>
  );
}
