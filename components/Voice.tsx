"use client";

import { createContext, useContext, useEffect, useState } from "react";
import modernJson from "@/data/modern.json";
import type { Post } from "@/lib/data";

type Version = { headline: string; text: string };
type Level = "plain" | "casual" | "unhinged";
const modern = modernJson as Record<string, Record<Level, Version>>;

const KEYS: (Level | null)[] = [null, "plain", "casual", "unhinged"];
export const LEVEL_NAMES = ["Original", "Plain English", "Casual", "Unhinged"];

type Global = { level: number; setLevel: (n: number) => void; lastModern: number };
const GlobalVoice = createContext<Global>({ level: 0, setLevel: () => {}, lastModern: 2 });
const PostFlip = createContext<[boolean, (v: boolean) => void] | null>(null);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [level, setLevelState] = useState(0);
  const [lastModern, setLastModern] = useState(2);

  useEffect(() => {
    try {
      const n = Number(localStorage.getItem("voice"));
      if (n >= 1 && n <= 3) {
        setLevelState(n);
        setLastModern(n);
      }
    } catch {}
  }, []);

  const setLevel = (n: number) => {
    setLevelState(n);
    if (n) setLastModern(n);
    try {
      localStorage.setItem("voice", String(n));
    } catch {}
  };

  return <GlobalVoice.Provider value={{ level, setLevel, lastModern }}>{children}</GlobalVoice.Provider>;
}

export function VoiceScope({ children }: { children: React.ReactNode }) {
  const state = useState(false);
  const { level } = useContext(GlobalVoice);
  useEffect(() => state[1](false), [level]);
  return <PostFlip.Provider value={state}>{children}</PostFlip.Provider>;
}

export function useLevel() {
  const { level, lastModern } = useContext(GlobalVoice);
  const flip = useContext(PostFlip);
  return flip?.[0] ? (level ? 0 : lastModern) : level;
}

function useShownLevel(id: string) {
  const level = useLevel();
  return modern[id] ? level : 0;
}

export function VoiceText({
  post,
  field,
  className,
  as: Tag = "div",
}: {
  post: Post;
  field: "text" | "headline";
  className?: string;
  as?: "div" | "h3" | "p";
}) {
  const shown = useShownLevel(post.id);
  const key = KEYS[shown];
  const value = key ? modern[post.id][key][field] || post[field] : post[field];
  const cls = [className, key && "modern", key === "unhinged" && "unhinged"].filter(Boolean).join(" ");
  return <Tag className={cls || undefined}>{value}</Tag>;
}

export function VoiceNote({ post }: { post: Post }) {
  const shown = useShownLevel(post.id);
  if (!shown) return null;
  return <div className="ai-note">AI rewrite · {LEVEL_NAMES[shown]}</div>;
}

export function VoiceToggle({ post }: { post: Post }) {
  const flip = useContext(PostFlip);
  const shown = useShownLevel(post.id);
  if (!flip || !modern[post.id]) return null;
  return (
    <button className="voice-btn" type="button" aria-pressed={flip[0]} onClick={() => flip[1](!flip[0])}>
      {shown ? "Original" : "Modernise"}
    </button>
  );
}

export function VoiceBar() {
  const { level, setLevel } = useContext(GlobalVoice);
  return (
    <div className="voicebar">
      <label htmlFor="voice-range">1800s</label>
      <input
        id="voice-range"
        type="range"
        min={0}
        max={3}
        step={1}
        value={level}
        onChange={(e) => setLevel(Number(e.target.value))}
        aria-valuetext={LEVEL_NAMES[level]}
      />
      <span>2026</span>
      <output htmlFor="voice-range" className={level ? "on" : undefined}>
        {LEVEL_NAMES[level]}
      </output>
    </div>
  );
}
