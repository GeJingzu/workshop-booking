// Seed script - populates the database with sample users, events, and
// bookings so we can demo all 3 roles immediately.
//
// USAGE: node scripts/seed.mjs   (run from the project root, AFTER you
// have already imported mysqldump.sql to create the schema).
//
// All sample passwords are "password123" (bcrypt-hashed in the database).

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
// @next/env is a CommonJS module, so we have to use a default import and
// destructure manually (named imports don't work for CJS in ESM).
import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;

// Load .env.local the same way Next.js does, so this script can run
// directly with `node scripts/seed.mjs`.
loadEnvConfig(process.cwd());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function main() {
  console.log('Seeding database...');

  // Clear existing rows in the right order (children first because of FKs)
  await pool.query('DELETE FROM bookings');
  await pool.query('DELETE FROM events');
  await pool.query('DELETE FROM users');
  // Reset auto-increment counters so IDs start at 1 again
  await pool.query('ALTER TABLE bookings AUTO_INCREMENT = 1');
  await pool.query('ALTER TABLE events AUTO_INCREMENT = 1');
  await pool.query('ALTER TABLE users AUTO_INCREMENT = 1');

  // All sample users share the password "password123" for easy testing
  const passwordHash = await bcrypt.hash('password123', 10);

  const createdAt = '2026-05-09 12:00:00';

  // 1 admin + 2 organisers + 3 attendees
  const sampleUsers = [
    ['Jingzu Ge', 'jingzu@workshop.com', passwordHash, 'admin', createdAt],
    ['Jikun Li',  'jikun@workshop.com',  passwordHash, 'organiser', createdAt],
    ['A',         'a@workshop.com',                passwordHash, 'organiser', createdAt],
    ['abcd',      'abcd@workshop.com',      passwordHash, 'attendee', createdAt],
    ['B',         'b@workshop.com',                passwordHash, 'attendee', createdAt],
    ['C',         'c@workshop.com',                passwordHash, 'attendee', createdAt],
  ];
  for (const u of sampleUsers) {
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)',
      u
    );
  }
  console.log(`  inserted ${sampleUsers.length} users`);

  // Sample events for demo data.
  const sampleEvents = [
    [3, 'Cooking Class', 'Cook a simple meal in a small group.', 'Kitchen B, Dublin 6', '2026-05-14 17:00:00', 8, 40.00, 'open', createdAt],
    [2, 'Yoga Class', 'One-hour yoga session for beginners.', 'Room 1, Dublin 2', '2026-05-16 17:00:00', 20, 15.00, 'open', createdAt],
    [3, 'JS Workshop', 'Basic JavaScript workshop for new learners.', 'Lab 2, Dublin 1', '2026-05-19 08:00:00', 30, 50.00, 'open', createdAt],
    [2, 'Painting Class', 'Relaxing painting class for beginners.', 'Room 3, Dublin 4', '2026-05-23 09:00:00', 12, 25.00, 'open', createdAt],
    [2, 'Photo Walk', 'Outdoor photo walk around Dublin city centre.', 'City Centre, Dublin', '2026-05-30 13:00:00', 15, 20.00, 'open', createdAt],
    [3, 'Dance Class', 'Beginner dance moves, no experience needed.', 'Hall A, Dublin 8', '2026-05-27 16:00:00', 20, 30.00, 'open', createdAt],
  ];
  for (const e of sampleEvents) {
    await pool.query(
      `INSERT INTO events (organiser_id, title, description, location, event_date, capacity, price, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      e
    );
  }
  console.log(`  inserted ${sampleEvents.length} events`);

  // Sample bookings - attendees (id 4, 5, 6) book various events
  const sampleBookings = [
    [1, 5, 'confirmed', createdAt], // B -> Cooking Class
    [2, 4, 'confirmed', createdAt], // abcd -> Yoga Class
    [2, 5, 'confirmed', createdAt], // B -> Yoga Class
    [3, 4, 'confirmed', createdAt], // abcd -> JS Workshop
    [3, 6, 'confirmed', createdAt], // C -> JS Workshop
    [6, 6, 'confirmed', createdAt], // C -> Dance Class
  ];
  for (const b of sampleBookings) {
    await pool.query(
      'INSERT INTO bookings (event_id, attendee_id, status, created_at) VALUES (?, ?, ?, ?)',
      b
    );
  }
  console.log(`  inserted ${sampleBookings.length} bookings`);

  console.log('\nDone! Sample login credentials (all passwords = "password123"):');
  console.log('  Admin     : jingzu@workshop.com');
  console.log('  Organiser : jikun@workshop.com  /  a@workshop.com');
  console.log('  Attendee  : abcd@workshop.com  /  b@workshop.com  /  c@workshop.com');

  await pool.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
