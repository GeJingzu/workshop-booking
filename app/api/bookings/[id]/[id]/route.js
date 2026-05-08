// DELETE /api/bookings/[id] - cancel a booking (owner or admin)

import pool from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export async function DELETE(req, { params }) {
    try {
          const user = await getCurrentUser();
          if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 });

      const id = Number(params.id);
          if (!Number.isInteger(id) || id <= 0) {
                  return Response.json({ error: 'Invalid booking id' }, { status: 400 });
          }

      const [rows] = await pool.query(
              'SELECT id, attendee_id FROM bookings WHERE id = ?',
              [id]
            );
          const booking = rows[0];
          if (!booking) {
                  return Response.json({ error: 'Booking not found' }, { status: 404 });
          }

      // ownership check on the server (front-end hiding is not security)
      if (booking.attendee_id !== user.id && user.role !== 'admin') {
              return Response.json({ error: 'Not allowed' }, { status: 403 });
      }

      await pool.query('DELETE FROM bookings WHERE id = ?', [id]);
          return Response.json({ ok: true });
    } catch (err) {
          console.error('Cancel booking error:', err);
          return Response.json({ error: 'Failed to cancel' }, { status: 500 });
    }
}
