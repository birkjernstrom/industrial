import Link from "next/link";
import { accountById, postById, replyCount, type Post } from "@/lib/data";
import { formatDate, ROLE_LABELS, year } from "@/lib/format";
import Actions from "./Actions";
import Avatar from "./Avatar";
import Badge from "./Badge";
import { VoiceNote, VoiceScope, VoiceText } from "./Voice";

type Opts = { chain?: boolean; focus?: boolean; showReplying?: boolean };

function QuotedCard({ id }: { id: string }) {
  const q = postById[id];
  if (!q) return null;
  const a = accountById[q.accountId];
  return (
    <Link className="quoted" href={`/post/${q.id}`}>
      <div className="qh">
        <b>{a.name}</b> {a.handle} · {formatDate(q.date, q.datePrecision)}
      </div>
      <VoiceText className="qt" post={q} field={q.kind === "news" ? "headline" : "text"} />
    </Link>
  );
}

export default function PostView({ post: p, chain = false, focus = false, showReplying = true }: { post: Post } & Opts) {
  const a = accountById[p.accountId];
  const attrs = { "data-date": p.date, "data-chapter": p.chapter, id: `post-${p.id}` };
  const date = (
    <Link className="date" href={`/post/${p.id}`}>
      {formatDate(p.date, p.datePrecision)}
    </Link>
  );

  if (p.kind === "news") {
    return (
      <article className="news" {...attrs}>
        <VoiceScope>
          <div className="news-card">
            <div className="kicker">
              <span>{a.name}</span>
              {date}
            </div>
            <VoiceText as="h3" post={p} field="headline" />
            <VoiceText as="p" post={p} field="text" />
            <VoiceNote post={p} />
            <Badge post={p} account={a} />
            <Actions post={p} replies={replyCount[p.id] || 0} />
          </div>
        </VoiceScope>
      </article>
    );
  }

  const parent = p.replyTo ? postById[p.replyTo] : undefined;
  const sy = p.source?.year;
  const cls = ["post", p.verificationStatus === "checked" && "verified", chain && "is-reply-chain", focus && "focus"].filter(Boolean).join(" ");
  return (
    <article className={cls} {...attrs}>
      <VoiceScope>
        <Link className="avatar" href={`/profile/${a.id}`} aria-label={`${a.name}'s profile`}>
          <Avatar account={a} />
        </Link>
        <div>
          <div className="post-head">
            <Link className="name" href={`/profile/${a.id}`}>
              {a.name}
            </Link>
            <span className="handle">{a.handle}</span>
            <span className="dot">·</span>
            {date}
            {sy && sy > year(p.date) && (
              <>
                <span className="dot">·</span>
                <span className="handle">pub. {sy}</span>
              </>
            )}
            <span className="role">{ROLE_LABELS[a.role] || a.role}</span>
          </div>
          {showReplying && parent && (
            <div className="replying">
              Replying to <Link href={`/post/${parent.id}`}>{accountById[parent.accountId].handle}</Link>
            </div>
          )}
          <VoiceText className="text" post={p} field="text" />
          <VoiceNote post={p} />
          {p.quotes && <QuotedCard id={p.quotes} />}
          <Badge post={p} account={a} />
          <Actions post={p} replies={replyCount[p.id] || 0} />
        </div>
      </VoiceScope>
    </article>
  );
}

export function PostList({ list, focusId }: { list: Post[]; focusId?: string }) {
  return list.map((p, i) => (
    <PostView key={p.id} post={p} focus={p.id === focusId} chain={list[i + 1]?.replyTo === p.id} showReplying={list[i - 1]?.id !== p.replyTo} />
  ));
}
