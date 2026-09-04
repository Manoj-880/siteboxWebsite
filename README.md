# SiteBox Marketing Website

Public marketing site for **SiteBox** — construction & interior operations platform.
Matches the Sitebox Pulse brand used in mobile + admin web (jet `#0A0A0A` + lime `#D1E105`).

## Stack

- React 18 + Vite
- CSS-native motion (no animation library)
- Mobile-first responsive layout

## Develop

```bash
npm install
npm run dev
```

Runs at **http://localhost:5174** (so it can sit beside the admin webapp on `5173`).

## Build

```bash
npm run build
npm run preview
```

## Env

Optional in `.env`:

```
VITE_PORTAL_URL=https://testapp.getsitebox.com
```

Used for “Open portal” CTAs.

## Content map

| Section | Purpose |
|--------|---------|
| Hero | Brand-first SiteBox + command-center promise |
| Features | Command center, sites, attendance, tasks/updates, materials/orders, payments |
| Roles | Admin/Designer web vs Supervisor/Vendor/Contractor/Factory mobile |
| How it works | Onboard → sites/team → operate |
| Demo | Mailto demo request + portal link |
