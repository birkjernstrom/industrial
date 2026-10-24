export const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  inventor: "Inventor",
  thinker: "Critic",
  optimist: "Optimist",
  radical: "Radical",
  reformer: "Reformer",
  worker: "Worker",
  press: "Press",
  writer: "Writer",
  observer: "Observer",
};

export const ROLE_GROUPS = [
  { id: "workers", label: "Workers", roles: ["worker"] },
  { id: "owners", label: "Owners & inventors", roles: ["owner", "inventor"] },
  { id: "critics", label: "Critics & thinkers", roles: ["thinker"] },
  { id: "optimists", label: "Optimists", roles: ["optimist"] },
  { id: "radicals", label: "Radicals & reformers", roles: ["radical", "reformer"] },
  { id: "press", label: "Press & satire", roles: ["press"] },
  { id: "writers", label: "Poets & novelists", roles: ["writer"] },
  { id: "observers", label: "Observers", roles: ["observer"] },
];

const MONTHS = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];

export const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export function formatDate(date: string, precision?: string) {
  const [y, m, d] = date.split("-").map(Number);
  if (precision === "year" || !m) return String(y);
  if (precision === "month" || !d) return `${MONTHS[m - 1]} ${y}`;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function year(date: string) {
  return Number(date.slice(0, 4));
}

export function excerpt(t: string, n = 110) {
  return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, "") + "…" : t;
}

export const byDate = (x: { date: string }, y: { date: string }) => x.date.localeCompare(y.date);
