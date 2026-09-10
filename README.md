# Wanderlist

A calm, unhurried web app for a group of friends travelling together — the plan, the notices,
who owes what, and every photo from the road, all in one place.

## The three requirements

| Requirement | How it's met |
| --- | --- |
| **Database** | SQLite via Prisma 7 (`prisma/schema.prisma`, 8 models). Swap to Postgres by changing the datasource provider and adapter. |
| **Authentication** | Email + password, bcrypt-hashed, with signed JWT sessions in an httpOnly cookie. Every page and every mutation is gated. |
| **Web app** | Next.js 16 (App Router, React 19) — server-rendered, works on phones and laptops. |

## The look

Warm paper, sea glass and late-afternoon sun: a soft gradient banner across the top of every page,
an illustrated horizon on the sign-in screen, photos in tilted polaroid frames, and handwritten
notes in the quiet corners. All the artwork is inline SVG tinted from CSS variables, so it follows
the light and dark themes and costs no extra requests.

## Getting started

```bash
npm install
npm run setup    # creates the database and loads the sample trip
npm run dev      # http://localhost:3000
```

Sign in with any of the seeded travellers — the password is `wanderlist`:

| Email | Name |
| --- | --- |
| `mei@example.com` | Mei Tan (organiser) |
| `arjun@example.com` | Arjun Rao |
| `sofia@example.com` | Sofia Reyes |
| `daniel@example.com` | Daniel Koh |

To join as a brand new person instead, register at `/register` with the invite code
**`KYOTO26`**. The code is shown in the footer of every page so it's easy to pass on.

## Putting your own trip in

Three ways, depending on how clean a start you want:

**Edit the trip you've got.** Open the **Trip** tab and change the name, destination, dates,
currency and invite code. Then use *Clear the sample content* on the same page to delete the
example plans, announcements and costs — your accounts and any photos stay.

**Start a second trip alongside it.** Register a new account at `/register` and leave the invite
code blank. You'll land on a start page where you can create your own trip and become its organiser.

**Wipe everything and begin from nothing.**

```bash
npm run db:reset
```

That empties the database and the uploads folder. Register an account, choose *I'm starting the
trip*, and fill it in from scratch.

## What's inside

**Itinerary** — every day of the trip laid out as a card, with today highlighted. Add plans with a
time, place, kind (travel, stay, food, explore, note) and notes. Anything scheduled outside the trip
window still gets its own day rather than disappearing.

**Announcements** — the thing you'd otherwise repeat five times in the group chat. Posts can be
pinned to the top, and everyone can reply underneath. You can only delete your own.

**Costs** — enter what something cost and who it was for. The split is previewed live as you type
and the odd cents are distributed so the shares always add up to the total, to the cent. From that
it works out what everyone paid, what they owe, and the shortest set of transfers that makes the
group even again. Every row expands to show the full per-person breakdown.

**Gallery** — drag in photos and videos (several at once), and anyone on the trip can download the
originals. Photos sit in tilted paper frames that straighten as you point at them. Videos stream
with range requests so they can be scrubbed without downloading in full.

**Trip** — the trip's own details: name, destination, dates, currency and invite code, who's coming,
a count of what's in it, and the button to clear the sample content.

## How the money maths works

Amounts are stored as whole minor units, never floats, so nothing drifts. `splitEvenly` in
`src/lib/money.ts` hands the remainder out one unit at a time — 83.00 across three people becomes
27.67 / 27.67 / 27.66, summing back to exactly 83.00. `settleUp` in `src/lib/settle.ts` repeatedly
matches the largest debtor with the largest creditor, which settles any group in at most
*n − 1* transfers.

Zero-decimal currencies are handled properly: pick JPY and ¥10,000 across three people is
¥3,334 / ¥3,333 / ¥3,333, not a hundredth of a yen anywhere. Changing a trip's currency relabels
existing amounts rather than converting them, so set it before you start entering costs.

## Privacy of uploads

Uploaded files are written to `uploads/` — deliberately **outside** `public/`, so they are never
served statically. Every read goes through `/api/media/[id]`, which checks that you're signed in
*and* a member of the trip the file belongs to. Files are stored under random UUID names, so a
user-supplied filename can never influence the path on disk.

## Project layout

```
prisma/schema.prisma        the data model
prisma/seed.ts              sample trip, people, plans, announcements and costs
src/lib/db.ts               Prisma client
src/lib/session.ts          sessions, requireUser, requireTrip
src/lib/money.ts            minor units, currencies, formatting, even splitting
src/lib/settle.ts           settle-up algorithm
src/lib/media-store.ts      saving and removing uploads
src/lib/trip-input.ts       trip validation, shared by create and edit
src/components/scenery.tsx  the inline-SVG horizon, flight path and postmark
src/actions/                server actions, one file per feature
src/app/(auth)/             sign in / register
src/app/start/              create or join a trip when you're not on one yet
src/app/(app)/              itinerary, announcements, expenses, gallery
src/app/api/media/[id]/     authenticated media streaming and download
```

## Before deploying

1. Set `SESSION_SECRET` in `.env` to a long random string — the checked-in value is a placeholder.
   Changing it signs everyone out.
2. `uploads/` and `dev.db` need to be on persistent storage. On a platform with an ephemeral
   filesystem (Vercel and friends), move media to object storage and the database to Postgres.
3. Serve over HTTPS — session cookies are marked `secure` automatically in production.
4. If you run more than one instance behind a load balancer, set
   `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` to the same value on each one, or form submissions will
   fail on whichever instance didn't build the page.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | development server |
| `npm run build` / `npm start` | production build and serve |
| `npm run setup` | create the database and seed it |
| `npm run db:seed` | re-seed (wipes and reloads the sample data) |
| `npm run db:reset` | empty the database and uploads folder completely |
| `npm run db:studio` | browse the database in Prisma Studio |
