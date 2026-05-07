// POST /api/login
// Authenticates a user via email + password (bcrypt) and sets HttpOnly
// session cookies (Class 7, 9, 12).

import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { setSessionCookies } from '@/lib/session';
import { validateLogin } from '@/lib/validate';

export async function POST(req) {
  try {
    // Parse the request body. If JSON is malformed default to {} so the
    // validator returns a clean "required" error instead of crashing.
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    // Server-side validation (Class 7 - never trust the client).
    const errors = validateLogin({ email, password });
    if (Object.keys(errors).length > 0) {
      return Response.json({ errors }, { status: 400 });
    }

    // Parameterised query (Class 9 - prevents SQL injection).
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    // Use a single generic error so an attacker can't tell whether the
    // email exists or just the password was wrong (Class 7 best practice).
    const genericFail = { error: 'Invalid email or password' };

    if (users.length === 0) {
      return Response.json(genericFail, { status: 401 });
    }

    const user = users[0];

    // bcrypt.compare hashes the input with the same salt/cost embedded in
    // the stored hash and compares the result (Class 7).
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return Response.json(genericFail, { status: 401 });
    }

    // Successful login - drop the session cookies (HttpOnly, SameSite=Lax).
    await setSessionCookies(user);

    // Never return the password_hash to the client.
    return Response.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    // Log the real error for the developer, but return a generic message
    // to the client (Class 7 - don't leak stack traces).
    console.error('Login error:', err);
    return Response.json({ error: 'Login failed' }, { status: 500 });
  }
}
