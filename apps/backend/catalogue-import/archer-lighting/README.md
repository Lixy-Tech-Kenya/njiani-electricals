# Archer Lighting catalogue import

Product photos extracted from the Archer Lighting (Zhongshan Archer Lighting Co.) supplier
sourcing catalogues, matched to their supplier item codes (e.g. `P9609-1`).

- `manifest.json` — one entry per item code: `{ code, slug, images: [...] }`
- `images/` — processed photos (resized to max 1200px, WebP, quality 82), named `<slug>-<n>.webp`

These are **not** retail-ready product data — the source catalogues only contain item codes,
no names, prices, descriptions or categories.

## Importing into the database

Run from `apps/backend`, with `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` set:

```bash
pnpm run import:archer-catalogue
```

This uploads each image to Supabase Storage and creates one `Product` per item code with:

- `sku`: `ARCHER-<code>`, `slug`: `archer-<code>`
- `name`: `Archer <code>` (placeholder — rename in admin)
- `price`: 0, `category`: "Other Items", `status`: `INACTIVE`

Every product is created **inactive** (hidden from the storefront) so nothing reaches customers
until an admin reviews it in the admin panel — sets a real name, price, category and description,
then activates it. The script is idempotent: re-running it skips SKUs that already exist.
