"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function BackButton({ label }: { label: string }) {
  const router = useRouter();
  return (
    <button className="back" type="button" onClick={() => (history.length > 1 ? router.back() : router.push("/"))}>
      {label}
    </button>
  );
}

export function ScrollToPost({ id }: { id: string }) {
  useEffect(() => {
    document.getElementById(`post-${id}`)?.scrollIntoView({ block: "center" });
  }, [id]);
  return null;
}

export function LegacyHashRedirect() {
  const router = useRouter();
  useEffect(() => {
    const m = location.hash.match(/^#\/(post|profile)\/(.+)$/);
    if (m) router.replace(`/${m[1]}/${m[2]}`);
  }, [router]);
  return null;
}
