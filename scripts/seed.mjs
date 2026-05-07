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

  // 1 admin + 2 organisers + 3 attendees
  const sampleUsers = [
    ['Admin User',   'admin@workshop.com', passwordHash, 'admin'],
    ['Alice Walker', 'alice@workshop.com', passwordHash, 'organiser'],
    ['Bob Reilly',   'bob@workshop.com',   passwordHash, 'organiser'],
    ['Carol Singh',  'carol@workshop.com', passwordHash, 'attendee'],
    ['Dave Kelly',   'dave@workshop.com',  passwordHash, 'attendee'],
    ['Eve Murphy',   'eve@workshop.com',   passwordHash, 'attendee'],
  ];
  for (const u of sampleUsers) {
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      u
    );
  }
  console.log(`  inserted ${sampleUsers.length} users`);

  // Helper to make a future date string
  const futureDate = (daysAhead, hour) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    d.setHours(hour, 0, 0, 0);
    // MySQL DATETIME format: 'YYYY-MM-DD HH:MM:SS'
    return d.toISOString().slice(0, 19).replace('T', ' ');
  };

  // Sample events - alternating between Alice (id=2) and Bob (id=3)
  const sampleEvents = [
    [2, 'Beginner Yoga Workshop',  'Gentle 90-minute yoga session for absolute beginners. Mats provided.', 'Studio A, Dublin 2', futureDate(7, 18),  20, 15.00],
    [2, 'Intermediate Yoga Flow',  'Vinyasa flow class for those with some yoga experience.',              'Studio A, Dublin 2', futureDate(14, 18), 20, 18.00],
    [3, 'JavaScript Bootcamp',     'Full-day intro to modern JavaScript. Bring a laptop.',                  'Hub Co-working, Dublin 1', futureDate(10, 10), 30, 50.00],
    [3, 'React Crash Course',      'Half-day hands-on React workshop for people who know JS basics.',      'Hub Co-working, Dublin 1', futureDate(21, 13), 25, 45.00],
    [2, 'Watercolour Painting',    'Relaxing afternoon painting session. All materials supplied.',         'Art Centre, Dublin 4',     futureDate(5, 14),  12, 25.00],
    [3, 'Italian Cooking Class',   'Make fresh pasta from scratch and a simple sauce.',                    'Cookery School, Dublin 6', futureDate(18, 19),  8, 60.00],
  ];
  for (const e of sampleEvents) {
    await pool.query(
      `INSERT INTO events (organiser_id, title, description, location, event_date, capacity, price)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      e
    );
  }
  console.log(`  inserted ${sampleEvents.length} events`);

  // Sample bookings - attendees (id 4, 5, 6) book various events
  const sampleBookings = [
    [1, 4], // Carol -> Beginner Yoga
    [1, 5], // Dave  -> Beginner Yoga
    [3, 4], // Carol -> JS Bootcamp
    [3, 6], // Eve   -> JS Bootcamp
    [5, 5], // Dave  -> Watercolour
    [6, 6], // Eve   -> Italian Cooking
  ];
  for (const b of sampleBookings) {
    await pool.query(
      'INSERT INTO bookings (event_id, attendee_id) VALUES (?, ?)',
      b
    );
  }
  console.log(`  inserted ${sampleBookings.length} bookings`);

  console.log('\nDone! Sample login credentials (all passwords = "password123"):');
  console.log('  Admin     : admin@workshop.com');
  console.log('  Organiser : alice@workshop.com  /  bob@workshop.com');
  console.log('  Attendee  : carol@workshop.com  /  dave@workshop.com  /  eve@workshop.com');

  await pool.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
