# SiteX Webapp

Admin web application for SiteX (Super Admin, Admin, Designer roles). Built with React, Vite, Bootstrap, and Axios.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Runs at `http://localhost:5173`. API requests are proxied to `http://localhost:3000` (configure in `vite.config.js`). Ensure `sitex_server` is running.

## Build

```bash
npm run build
npm run preview   # preview production build
```

## Environment

- `VITE_API_URL`: API base URL (default: `/api` when using dev proxy).

## Roles (current)

- **Super Admin**: Dashboard, Companies (CRUD + delete), Create Admins, Units (create/list).
- **Admin** (planned): Company sites, employees, materials, material requests, orders, attendance, site status.
- **Designer** (planned): TBD.

## Responsive breakpoints

- &lt; 400px: extra small mobile
- 400px–575px: mobile
- 576px–767px: tablet
- 768px–991px: laptop
- 992px–1199px: desktop
- 1200px+: TV and larger

Uses Bootstrap 5 grid and utilities; custom breakpoints in `src/styles/breakpoints.css`.
