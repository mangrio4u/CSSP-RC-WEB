# RC Sindhri Admin Panel - Deployment & Setup Guide

This document provides instructions for deploying and configuring the RC Sindhri Admin Panel on Vercel with Supabase and ImgBB.

---

## 1. Features Overview

- **Secure Admin Portal (`/admin/login`)**:
  - Email & Password authentication with bcrypt hashing.
  - JWT token generation with HTTP-only cookies and brute-force protection.
  - No public registration; strict role-based access.
- **Admin Dashboard (`/admin`)**:
  - Live statistics: Total published photos, pending submissions, total albums, approved records.
  - Recent photo submissions queue.
  - System health and integration statuses.
- **Album Management (`/admin/albums`)**:
  - Full CRUD operations for activity albums (PTY, MANZIL, Stage Drama, Climate Action, NADRA MRV, Health Outreach, etc.).
  - Safe deletion workflow (reassigns photos instead of accidental data loss).
- **Public Photo Submission (`/upload-photo`)**:
  - Community photo submission form with drag-and-drop file upload, instant thumbnail preview, and validation (10MB limit).
  - Submitter metadata, suggested category, and consent confirmation.
  - Submissions enter `pending` status by default and are hidden from the public gallery until approved.
- **ImgBB API Integration**:
  - Automatic upload of high-resolution images to ImgBB via secure serverless endpoint.
  - ImgBB API key stored in server-side environment variables (never leaked to browser).
- **Photo Moderation Queue (`/admin/submissions`)**:
  - Tabbed filters: Pending, Approved, Rejected, All.
  - Full-screen photo inspection modal.
  - Approve & assign to album, Reject, Edit, or Delete submissions.
- **Published Gallery Integration (`/gallery.html`)**:
  - Dynamic loading from `/api/gallery`.
  - Seamless category filtering and responsive lightbox viewer.

---

## 2. Database Setup (Supabase)

1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Open [`schema.sql`](schema.sql) in this repository, copy all SQL statements, paste them into the SQL editor, and click **Run**.
4. This will create:
   - `admins` table
   - `albums` table (with default seed categories)
   - `photos` table (with moderation status & submitter attribution)
   - Row Level Security (RLS) policies and performance indexes.

---

## 3. ImgBB API Setup

1. Sign up at [ImgBB](https://imgbb.com/) and get your API key from [api.imgbb.com](https://api.imgbb.com/).
2. Copy the API key for your environment variables.

---

## 4. Vercel Environment Variables

In your Vercel Project Settings (`Settings -> Environment Variables`), add:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `IMGBB_API_KEY` | ImgBB API Key for image hosting | `4a8f9...` |
| `SUPABASE_URL` | Supabase Project URL | `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Secret Key | `eyJhbGciOi...` |
| `ADMIN_JWT_SECRET` | Secret string for signing admin sessions | `your_strong_random_secret_string` |
| `ADMIN_EMAIL` | Administrator login email | `admin@rcsindhri.org` |
| `ADMIN_PASSWORD_HASH` | (Optional) Bcrypt hash of custom admin password | `$2a$10$...` |

> **Default Admin Credentials (Local / Initial Run)**:
> - **Email**: `rcsindhri@gmail.com`
> - **Password**: `Admin1122`

---

## 5. Local Testing

To test the backend and endpoints locally using Node.js:
```bash
npm test
```
Or run the local development server with Vercel CLI:
```bash
npx vercel dev
```
