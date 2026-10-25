# CvSUFound: instructions for the coding agent

Read this file and `README.md` before changing anything. Also read `AGENTS.md`: this project uses
**Next.js 16**, which differs from older versions. Before you write Next.js code, check the bundled
docs in `node_modules/next/dist/docs/` for the feature you are touching.

## What this project is

CvSUFound is a lost and found website for the CvSU school community. Users post lost or found
items, browse and search them, and send claim requests. A claim desk (admin role) reviews requests.
The app starts with **no items**. Never add sample or fake items to the app or database.

## Stack

- Next.js 16 App Router, React 19, TypeScript (strict), Tailwind CSS v4
- Supabase: Postgres, Auth (email + password), Storage (bucket `item-photos`)
- React Hook Form + Zod for forms, `@supabase/ssr` for cookie-based sessions
- Deployed on Vercel

## Project map

- `src/app/**` pages and server actions (`actions.ts` files)
- `src/components/{layout,items,auth,ui}` reusable components
- `src/lib/supabase/{env,client,server}.ts` Supabase setup (browser vs server clients)
- `src/lib/queries.ts` database reads, `src/lib/auth.ts` current user/profile
- `src/lib/validations/item.ts` all Zod schemas
- `src/lib/site.ts` claim desk details and site settings
- `src/proxy.ts` session refresh and route protection (this is Next 16's replacement for `middleware.ts`)
- `src/types/database.ts` hand-written types that must match `supabase/migrations/0001_schema.sql`
- `supabase/migrations/*.sql` the database. Never edit a migration that was already run; add a new numbered file instead.

## Database summary

- `profiles` (id, email, full_name, student_number, role `user|admin`)
- `categories`, `locations` (lookup lists with `slug`)
- `items` (type `lost|found`, title, description, category_id, location_id, location_detail,
  event_date, photo_path, status `open|claimed|returned`, reporter_id)
- `claims` (item_id, claimant_id, message, status `pending|approved|rejected`, unique per item+user)
- Row Level Security is on everywhere. Items, categories and locations are publicly readable.
  Profiles and claims are visible only to their owner and admins.

## Rules for Next.js 16 with Cache Components (`cacheComponents: true`)

- Anything that reads **cookies, headers, `searchParams`, `params`, or fetches uncached data** must
  run inside a `<Suspense>` boundary. The pattern used here: the exported `page.tsx` component is a
  small synchronous shell, and an inner `async` component (wrapped in `<Suspense>`) does the data
  work. Follow this pattern for every new page.
- Do not call `new Date()`, `Date.now()` or `Math.random()` while rendering. Use them only inside
  event handlers, effects, or request-time code.
- Do not use the old route segment configs (`export const dynamic`, `revalidate`, `fetchCache`).
- Use `proxy.ts`, not `middleware.ts`.
- `params` and `searchParams` are Promises. `await` them. Use the generated `PageProps<"/route">`
  and `LayoutProps<"/">` types.
- Run `npx next typegen` after adding a new route so the route types update.
- Server Components fetch data. Add `"use client"` only for forms and interactive widgets.
- Mutations go through Server Actions (`"use server"`) or the browser Supabase client for forms
  that need file uploads.

## Security rules (important)

- Use only the anon/publishable key. **Never** use or expose the `service_role` key.
- Never trust the browser. Every admin action must check the role on the server
  (see `requireAdmin` in `src/app/admin/actions.ts`) and RLS must also allow it.
- Never show a user's email, student number, or other contact details publicly. Only admins see
  claimant details on `/admin`.
- Validate all form input with the Zod schemas in `src/lib/validations/item.ts`.
- Only allow redirects to paths that start with `/` and not `//` (see `safeNext`).
- If you add a table, add RLS policies in a new migration in the same change.

## Code style

- TypeScript strict, no `any`. Prefer small components with clear props.
- Tailwind classes only. Theme colours are defined in `src/app/globals.css`:
  `brand-50…900` (green), `gold-200/300/400`, `ink-500/700/900`. Fonts: `font-display` for
  headings, default sans for body.
- Keep accessibility: real `<button>` and `<a>`, `<label>` for every input, visible focus,
  touch targets at least 44px, text contrast at least 4.5:1.
- Use the shared components in `src/components/ui` (Button, ButtonLink, Input, Select, Textarea,
  Field, Badge) instead of re-styling elements.
- Keep the green and gold look. Do not add emoji to the UI.
- Empty states are friendly messages, never fake data.

## Before you finish any task

1. `npx tsc --noEmit` has no errors
2. `npm run lint` has no errors
3. `npm run build` succeeds (if Google Fonts can't be reached offline, say so)
4. Explain what changed in plain language and list any SQL the user must run in Supabase

## Things not to do

- Do not change `next.config.ts`, `package.json`, or `tsconfig.json` unless the task needs it.
- Do not commit `.env.local` or any real key.
- Do not rename or restructure folders without being asked.
- Do not install a new package without telling the user why.
