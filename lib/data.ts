import accountsJson from "@/data/accounts.json";
import postsJson from "@/data/posts.json";
import chaptersJson from "@/data/chapters.json";

export type Account = {
  id: string;
  name: string;
  handle: string;
  bio: string;
  role: string;
  years: string;
  historical: boolean;
  avatar?: { initials: string; hue: number };
};

export type Source = {
  author?: string;
  title?: string;
  year?: number;
  location?: string;
  url?: string;
  textUrl?: string;
};

export type Post = {
  id: string;
  accountId: string;
  date: string;
  datePrecision: string;
  chapter: number;
  kind: "post" | "news";
  headline?: string;
  text: string;
  type: "verified" | "reconstructed";
  source: Source | null;
  verificationStatus: "checked" | "needs-verification" | "n/a";
  replyTo: string | null;
  quotes: string | null;
  thenVsNow: { label: string; text: string } | null;
  notes?: string;
  engagement?: { hearHears: number; reprints: number };
};

export type Chapter = { id: number; title: string; range: string; intro: string };

export const accounts = accountsJson as Account[];
export const posts = postsJson as Post[];
export const chapters = chaptersJson as Chapter[];
export const accountById: Record<string, Account> = Object.fromEntries(accounts.map((a) => [a.id, a]));
export const postById: Record<string, Post> = Object.fromEntries(posts.map((p) => [p.id, p]));

export const replyCount: Record<string, number> = {};
for (const p of posts) if (p.replyTo) replyCount[p.replyTo] = (replyCount[p.replyTo] || 0) + 1;
