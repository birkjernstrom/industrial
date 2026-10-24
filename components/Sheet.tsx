"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Account, Post } from "@/lib/data";
import { formatDate } from "@/lib/format";

type Open = (post: Post, account: Account) => void;
const SheetContext = createContext<Open>(() => {});
export const useSheet = () => useContext(SheetContext);

export function SheetProvider({ children }: { children: React.ReactNode }) {
  const [item, setItem] = useState<{ post: Post; account: Account } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => setItem(null), [pathname]);

  useEffect(() => {
    if (!item) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setItem(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [item]);

  return (
    <SheetContext.Provider value={(post, account) => setItem({ post, account })}>
      {children}
      {item && (
        <div className="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && setItem(null)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-label="Source details">
            <div className="grab" />
            <SheetBody post={item.post} account={item.account} />
            <button ref={closeRef} className="close" type="button" onClick={() => setItem(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </SheetContext.Provider>
  );
}

function SheetBody({ post: p, account: a }: { post: Post; account: Account }) {
  if (p.type === "reconstructed") {
    return (
      <>
        <div className="status-line r">Reconstructed: written for this feed</div>
        <h3>What this is based on</h3>
        <p>{p.notes}</p>
        <p className="note">
          These words were written in period voice to stand in for people the record rarely quotes. They are not a historical quotation. The facts named in the note above are documented; the phrasing is invented.
        </p>
      </>
    );
  }
  const s = p.source || {};
  return (
    <>
      {p.verificationStatus === "checked" ? (
        <div className="status-line v">Verified: wording checked against the source text</div>
      ) : (
        <div className="status-line u">Needs verification: not yet checked against a reliable text</div>
      )}
      <h3>{s.title || "Source"}</h3>
      <dl>
        <dt>Author</dt>
        <dd>{s.author || a.name}</dd>
        <dt>Year</dt>
        <dd>{s.year ?? ""}</dd>
        <dt>Location</dt>
        <dd>{s.location || ""}</dd>
        <dt>Read it</dt>
        <dd>
          {s.url ? (
            <a href={s.url} target="_blank" rel="noopener">
              {s.url.replace(/^https?:\/\//, "")}
            </a>
          ) : (
            "No online copy linked"
          )}
        </dd>
        {s.textUrl && s.textUrl !== s.url && (
          <>
            <dt>Text checked</dt>
            <dd>
              <a href={s.textUrl} target="_blank" rel="noopener">
                plain-text copy
              </a>
            </dd>
          </>
        )}
        <dt>Post date</dt>
        <dd>{formatDate(p.date, p.datePrecision)}</dd>
      </dl>
      {p.notes && <p className="note">{p.notes}</p>}
      <p className="note">
        Quotations may be trimmed (marked …) but are never reworded. <Link href={`/sources#${p.id}`}>See all sources</Link>
      </p>
    </>
  );
}
