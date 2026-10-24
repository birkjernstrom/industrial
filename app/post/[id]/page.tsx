import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeedMasthead } from "@/components/Masthead";
import { BackButton, ScrollToPost } from "@/components/Nav";
import PostView, { PostList } from "@/components/Post";
import { VoiceBar } from "@/components/Voice";
import YearBar from "@/components/YearBar";
import { accountById, postById, posts, type Post } from "@/lib/data";
import { byDate, excerpt, formatDate } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = postById[(await params).id];
  if (!p) return {};
  const a = accountById[p.accountId];
  const title = p.kind === "news" ? p.headline! : `${a.name}, ${formatDate(p.date, p.datePrecision)}`;
  const label = p.verificationStatus === "checked" ? "Verified quotation" : p.type === "reconstructed" ? "Reconstructed" : "Needs verification";
  const description = `${excerpt(p.text, 200)} (${label})`;
  return {
    title,
    description,
    openGraph: { title, description, type: "article", url: `/post/${p.id}` },
    twitter: { title, description },
  };
}

export default async function PostPage({ params }: Props) {
  const p = postById[(await params).id];
  if (!p) notFound();

  const ancestors: Post[] = [];
  let cur = p;
  while (cur.replyTo && postById[cur.replyTo]) {
    cur = postById[cur.replyTo];
    ancestors.unshift(cur);
  }
  const below: Post[] = [];
  const walk = (x: Post) =>
    posts
      .filter((r) => r.replyTo === x.id)
      .sort(byDate)
      .forEach((r) => {
        below.push(r);
        walk(r);
      });
  walk(p);
  const quotedBy = posts.filter((q) => q.quotes === p.id);
  const list = [...ancestors, p, ...below];

  return (
    <>
      <FeedMasthead />
      <div className="sticky">
        <YearBar initialYear={p.date.slice(0, 4)} />
        <VoiceBar />
      </div>
      <main className="feed">
        <section className="profile-head" data-date={p.date} data-chapter={p.chapter}>
          <BackButton label="← Back" />
        </section>
        <PostList list={list} focusId={p.id} />
        {quotedBy.length > 0 && (
          <>
            <div className="chapter-head" style={{ padding: 14 }}>
              <div className="numeral">Quoted by</div>
            </div>
            {quotedBy.map((q) => (
              <PostView key={q.id} post={q} />
            ))}
          </>
        )}
      </main>
      <ScrollToPost id={p.id} />
    </>
  );
}
