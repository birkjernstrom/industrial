import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Avatar from "@/components/Avatar";
import { FeedMasthead } from "@/components/Masthead";
import { BackButton } from "@/components/Nav";
import PostView from "@/components/Post";
import { VoiceBar } from "@/components/Voice";
import YearBar from "@/components/YearBar";
import { accountById, accounts, posts } from "@/lib/data";
import { ROLE_LABELS } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return accounts.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = accountById[(await params).id];
  if (!a) return {};
  const title = `${a.name} (${a.handle})`;
  return { title, description: a.bio, openGraph: { title, description: a.bio, type: "profile", url: `/profile/${a.id}` } };
}

export default async function ProfilePage({ params }: Props) {
  const a = accountById[(await params).id];
  if (!a) notFound();
  const own = posts.filter((p) => p.accountId === a.id).sort((x, y) => x.chapter - y.chapter || x.date.localeCompare(y.date));
  const verified = own.filter((p) => p.verificationStatus === "checked").length;

  return (
    <>
      <FeedMasthead />
      <div className="sticky">
        <YearBar initialYear={(own[0]?.date || "1800").slice(0, 4)} label={a.name} />
        <VoiceBar />
      </div>
      <main className="feed">
        <section className="profile-head" data-date={own[0]?.date || "1800"} data-chapter={own[0]?.chapter || 1}>
          <BackButton label="← Back to the feed" />
          <div className="top">
            <span className="avatar">
              <Avatar account={a} />
            </span>
            <div>
              <h2>{a.name}</h2>
              <div className="handle">
                {a.handle} · <span className="role">{ROLE_LABELS[a.role]}</span>
              </div>
            </div>
          </div>
          <p className="bio">{a.bio}</p>
          <div className="meta">
            <span>{a.years}</span>
            <span>{own.length} posts</span>
            <span>{verified} verified</span>
          </div>
          {a.historical === false && (
            <div className="composite">
              {a.id === "gazette"
                ? "Editorial account written for this feed. Not a historical newspaper."
                : "Composite persona: an invented voice built from documented experience, not a real individual."}
            </div>
          )}
        </section>
        {own.map((p) => (
          <PostView key={p.id} post={p} />
        ))}
      </main>
    </>
  );
}
