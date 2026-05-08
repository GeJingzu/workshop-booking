// PUT    /api/admin/users/[id] - change a user's role
// DELETE /api/admin/users/[id] - delete a user (cascade removes their events + bookings)

import pool from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { validateRole } from '@/lib/validate';

export async function PUT(req, { params }) {
  try {
    const me = await getCurrentUser();
    if (!me) return Response.json({ error: 'Not authenticated' }, { status: 401 });
    if (me.role !== 'admin') return Response.json({ error: 'Admins only' }, { status: 403 });

    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return Response.json({ error: 'Invalid user id' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const roleErr = validateRole(body.role);
    if (roleErr) return Response.json({ error: roleErr }, { status: 400 });

    // can't demote yourself or no admin would be left
    if (id === me.id && body.role !== 'admin') {
            return Response.json({ error: 'You cannot change your own admin role' }, { status: 400 });
          }

    const [r] = await pool.query(
            'UPDATE users SET role = ? WHERE id = ?',
            [body.role, id]
          );
    if (r.affectedRows === 0) {
            return Response.json({ error: 'User not found' }, { status: 404 });
          }
    return Response.json({ ok: true });
  } catch (err) {
        console.error('Update role error:', err);
        return Response.json({ error: 'Failed to update role' }, { status: 500 });
      }
}

export async function DELETE(req, { params }) {
    try {
          const me = await getCurrentUser();
          if (!me) return Response.json({ error: 'Not authenticated' }, { status: 401 });
          if (me.role !== 'admin') return Response.json({ error: 'Admins only' }, { status: 403 });

          const id = Number(params.id);
          if (!Number.isInteger(id) || id <= 0) {
                  return Response.json({ error: 'Invalid user id' }, { status: 400 });
                }
          if (id === me.id) {
                  return Response.json({ error: 'You cannot delete yourself' }, { status: 400 });
                }

          const [r] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
          if (r.affectedRows === 0) {
                  return Response.json({ error: 'User not found' }, { status: 404 });
                }
          return Response.json({ ok: true });
        } catch (err) {
          console.error('Delete user error:', err);
          return Response.json({ error: 'Failed to delete' }, { status: 500 });
        }
  }
