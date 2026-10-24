"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { accountById, chapters, posts, type Post } from "@/lib/data";
import { byDate, ROLE_GROUPS, ROMAN } from "@/lib/format";
import { Fleuron } from "./icons";
import { PostList } from "./Post";
import { VoiceBar } from "./Voice";
import YearBar from "./YearBar";

type State = { chapter: number | null; groups: string[]; verifiedOnly: boolean };
let saved: State = { chapter: null, groups: [], verifiedOnly: false };

function threadOrder(list: Post[]) {
  const ids = new Set(list.map((p) => p.id));
  const kids: Record<string, Post[]> = {};
  const roots: Post[] = [];
  for (const p of list) {
    if (p.replyTo && ids.has(p.replyTo)) (kids[p.replyTo] ||= []).push(p);
    else roots.push(p);
  }
  const out: Post[] = [];
  const walk = (p: Post) => {
    out.push(p);
    (kids[p.id] || []).sort(byDate).forEach(walk);
  };
  roots.sort(byDate).forEach(walk);
  return out;
}

export default function Feed() {
  const [state, setState] = useState(saved);
  const shown = useRef(state);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    saved = state;
    if (shown.current === state) return;
    shown.current = state;
    const main = mainRef.current!;
    const sticky = document.querySelector<HTMLElement>(".sticky")!;
    window.scrollTo({ top: main.offsetTop - sticky.offsetHeight + 1 });
  }, [state]);

  const roles = new Set(state.groups.flatMap((g) => ROLE_GROUPS.find((x) => x.id === g)!.roles));
  const filtered = posts.filter(
    (p) =>
      (!state.chapter || p.chapter === state.chapter) &&
      (!state.verifiedOnly || p.verificationStatus === "checked") &&
      (!roles.size || roles.has(accountById[p.accountId].role))
  );
  const toggleGroup = (g: string) =>
    setState((s) => ({ ...s, groups: s.groups.includes(g) ? s.groups.filter((x) => x !== g) : [...s.groups, g] }));

  return (
    <>
      <div className="sticky">
        <YearBar initialYear="1760" />
        <VoiceBar />
        <div className="filters">
          <div className="chiprow" aria-label="Filter by chapter">
            <button className="chip" type="button" aria-pressed={!state.chapter} onClick={() => setState((s) => ({ ...s, chapter: null }))}>
              All chapters
            </button>
            {chapters.map((c) => (
              <button key={c.id} className="chip" type="button" aria-pressed={state.chapter === c.id} title={c.title} onClick={() => setState((s) => ({ ...s, chapter: c.id }))}>
                {ROMAN[c.id]} · {c.range}
              </button>
            ))}
          </div>
          <div className="chiprow" aria-label="Filter by account type">
            <button className="chip verified" type="button" aria-pressed={state.verifiedOnly} onClick={() => setState((s) => ({ ...s, verifiedOnly: !s.verifiedOnly }))}>
              Verified only
            </button>
            {ROLE_GROUPS.map((g) => (
              <button key={g.id} className="chip" type="button" aria-pressed={state.groups.includes(g.id)} onClick={() => toggleGroup(g.id)}>
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <main className="feed" ref={mainRef}>
        {chapters.map((c) => {
          const inCh = filtered.filter((p) => p.chapter === c.id);
          if (!inCh.length) return null;
          return (
            <Fragment key={c.id}>
              <section className="chapter-head" data-date={inCh[0].date} data-chapter={c.id}>
                <div className="numeral">Chapter {ROMAN[c.id]}</div>
                <h2>{c.title}</h2>
                <div className="range">{c.range}</div>
                <p>{c.intro}</p>
                <Fleuron />
              </section>
              <PostList list={threadOrder(inCh)} />
            </Fragment>
          );
        })}
        {filtered.length ? (
          <div className="footer">
            Showing {filtered.length} of {posts.length} posts. <Link href="/sources">Sources &amp; methodology</Link>
          </div>
        ) : (
          <div className="empty">No posts match these filters.</div>
        )}
      </main>
    </>
  );
}
