import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Masthead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <header className="masthead">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p className="sub">{sub}</p>
      <nav>
        <Link href="/">The Feed</Link>
        <Link href="/sources">Sources &amp; Method</Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}

export function FeedMasthead() {
  return (
    <Masthead
      eyebrow="A Feed of the Industrial Revolution · 1760–1859"
      title="The Mechanical Age"
      sub="What they feared, hoped for and argued about, in their own words where we have them."
    />
  );
}
