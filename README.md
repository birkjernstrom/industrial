# The Mechanical Age

A Twitter-style feed of the British Industrial Revolution (1760–1859), built from verified public-domain quotations and clearly labelled reconstructions.

## Run

```
pnpm install
pnpm dev
```

Then open http://localhost:3000. `pnpm build` pre-renders every page (feed, sources, one page per post and per account) as static HTML.

## Deploy

Push to GitHub and import the repo on Vercel, or run `npx vercel` from this directory. No settings or environment variables are needed.

Routes: `/`, `/sources`, `/post/<id>`, `/profile/<id>`. Old `#/post/<id>` links redirect.

## Data

- `data/accounts.json`: personas. `historical: false` marks composite or editorial accounts.
- `data/posts.json`: posts. `type` is `verified` or `reconstructed`. `verificationStatus` is `checked`, `needs-verification` or `n/a`. `source.textUrl` is the plain-text copy the quote was checked against.
- `data/chapters.json`: chapter titles, ranges and intros.

## Modern voices

`data/modern.json` holds three AI rewrites of every post (plain English, casual 2026, unhinged), shown via the slider and the per-post "Modernise" button. They are generated once with Claude and committed, so the site makes no API calls.

```
ANTHROPIC_API_KEY=… pnpm modernize               # posts that have no rewrite yet
pnpm modernize c3-peterloo c4-rainhill           # regenerate specific posts
pnpm modernize --force                           # regenerate everything
```

Review the diff before committing; the rewrites are not checked automatically.

## Checking quotes

```
python3 tools/verify_quotes.py            # all verified posts
python3 tools/verify_quotes.py c3-ricardo-convinced
```

This downloads each source into `.cache/` and compares every trimmed fragment letter by letter. It reports `EXACT`, `OCR~0.98` (near-match in a scanned text: inspect by hand) or `FAIL`. It exits non-zero if any post marked `checked` fails.
