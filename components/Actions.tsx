"use client";

import { useState } from "react";
import type { Post } from "@/lib/data";
import { Hear, Reply, Reprint } from "./icons";
import { VoiceToggle } from "./Voice";

const n = (x: number) => x.toLocaleString("en-GB");

export default function Actions({ post: p, replies }: { post: Post; replies: number }) {
  const [open, setOpen] = useState(false);
  const e = p.engagement || { hearHears: 0, reprints: 0 };
  return (
    <>
      <div className="actions">
        <span title="Replies">
          <Reply />
          {n(replies)} {replies === 1 ? "Reply" : "Replies"}
        </span>
        <span title="Reprinted in other papers">
          <Reprint />
          {n(e.reprints)} Reprints
        </span>
        <span title="Hear, hear!">
          <Hear />
          {n(e.hearHears)} Hear Hears
        </span>
        <VoiceToggle post={p} />
        {p.thenVsNow && (
          <button className="tvn-btn" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
            Then &amp; Now
          </button>
        )}
      </div>
      {p.thenVsNow && open && (
        <div className="tvn">
          <span className="tvn-label">{p.thenVsNow.label}</span>
          {p.thenVsNow.text}
        </div>
      )}
    </>
  );
}
