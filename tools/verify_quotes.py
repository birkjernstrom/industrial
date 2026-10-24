#!/usr/bin/env python3
import difflib
import hashlib
import html
import json
import os
import re
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, ".cache", "sources")
THRESHOLD = 0.9


def fetch(url):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest() + ".txt")
    if not os.path.exists(path):
        req = urllib.request.Request(url, headers={"User-Agent": "mechanical-age-quote-checker"})
        data = urllib.request.urlopen(req, timeout=120).read()
        with open(path, "wb") as f:
            f.write(data)
    with open(path, encoding="utf-8", errors="ignore") as f:
        return f.read()


def letters(text):
    if re.search(r"<(!doctype|html)", text[:2000], re.I):
        text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    text = re.sub(r"\b\d{1,4}\s+[A-Z][A-Z.]{3,}(?:\s+[A-Z][A-Z.]{3,})*", " ", text)
    text = re.sub(r"-\s*\n\s*", "", text)
    return re.sub(r"[^a-z]", "", text.lower())


def fragments(text):
    parts = re.split(r"…|\.\.\.", text)
    return [p for p in (letters(x) for x in parts) if len(p) >= 12]


def best_window(frag, src):
    k = 10
    votes = {}
    for i in range(0, len(frag) - k + 1, k):
        chunk = frag[i:i + k]
        start = 0
        hits = 0
        while hits < 50:
            j = src.find(chunk, start)
            if j < 0:
                break
            votes[j - i] = votes.get(j - i, 0) + 1
            start = j + 1
            hits += 1
    if not votes:
        return 0.0, -1
    best = 0.0
    pos = -1
    for off, _ in sorted(votes.items(), key=lambda kv: -kv[1])[:5]:
        off = max(0, off)
        window = src[off:off + len(frag)]
        r = difflib.SequenceMatcher(None, frag, window, autojunk=False).ratio()
        if r > best:
            best, pos = r, off
    return best, pos


def main():
    posts = json.load(open(os.path.join(ROOT, "data", "posts.json"), encoding="utf-8"))
    only = set(sys.argv[1:])
    failures = 0
    for p in posts:
        if p["type"] != "verified" or (only and p["id"] not in only):
            continue
        url = (p.get("source") or {}).get("textUrl")
        if not url:
            print(f"SKIP  {p['id']:28} no textUrl ({p['verificationStatus']})")
            continue
        try:
            src = letters(fetch(url))
        except Exception as e:
            print(f"ERROR {p['id']:28} {e}")
            failures += 1
            continue
        worst = 1.0
        for frag in fragments(p["text"]):
            if frag in src:
                continue
            r, _ = best_window(frag, src)
            worst = min(worst, r)
        if worst == 1.0:
            verdict = "EXACT"
        elif worst >= THRESHOLD:
            verdict = f"OCR~{worst:.2f}"
        else:
            verdict = f"FAIL {worst:.2f}"
            if p["verificationStatus"] == "checked":
                failures += 1
        print(f"{verdict:9} {p['id']:28} [{p['verificationStatus']}]")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
