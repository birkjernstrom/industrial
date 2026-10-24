"use client";

import { useEffect, useState } from "react";

const current = () =>
  document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => setTheme(current()), []);

  const toggle = () => {
    const next = current() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  };

  return (
    <button type="button" onClick={toggle}>
      {theme === "dark" ? "Daylight" : "Gaslight"}
    </button>
  );
}
