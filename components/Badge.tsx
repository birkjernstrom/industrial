"use client";

import type { Account, Post } from "@/lib/data";
import { Quill, Seal, Warn } from "./icons";
import { useSheet } from "./Sheet";

function citation(p: Post) {
  const s = p.source || {};
  const t = s.title ? s.title.split(/[,(:]/)[0].trim() : "";
  return [s.author, t, s.year].filter(Boolean).join(", ");
}

export default function Badge({ post: p, account }: { post: Post; account: Account }) {
  const open = useSheet();
  const onClick = () => open(p, account);
  if (p.type === "reconstructed") {
    return (
      <button className="badge r" type="button" onClick={onClick} aria-label="Reconstructed post: show what it is based on">
        <Quill />
        <span className="stampbox">Reconstructed</span>
        <span className="cite">what is this based on?</span>
      </button>
    );
  }
  if (p.verificationStatus === "checked") {
    return (
      <button className="badge v" type="button" onClick={onClick} aria-label="Verified quote: show source">
        <Seal />
        <span className="lbl">Verified</span>
        <span className="cite">{citation(p)}</span>
      </button>
    );
  }
  return (
    <button className="badge u" type="button" onClick={onClick} aria-label="Quote needing verification: show source">
      <Warn />
      <span className="warnbox">Needs verification</span>
      <span className="cite">{citation(p)}</span>
    </button>
  );
}
