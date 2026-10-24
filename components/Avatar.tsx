"use client";

import type { Account } from "@/lib/data";
import { useLevel } from "./Voice";

function Engraved({ account }: { account: Account }) {
  const hue = account.avatar?.hue ?? 30;
  const initials = account.avatar?.initials ?? "?";
  const composite = account.historical === false;
  const id = `h${account.id.replace(/[^a-z0-9]/gi, "")}`;
  const size = initials.length > 2 ? 15 : initials.length === 2 ? 19 : 24;
  return (
    <svg viewBox="0 0 48 52" role="img" aria-label={account.name}>
      <defs>
        <pattern id={id} width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <line x1="0" y1="0" x2="0" y2="3" stroke={`hsl(${hue} 35% 30% / .35)`} strokeWidth="1" />
        </pattern>
      </defs>
      <ellipse cx="24" cy="26" rx="22.5" ry="24.5" fill={`hsl(${hue} 30% 82%)`} stroke={`hsl(${hue} 30% 28%)`} strokeWidth="1.5" />
      <ellipse
        cx="24"
        cy="26"
        rx="19.5"
        ry="21.5"
        fill={`url(#${id})`}
        stroke={`hsl(${hue} 30% 28%)`}
        strokeWidth="0.75"
        strokeDasharray={composite ? "2 2" : undefined}
      />
      <ellipse cx="24" cy="26" rx="14" ry="16" fill={`hsl(${hue} 32% 88%)`} />
      <text x="24" y={26 + size * 0.36} textAnchor="middle" fontFamily="var(--display)" fontSize={size} fill={`hsl(${hue} 40% 22%)`}>
        {initials}
      </text>
    </svg>
  );
}

function Flat({ account }: { account: Account }) {
  const hue = account.avatar?.hue ?? 30;
  const initials = account.avatar?.initials ?? "?";
  const size = initials.length > 2 ? 14 : initials.length === 2 ? 18 : 22;
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label={account.name}>
      <circle cx="24" cy="24" r="24" fill={`hsl(${hue} 55% 42%)`} />
      <text x="24" y={24 + size * 0.36} textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="600" fontSize={size} fill="#fff">
        {initials}
      </text>
    </svg>
  );
}

export default function Avatar({ account }: { account: Account }) {
  const level = useLevel();
  if (level === 0) return <Engraved account={account} />;
  const composite = account.historical === false ? " composite" : "";
  if (level === 1)
    return (
      <span className={`modern-avatar${composite}`}>
        <Flat account={account} />
      </span>
    );
  return (
    <span className={`modern-avatar${composite}`}>
      <img src={`/avatars/${level === 2 ? "casual" : "unhinged"}/${account.id}`} alt={account.name} />
    </span>
  );
}
