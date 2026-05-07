// /api/users
// POST  - register a new user (or admin creates a user). Hashes password with bcrypt.
// GET   - list all users (admin only).
//
// Note on roles: the public can register as 'attendee' or 'organiser'.
// Creating an 'admin' account is restricted to existing admins so the
// system can't be hijacked from the public registration form.

import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { validateRegistration } from '@/lib/validate';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, password, role } = body;

    // Server-side validation (Class 7 - never trust the client)
    const errors = validateRegistration({ name, email, password, role });
    if (Object.keys(errors).length > 0) {
      return Response.json({ errors }, { status: 400 });
    }

    // Only an existing admin may create another admin account
    if (role === 'admin') {
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== 'admin') {
        return Response.json(
          { errors: { role: 'Only admins can create admin accounts' } },
          { status: 403 }
        );
      }
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Check the email isn't already taken (parameterised query - Class 9)
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [cleanEmail]
    );
    if (existing.length > 0) {
      return Response.json(
        { errors: { email: 'This email is already registered' } },
        { status: 409 }
      );
    }

    // Hash the password (Class 7) - cost factor 10 is the standard default
    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [cleanName, cleanEmail, passwordHash, role]
    );

    // Don't return the password hash - return only safe fields
    return Response.json(
      { id: result.insertId, name: cleanName, email: cleanEmail, role },
      { status: 201 }
    );
  } catch (err) {
    console.error('Register error:', err);
    return Response.json({ error: 'Registration failed' }, { status: 500 });
  }
}

export async function GET() {
  // List all users - admin only.
  // Used by the admin user-management page (Jingzu's module).
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (currentUser.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Never select password_hash (Class 7 - don't leak sensitive data)
    const [users] = await pool.query(
      `SELECT id, name, email, role, created_at
       FROM users
       ORDER BY created_at DESC`
    );
    return Response.json(users);
  } catch (err) {
    console.error('List users error:', err);
    return Response.json({ error: 'Failed to load users' }, { status: 500 });
  }
}
