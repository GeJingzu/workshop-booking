// /api/events/[id]
// GET     - read one event (public)
// PUT     - update an event (only the owner organiser, or any admin)
// DELETE  - delete an event (only the owner organiser, or any admin)
//
// ON DELETE CASCADE on the bookings table means deleting an event also
// deletes all of its bookings automatically (see mysqldump.sql).

import pool from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { validateEvent } from '@/lib/validate';

// Helper: look up the event row, returns null if not found.
async function findEvent(id) {
  const [rows] = await pool.query(
    `SELECT
       e.id, e.organiser_id, u.name AS organiser_name,
       e.title, e.description, e.location, e.event_date,
       e.capacity, e.price, e.status, e.created_at,
       (SELECT COUNT(*) FROM bookings
        WHERE event_id = e.id AND status = 'confirmed') AS bookings_count
     FROM events e
     JOIN users u ON e.organiser_id = u.id
     WHERE e.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function GET(req, { params }) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return Response.json({ error: 'Invalid event id' }, { status: 400 });
    }

    const event = await findEvent(id);
    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    // Decorate with booking status for the current user (if any).
    const currentUser = await getCurrentUser();
    if (currentUser) {
      const [bookings] = await pool.query(
        `SELECT id FROM bookings
         WHERE event_id = ? AND attendee_id = ? AND status = 'confirmed'`,
        [id, currentUser.id]
      );
      event.user_has_booked = bookings.length > 0;
      event.user_booking_id = bookings[0]?.id || null;
    } else {
      event.user_has_booked = false;
      event.user_booking_id = null;
    }

    return Response.json(event);
  } catch (err) {
    console.error('Get event error:', err);
    return Response.json({ error: 'Failed to load event' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return Response.json({ error: 'Invalid event id' }, { status: 400 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Look up the event to check ownership
    const [rows] = await pool.query(
      'SELECT organiser_id FROM events WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }
    const isOwner = rows[0].organiser_id === currentUser.id;
    const isAdmin = currentUser.role === 'admin';
    if (!isOwner && !isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
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
      status = 'open',
    } = body;

    // Validate status (only 'open' or 'cancelled' allowed by the schema)
    const cleanStatus = status === 'cancelled' ? 'cancelled' : 'open';

    await pool.query(
      `UPDATE events
       SET title = ?, description = ?, location = ?, event_date = ?,
           capacity = ?, price = ?, status = ?
       WHERE id = ?`,
      [
        title.trim(),
        description ? String(description).trim() : null,
        location ? String(location).trim() : null,
        event_date,
        Number(capacity),
        Number(price),
        cleanStatus,
        id,
      ]
    );

    return Response.json({ message: 'Event updated' });
  } catch (err) {
    console.error('Update event error:', err);
    return Response.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return Response.json({ error: 'Invalid event id' }, { status: 400 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const [rows] = await pool.query(
      'SELECT organiser_id FROM events WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }
    const isOwner = rows[0].organiser_id === currentUser.id;
    const isAdmin = currentUser.role === 'admin';
    if (!isOwner && !isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Bookings cascade-delete via the FK constraint (Class 8)
    await pool.query('DELETE FROM events WHERE id = ?', [id]);

    return Response.json({ message: 'Event deleted' });
  } catch (err) {
    console.error('Delete event error:', err);
    return Response.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
