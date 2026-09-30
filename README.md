# Workshop Booking

A web app for booking workshops and classes. Jikun Li and I built it for the Server-Side Web Development module at Griffith College Dublin (May 2026).

There are three kinds of users:

- **Attendees** can browse events, book a place and cancel a booking.
- **Organisers** can do the same, plus create, edit and delete their own events.
- **Admins** can see every user, change someone's role or delete an account.

Anyone can browse and search the event list without logging in.

## Built with

Next.js 14 (App Router), React 18, MySQL 8 with `mysql2`, and `bcryptjs` for passwords. No UI library, just plain CSS.

## Running it

You need Node.js 18+ and MySQL 8 running locally.

```
git clone https://github.com/GeJingzu/workshop-booking.git
cd workshop-booking
npm install
cp .env.local.example .env.local     # then put your MySQL password in it
mysql -u root -p < mysqldump.sql     # creates the database with sample data
npm run dev
```

Then open http://localhost:3000.

`node scripts/seed.mjs` resets the sample data if you mess it up.

Sample logins (all passwords are `password123`):

| Role | Email |
|---|---|
| Admin | jingzu@workshop.com |
| Organiser | jikun@workshop.com, a@workshop.com |
| Attendee | abcd@workshop.com, b@workshop.com, c@workshop.com |

## How it's put together

- `app/api/` holds the API routes: login/logout/me, users, events, bookings and admin user management.
- `app/` pages are the UI (events list and detail, create/edit event, my bookings, admin pages, login, register).
- `lib/db.js` is the MySQL connection pool, `lib/session.js` reads the logged-in user from cookies and `lib/validate.js` checks input on the server.

The database has three tables: `users`, `events` and `bookings`. `bookings` has a unique key on (event, attendee) so nobody can book the same event twice, and the foreign keys cascade, so deleting a user also removes their events and bookings.

## Security bits

- Passwords are hashed with bcrypt, never stored as plain text.
- The session cookie is HttpOnly and SameSite=Lax.
- Every query uses `?` placeholders, so no SQL injection.
- Input is validated again on the server, not only in the form.
- Role and ownership are checked on the server. For example, an organiser who tries to edit someone else's event gets a 403, even if they call the API directly.
- Login says "Invalid email or password" either way, so it doesn't reveal which emails are registered.

## Who did what

- **Jikun Li:** project setup, database and seed script, the `lib/` helpers, login/register, and the whole events module.
- **Jingzu Ge (me):** the bookings module (book and cancel APIs, My Bookings page, the booking buttons on the event page), the admin module (user list, change role, delete user), the navbar and the role-aware home page.

The commit history shows the split. This is a copy of our original repo, so the commits are the same.
