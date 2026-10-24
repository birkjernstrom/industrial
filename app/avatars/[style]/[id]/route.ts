import { createAvatar, type Style } from "@dicebear/core";
import { adventurer, notionists } from "@dicebear/collection";
import { accountById, accounts } from "@/lib/data";

const STYLES: Record<string, Style<object>> = { casual: notionists, unhinged: adventurer };
type Params = { params: Promise<{ style: string; id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(STYLES).flatMap((style) => accounts.map((a) => ({ style, id: a.id })));
}

function pastel(hue: number) {
  const f = (n: number) => {
    const k = (n + hue / 30) % 12;
    const c = 0.82 - 0.3 * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255).toString(16).padStart(2, "0");
  };
  return `${f(0)}${f(8)}${f(4)}`;
}

export async function GET(_: Request, { params }: Params) {
  const { style, id } = await params;
  const a = accountById[id];
  const svg = createAvatar(STYLES[style], { seed: `${a.id}-${a.name}`, backgroundColor: [pastel(a.avatar?.hue ?? 30)] }).toString();
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=31536000, immutable" } });
}
