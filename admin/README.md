# Portfolio Admin

Plain HTML/vanilla JS admin portal — no build step, matches the main portfolio's
style. Deploys as its own, separate Netlify site pointed at the same repo.

## Pages

- `login.html`, `forgot-password.html`, `reset-password.html` — auth
- `dashboard.html` — every content entry with a draft/published status chip
- `hero.html` — edit the homepage hero tag + bio
- `entry-edit.html?type=PROJECT&slug=goodflip` (or `type=HOBBY`) — shared editor
  for all 6 project pages and all 3 hobby pages (they're the same shape:
  eyebrow, title, description, gallery images)
- `media.html` — upload/manage images (direct-to-R2 presigned upload)
- `account.html` — change your own password any time, no developer needed

## Before deploying

Edit `config.js` and replace `REPLACE-WITH-YOUR-RENDER-SERVICE` with the real
Render URL once the backend is deployed (see `../backend/README.md`).

## Deploying to Netlify (second, separate site)

1. Netlify dashboard → **Add new site → Import an existing project**
2. Pick the same GitHub repo
3. **Base directory: `admin`**
4. Build command: leave blank (no build step)
5. Publish directory: `.` (relative to the base directory, i.e. `admin/`)
6. Deploy — you'll get a second, independent site URL, separate from the main
   portfolio's Netlify site.
7. Take that new admin URL and set it as `ADMIN_PUBLIC_URL` and add it to
   `ADMIN_ALLOWED_ORIGINS` in the **backend's** Render environment variables
   (see `../backend/README.md`), then redeploy the backend.

## First login

Log in with the `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` you set on the
backend, then immediately go to **Account** and set your own password — the
seed credential is only meant for that first login.
