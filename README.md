# CvSUFound

A lost and found website for the CvSU community. Students and staff post items they lost or found,
search what others posted, and send claim requests that the claim desk reviews.

The app starts **empty**. There are no sample items. Every item is created by a real user.

## Tech stack

| Part | Tool |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 (green and gold theme in `src/app/globals.css`) |
| Database, login, photos | Supabase (Postgres, Auth, Storage) |
| Forms | React Hook Form + Zod |
| Hosting | Vercel |

## Pages

| URL | What it does | Who can open it |
|---|---|---|
| `/` | Home: search, recent reports, how it works | Everyone |
| `/items` | Browse with search, Lost/Found tabs, category and location filters | Everyone |
| `/items/[id]` | Item details and the claim form | Everyone (claiming needs login) |
| `/report` | Post a lost or found item, with an optional photo | Logged in |
| `/login`, `/signup` | Account pages | Everyone |
| `/my-reports` | Your posts and the requests you sent | Logged in |
| `/admin` | Review claims, mark items returned, delete listings | Admins only |

## How a claim works

1. Someone posts a **found** item (or a **lost** report).
2. The owner opens a found item and sends **"This is mine"** with proof. A finder opens a lost report
   and sends **"I found this"**.
3. The claim desk sees the request on `/admin` with the person's name, student number and email,
   then approves or rejects it. Contact details are never shown publicly.
4. After the handover, the item is marked **returned**.

## Run it on your computer

```bash
npm install --legacy-peer-deps
cp .env.example .env.local      # on Windows PowerShell: Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000. Until you add Supabase keys, the site still opens and shows a notice
that Supabase isn't connected.

## Set up Supabase (one time)

1. Create a project at supabase.com. Choose a region close to the Philippines (Singapore).
2. Open **SQL Editor** and run these files from `supabase/migrations/`, **in order**:
   1. `0001_schema.sql` (tables)
   2. `0002_policies.sql` (security rules and the photo bucket)
   3. `0003_seed_lookups.sql` (category and location choices; edit the locations first)
   4. `0004_optional_email_domain.sql` (optional: only allow CvSU emails)
3. Open **Project Settings, API** and copy the **Project URL** and the **anon public** key (or the
   newer **publishable** key). Paste them into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
   Restart `npm run dev` after editing `.env.local`.
4. Open **Authentication, URL Configuration**:
   - **Site URL**: `http://localhost:3000` (change to your Vercel URL after deploying)
   - **Redirect URLs**: add `http://localhost:3000/auth/callback`
5. Under **Authentication, Sign In / Providers, Email**, turn off **Confirm email** and save.
   This app uses email and password registration without email verification. New users are signed
   in immediately; Supabase must have this setting disabled to stop sending confirmation emails.
6. Sign up on your site, then make yourself admin. Edit the email in `supabase/make_admin.sql` and
   run it in the SQL Editor.

Email ownership is not verified with this configuration, so an account's email address is not
proof of identity or ownership of a campus email address.

## Edit the claim desk details

Open `src/lib/site.ts` and replace the `[OFFICE NAME]`, `[BUILDING / ROOM]`, `[OFFICE HOURS]` and
`[EMAIL / CONTACT NO.]` placeholders.

## Deploy to Vercel

1. Push the project to GitHub.
2. In Vercel, **Add New, Project**, then import the repo.
3. Add the same environment variables from `.env.local`.
4. Deploy. Then go back to Supabase **Authentication, URL Configuration** and set the **Site URL**
   to your Vercel URL, and add `https://YOUR-SITE.vercel.app/auth/callback` to **Redirect URLs**.

## Folder map

```
src/
  app/                 pages (each folder is a URL)
    page.tsx           home
    items/             browse and item details
    report/            report form page
    login/ signup/     account pages
    my-reports/        user's own posts and requests (+ actions.ts)
    admin/             claim desk (+ actions.ts)
    auth/              sign-out action and email-confirm callback
  components/
    layout/            Navbar, Footer, Logo
    items/             ItemCard, ItemFilters, SearchForm, ReportForm, ClaimForm, EmptyState
    auth/              LoginForm, SignupForm
    ui/                Button, Input, Badge, icons
  lib/
    supabase/          env, browser client, server client
    validations/       Zod schemas for every form
    auth.ts            current user and profile
    queries.ts         database reads for items and lookups
    site.ts            claim desk details and site settings
    utils.ts           small helpers
  proxy.ts             keeps the login fresh and protects /report, /my-reports, /admin
  types/database.ts    TypeScript types that mirror the tables
supabase/
  migrations/          SQL to run in the Supabase SQL Editor
  make_admin.sql       gives an account the admin role
.github/copilot-instructions.md   rules for the coding agent
```

## Security notes

- Row Level Security is on for every table. The database decides who can read or change data, so a
  bug in the website can't expose other people's details.
- Only the **anon/publishable** key is used in this project. Never put the Supabase
  `service_role` key in the app or in any `NEXT_PUBLIC_` variable.
- Photos are public so they load on the site. Remind users not to photograph ID numbers or card
  details.
- The email-domain check on the signup form is only a convenience. The real lock is
  `0004_optional_email_domain.sql`.
