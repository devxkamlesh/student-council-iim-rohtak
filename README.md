<div align="center">

# Student Council — IIM Rohtak

**The official website of the Student Council, IIM Rohtak.**
A fast, fully admin-driven web app where the council manages every piece of
content — team, committees, clubs, events, gallery, navigation and branding —
without touching a line of code.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com/)

</div>

---

## ✨ Overview

Built with **Next.js 16 (App Router)** and **React Server Components** for a fast,
SEO-friendly public site, backed by a **MySQL** database and a custom,
permission-controlled admin panel. Everything that changes year to year —
elected teams, clubs, events, photos, even the menu — is editable through the UI.

---

## 🚀 Features

### Public site
- ⚡ Server-rendered pages for speed and SEO
- 👥 Senior Team by council batch (current + archived)
- 🏛️ Committees & Clubs (domain + recreational) with rich descriptions
- 🎟️ Flagship events (Infusion, TEDxIIMRohtak) with a video carousel
- 🚌 Leave procedure, shuttle & service timings
- 📝 Student forms (grievance, wheelchair) + live class timetable
- 📅 Restricted, permission-gated calendar (event booking + points forms)
- 🔍 JSON-LD structured data, OpenGraph, sitemap & robots

### Admin panel
- 🔐 Custom auth — email/password + Google sign-in (domain-restricted)
- 🛡️ Role-based access control with granular permissions
- 🧩 Schema-driven content manager (add a section in a few lines of config)
- 🖼️ Cloudinary gallery with an **in-browser image editor** (crop, rotate,
  multi-layer draggable text)
- ✍️ Rich-text editor with server-side HTML sanitization
- 🧭 Drag-and-drop navigation menu (main items + sub-pages)
- 🎨 Site settings — swap logo, hero banner & footer logo
- 📊 Dashboard with content, grievance & user analytics

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, RSC) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS 4 |
| Database | MySQL (`mysql2`) |
| Auth | Custom sessions (bcrypt + SHA-256), Google OAuth |
| Media | Cloudinary (`f_auto`, `q_auto`) |
| Validation | Zod |
| Hosting | Hostinger |

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- A MySQL database
- A Cloudinary account (for the gallery)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local (see below) and fill in your credentials

# 3. Set up the database tables (run once)
npx tsx scripts/setup-auth.ts          # auth, roles & first admin
npx tsx scripts/setup-standard-roles.ts # ready-to-assign roles

# 4. Start the dev server
npm run dev
```

Visit **http://localhost:3000** for the site and **/admin** for the panel.

### Environment variables (`.env.local`)

```env
# MySQL
DB_HOST=
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
# ALLOWED_EMAIL_DOMAIN=iimrohtak.ac.in

# Cloudinary (gallery & uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

> `.env.local` is gitignored — never commit real credentials.

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm start` | Run the production server |
| `npm run lint` | Lint the project |

Database/setup helpers live in `scripts/` (run with `npx tsx scripts/<file>.ts`).

---

## 🗂️ Project Structure

```
src/
├─ app/            # routes (public pages, /admin, /api)
├─ components/     # shared & admin UI components
└─ lib/            # db, auth, queries, config, utilities
scripts/           # one-off setup & migration scripts
database/          # SQL schema
public/            # static assets
```

---

## 🔒 Security

- Session tokens stored as SHA-256 hashes; raw token in an HTTP-only cookie
- bcrypt password hashing with timing-safe login
- Per-account and per-IP brute-force protection
- Origin-checked CSRF on all state-changing requests
- Server-side HTML sanitization for all rich-text content

---

## 📄 License

This project is provided for the Student Council, IIM Rohtak. All rights reserved.

---

<div align="center">

Designed &amp; Developed by **[Kamlesh Choudhary](https://devxkamlesh.com)** ·
[GitHub](https://github.com/devxkamlesh) · [LinkedIn](https://linkedin.com/in/devxkamlesh)

</div>
