// POST  /api/bookings  - book an event
// GET   /api/bookings  - list my bookings

import pool from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export async function POST(req) {
    try {
          const user = await getCurrentUser();
          if (!user) {
                  return Response.json({ error: 'Please log in first' }, { status: 401 });
          }

      const body = await req.json().catch(() => ({}));
          const eventId = Number(body.event_id);
          if (!Number.isInteger(eventId) || eventId <= 0) {
                  return Response.json({ error: 'event_id is invalid' }, { status: 400 });
          }

      // load the event so we can check status / capacity
      const [rows] = await pool.query(
              `SELECT id, organiser_id, capacity, status,
                      (SELECT COUNT(*) FROM bookings
                                WHERE event_id = events.id AND status = 'confirmed') AS bookings_count
                                       FROM events WHERE id = ?`,
              [eventId]
            );
          const ev = rows[0];
          if (!ev) return Response.json({ error: 'Event not found' }, { status: 404 });
          if (ev.status === 'cancelled') {
                  return Response.json({ error: 'Event has been cancelled' }, { status: 400 });
          }
          if (ev.organiser_id === user.id) {
                  return Response.json({ error: 'You cannot book your own event' }, { status: 400 });
          }
          if (ev.bookings_count >= ev.capacity) {
                  return Response.json({ error: 'Event is full' }, { status: 400 });
          }

      // UNIQUE(event_id, attendee_id) blocks duplicate bookings at DB level
      try {
              const [r] = await pool.query(
                        `INSERT INTO bookings (event_id, attendee_id, status)
                                 VALUES (?, ?, 'confirmed')`,
                        [eventId, user.id]
                      );
              return Response.json({ id: r.insertId, event_id: eventId }, { status: 201 });
      } catch (e) {
              if (e.code === 'ER_DUP_ENTRY') {
                        return Response.json({ error: 'You already booked this event' }, { status: 409 });
              }
              throw e;
      }
    } catch (err) {
          console.error('Create booking error:', err);
          return Response.json({ error: 'Failed to create booking' }, { status: 500 });
    }
}

export async function GET() {
    try {
          const user = await getCurrentUser();
          if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 });

      // join events + users to get the title, date, organiser name
      const [rows] = await pool.query(
              `SELECT b.id, b.event_id, b.status, b.created_at,
                            e.title, e.event_date, e.location, e.price,
                                          u.name AS organiser_name
                                                 FROM bookings b
                                                        JOIN events e ON b.event_id = e.id
                                                               JOIN users  u ON e.organiser_id = u.id
                                                                      WHERE b.attendee_id = ?
                                                                             ORDER BY e.event_date ASC`,
              [user.id]
            );
          return Response.json(rows);
    } catch (err) {
          console.error('My bookings error:', err);
          return Response.json({ error: 'Failed to load bookings' }, { status: 500 });
    }
}
