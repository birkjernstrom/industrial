"use client";

import { useEffect, useRef, useState } from "react";
import { chapters } from "@/lib/data";
import { ROMAN } from "@/lib/format";

export default function YearBar({ initialYear, label }: { initialYear: string; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [yr, setYr] = useState(initialYear);
  const [chapter, setChapter] = useState(label ?? "");

  useEffect(() => {
    const main = document.querySelector("main");
    const sticky = ref.current?.parentElement;
    if (!main || !sticky) return;
    const update = () => {
      const top = sticky.getBoundingClientRect().bottom + 4;
      const items = main.querySelectorAll<HTMLElement>("[data-date]");
      let current = items[0];
      for (const el of items) {
        if (el.getBoundingClientRect().bottom > top) {
          current = el;
          break;
        }
      }
      if (!current) return;
      setYr(current.dataset.date!.slice(0, 4));
      if (label !== undefined) return;
      const ch = chapters.find((c) => c.id === Number(current.dataset.chapter));
      setChapter(ch ? `${ROMAN[ch.id]}. ${ch.title}` : "");
    };
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    };
    const mo = new MutationObserver(update);
    mo.observe(main, { childList: true, subtree: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [label]);

  return (
    <div className="yearbar" aria-live="polite" ref={ref}>
      <span className="year">{yr}</span>
      <span className="chapter">{chapter}</span>
    </div>
  );
}
