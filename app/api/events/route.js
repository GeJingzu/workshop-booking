// /api/events
// GET   - public list of events (with optional ?q=search and ?mine=1 filters)
// POST  - create a new event (organiser or admin only)
//
// The list returns extra computed fields the detail page and BookingActions
// component depend on:
//   - organiser_name: from a JOIN on users
//   - bookings_count: COUNT of confirmed bookings (subquery)
//   - user_has_booked / user_booking_id: only meaningful for the logged-in
//     attendee viewing the page; null/false for everyone else.

import pool from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { validateEvent } from '@/lib/validate';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get('q')?.trim() || '';
    const mineOnly = url.searchParams.get('mine') === '1';

    const currentUser = await getCurrentUser();

    // Build the query dynamically. We always use parameterised queries
    // (Class 9 - SQL injection prevention).
    let sql = `
      SELECT
        e.id, e.organiser_id, u.name AS organiser_name,
        e.title, e.description, e.location, e.event_date,
        e.capacity, e.price, e.status, e.created_at,
        (SELECT COUNT(*) FROM bookings
         WHERE event_id = e.id AND status = 'confirmed') AS bookings_count
      FROM events e
      JOIN users u ON e.organiser_id = u.id
      WHERE 1 = 1
    `;
    const params = [];

    if (mineOnly) {
      // Only authenticated organisers/admins can use ?mine=1
      if (!currentUser) {
        return Response.json({ error: 'Not authenticated' }, { status: 401 });
      }
      sql += ' AND e.organiser_id = ?';
      params.push(currentUser.id);
    }

    if (q) {
      // LIKE search with parameter binding (Class 9 safe-search pattern)
      sql += ' AND e.title LIKE ?';
      params.push(`%${q}%`);
    }

    sql += ' ORDER BY e.event_date ASC';

    const [events] = await pool.query(sql, params);

    // Decorate each event with the current user's booking status.
    // Doing this as a single follow-up query is much more efficient than
    // a per-row subquery, and keeps the main query simple.
    if (currentUser && events.length > 0) {
      const ids = events.map((e) => e.id);
      const placeholders = ids.map(() => '?').join(',');
      const [bookings] = await pool.query(
        `SELECT id, event_id FROM bookings
         WHERE attendee_id = ? AND status = 'confirmed'
         AND event_id IN (${placeholders})`,
        [currentUser.id, ...ids]
      );
      const map = Object.fromEntries(bookings.map((b) => [b.event_id, b.id]));
      events.forEach((e) => {
        e.user_has_booked = map[e.id] !== undefined;
        e.user_booking_id = map[e.id] || null;
      });
    } else {
      events.forEach((e) => {
        e.user_has_booked = false;
        e.user_booking_id = null;
      });
    }

    return Response.json(events);
  } catch (err) {
    console.error('List events error:', err);
    return Response.json({ error: 'Failed to load events' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }
    // Only organisers (or admins) can create events
    if (currentUser.role !== 'organiser' && currentUser.role !== 'admin') {
      return Response.json(
        { error: 'Only organisers can create events' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const errors = validateEvent(body);
    if (Object.keys(errors).length > 0) {
      return Response.json({ errors }, { status: 400 });
    }

    const {
      title,
      description = null,
      location = null,
      event_date,
      capacity = 20,
      price = 0,
    } = body;

    const [result] = await pool.query(
      `INSERT INTO events
       (organiser_id, title, description, location, event_date, capacity, price)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        currentUser.id,
        title.trim(),
        description ? String(description).trim() : null,
        location ? String(location).trim() : null,
        event_date,
        Number(capacity),
        Number(price),
      ]
    );

    return Response.json({ id: result.insertId }, { status: 201 });
  } catch (err) {
    console.error('Create event error:', err);
    return Response.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
