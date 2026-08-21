# Portfolio CMS backend

Express + Prisma + Postgres API backing the admin portal and the live portfolio's
content hydration. Deploys as its own Render Web Service, isolated from the
portfolio's Netlify site and the admin's Netlify site.

## One-time external setup (do this before first deploy)

1. **Postgres**: create a Render Postgres database (or any Postgres — Neon/Supabase
   work too). Copy its connection string into `DATABASE_URL`.
2. **Resend** (resend.com): create a free account, generate an API key →
   `RESEND_API_KEY`. The default `onboarding@resend.dev` sender works with no
   domain setup for low-volume transactional mail; verify your own domain later
   if you want a branded "from" address.
3. **Cloudflare R2**: create a bucket, an API token scoped to it (Account →
   R2 → Manage API tokens), and enable public access on the bucket (or connect
   a custom domain to it) so uploaded images are directly viewable. Fill in
   `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`,
   `R2_PUBLIC_BASE_URL`.
4. Copy `.env.example` to `.env` and fill in all values, including a real
   `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` (the client's first login — tell
   them to use "Change password" immediately after logging in once).

## Local development

```
npm install
npm run prisma:generate
npm run prisma:push   # creates/updates tables from schema.prisma against DATABASE_URL
npm run seed           # pre-populates content with today's live copy + creates the admin user
npm run dev
```

## Deploying to Render

- New Web Service → same GitHub repo → **Root Directory: `backend`**
- Build command: `npm install && npx prisma generate && npx prisma db push`
- Start command: `node src/server.js`
- Add every variable from `.env.example` in Render's Environment tab
  (`DATABASE_URL` can point at a Render Postgres instance in the same project)
- After the first successful deploy, run the seed once via Render's Shell tab:
  `npm run seed`

**Why `prisma db push` instead of `prisma migrate deploy`**: this schema was
authored without a live database to generate a formal migration history
against. `db push` syncs the schema directly and needs no pre-generated
migration files — the right tradeoff for a small, single-admin, "set it and
forget it" tool. If this project grows real multi-person schema changes later,
switch to `prisma migrate dev` locally (against a real dev database) to start
a proper migration history, then `prisma migrate deploy` in the Render build
command instead.

## Known v1 limitations

- `HERO.sub` and each `PROJECT`/`HOBBY` `.title` are stored as plain strings.
  The original HTML has inline styling inside those spots (a bolded phrase in
  the hero bio, a two-tone `<span class="dim">` tail in every title) that a
  plain string can't carry. Titles are captured here for record-keeping but
  intentionally NOT live-hydrated by `cms-hydrate.js` (see its comments) —
  editing/publishing a project's title has no visible effect on the live page
  in v1. If the hero bio is edited and republished, the "6+ years..." phrase
  will render as plain (non-bold) text — a known cosmetic tradeoff.
