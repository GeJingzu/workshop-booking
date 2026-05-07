# Workshop & Class Booking — SWD Assignment 3

A full-stack workshop booking platform built for the Griffith College Dublin
**Server-side Web Development** module (Assignment 3, 60% weighting).

Users can register as one of three roles, browse and book workshops, or
create and manage their own events. An admin oversees all users and the
overall system.

- **Group**: Jikun Li & Jingzu Ge
- **Module**: SWD (Semester 2)
- **Submission**: 7 May 2026

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14.2 (App Router, JavaScript) |
| UI | React 18 |
| Database | MySQL 8 |
| DB driver | `mysql2` (connection pool) |
| Auth | bcryptjs password hashing + HttpOnly cookies (`next/headers`) |
| Style | Plain CSS + inline styles (no extra UI library) |

No frameworks beyond what was covered in the course are used.

---

## Prerequisites

Install once on your machine:

1. [Node.js](https://nodejs.org/) v18 or newer (`node -v` to verify)
2. [MySQL 8](https://dev.mysql.com/downloads/mysql/) running on `localhost:3306`
3. Git

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/jikunli-student/Jikun_Li_Jingzu_Ge_SWD_A3.git
cd Jikun_Li_Jingzu_Ge_SWD_A3/workshop-booking-app
npm install
```

### 2. Configure database credentials

Copy the env template and edit it with your MySQL root password:

```bash
cp .env.local.example .env.local
```

Then open `.env.local` and set `DB_PASSWORD` to your MySQL root password.
The other defaults (`localhost`, `root`, `workshop_booking`) usually work.

> `.env.local` is in `.gitignore` so your password is never committed.

### 3. Create the database schema

```bash
# In PowerShell:
Get-Content mysqldump.sql | mysql -u root -p

# In bash / cmd:
mysql -u root -p < mysqldump.sql
```

This creates the `workshop_booking` database with the `users`, `events`,
and `bookings` tables (with foreign keys and a UNIQUE constraint to
prevent duplicate bookings).

### 4. Seed sample data

```bash
node scripts/seed.mjs
```

This populates the database with 6 sample users (1 admin, 2 organisers,
3 attendees), 6 sample events, and 6 sample bookings.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Sample accounts

All sample passwords are **`password123`**.

| Role | Email |
|------|-------|
| Admin | `admin@workshop.com` |
| Organiser | `alice@workshop.com` |
| Organiser | `bob@workshop.com` |
| Attendee | `carol@workshop.com` |
| Attendee | `dave@workshop.com` |
| Attendee | `eve@workshop.com` |

---

## Project structure

```
workshop-booking-app/
├── lib/                      Shared helpers (database, sessions, validation)
│   ├── db.js                 mysql2 connection pool
│   ├── session.js            Cookie helpers + getCurrentUser()
│   └── validate.js           Server-side input validation
│
├── scripts/
│   └── seed.mjs              One-shot script to populate sample data
│
├── mysqldump.sql             Database schema (run once at setup)
├── .env.local.example        Template for local DB credentials
│
└── app/                      Next.js App Router
    ├── layout.js             Root layout
    ├── page.js               Home page (role-based dashboard)
    ├── globals.css           Global styles
    │
    ├── api/                  Server-side API routes
    │   ├── login/            POST  - login (bcrypt verify + set cookies)
    │   ├── logout/           POST  - clear cookies
    │   ├── me/               GET   - current user info
    │   ├── users/            POST  - register; GET - admin lists users
    │   ├── events/           GET   - list events; POST - create event
    │   │   └── [id]/         GET / PUT / DELETE single event
    │   ├── bookings/         POST  - book event; GET - my bookings
    │   │   └── [id]/         DELETE - cancel a booking
    │   └── admin/users/      Admin: list / change role / delete users
    │       └── [id]/
    │
    ├── login/                Login page
    ├── register/             Registration page
    ├── events/               Event browsing
    │   ├── page.js           List of all events (with search and "mine" filter)
    │   ├── new/              Create event (organiser only)
    │   └── [id]/
    │       ├── page.js       Event detail page
    │       └── edit/         Edit event (owner or admin only)
    ├── bookings/             "My bookings" page (attendee)
    ├── admin/                Admin dashboard + user management
    │
    └── components/           Reusable React components
        ├── Navbar.js         Top navigation (role-aware)
        ├── LoginForm.js      Used by /login
        ├── RegistrationForm.js  Used by /register
        ├── EventForm.js      Shared by /events/new and /events/[id]/edit
        └── BookingActions.js Embedded in event detail page
```

---

## Features

### Public (no login required)
- Browse all open events (`/events`)
- Search events by title
- View event details (`/events/[id]`)

### Attendee
- Register and login
- Book an event (subject to capacity)
- Cancel a booking
- View "My bookings" (`/bookings`)

### Organiser
- Everything an attendee can do
- Create new events (`/events/new`)
- Edit and delete their own events
- Toggle "Show my events only" on the event list

### Admin
- View list of all users (`/admin/users`)
- Change a user's role
- Delete a user (cascades to their events and bookings, with a confirmation prompt)
- Cannot delete their own account

---

## Security measures (Class 7, 9)

- **Password hashing**: bcrypt with cost factor 10. Plain-text passwords never touch the database.
- **HttpOnly cookies**: session cookies cannot be read by JavaScript, mitigating XSS theft.
- **SameSite=Lax**: cookies are not sent on third-party requests, mitigating CSRF.
- **Parameterised queries**: every SQL query uses `?` placeholders. No string concatenation, so SQL injection is not possible.
- **Server-side validation**: all input is re-validated on the server (`lib/validate.js`). Client-side validation is convenience only.
- **Generic error messages**: e.g. login returns "Invalid email or password" rather than telling the attacker whether the email exists.
- **No stack traces in responses**: server errors are logged with `console.error()` but the client only sees a generic message.
- **Role-based authorization**: protected actions (creating events, deleting users, etc.) check `currentUser.role` on the server, not just hide a button on the frontend.
- **Ownership checks**: editing/deleting an event verifies that the current user owns it (or is an admin) before running the SQL.

---

## Database design (Class 8)

```
users                          events                          bookings
─────                          ──────                          ────────
id PK                          id PK                           id PK
name                           organiser_id  FK ──> users.id   event_id      FK ──> events.id
email UNIQUE                   title                           attendee_id   FK ──> users.id
password_hash                  description                     status
role ENUM(...)                 location                        created_at
created_at                     event_date
                               capacity                        UNIQUE(event_id, attendee_id)
                               price                           ─────────────────────────────
                               status ENUM(open, cancelled)    Prevents the same attendee
                               created_at                      from booking the same event
                                                               twice.
```

`ON DELETE CASCADE` on both foreign keys means deleting a user removes
their events and bookings automatically (referential integrity).

---

## Division of labour

| Member | Modules | Approximate share |
|--------|---------|-------------------|
| **Jikun Li** | Database schema (mysqldump + seed), `lib/` helpers (db / session / validate), authentication APIs (`/api/login` / `/api/logout` / `/api/me` / `/api/users`), login & register pages and forms, full Events module (API + list / detail / new / edit pages, EventForm component) | ~50% |
| **Jingzu Ge** | Bookings module (API + UI + BookingActions component), Admin module (user management API + pages), Navbar and global UI shell (`layout.js`, `page.js`, `globals.css`), README documentation, screenshots and demo video | ~50% |

---

## Running tests / smoke check

After seeding, you should be able to:

1. Visit `/login` and log in as `alice@workshop.com / password123`.
2. Visit `/api/me` and see your user info as JSON.
3. Visit `/events` and see 6 events.
4. Search for "yoga" and see 2 events.
5. Click "+ Create new", create an event, edit it, then delete it.
6. Try to edit Bob's event as Alice → the API should return 403.

---

## Course references

This project draws on patterns from:

- **Class 1, 2, The setup**: Next.js App Router, project setup
- **Class 3, 4**: components, hooks, sticky forms
- **Class 5**: API endpoints, error handling, regex
- **Class 7**: bcrypt hashing, XSS / CSRF protections, server-side validation, error handling without leaking stack traces
- **Class 8**: MySQL connection pool, foreign keys, JOINs, referential integrity
- **Class 9**: parameterised queries to prevent SQL injection, cookie-based sessions, mysqldump for backup
- **Class 10, 12**: role-based UI, protected routes, multi-user concurrency
