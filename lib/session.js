// Session helpers for cookie-based auth (Class 7, 9, 12)
// We store userId + role in HttpOnly cookies after a successful login.
// API routes call getCurrentUser() to know who is making the request,
// and check user.role to enforce role-based access control (RBAC).

import { cookies } from 'next/headers';
import pool from '@/lib/db';

// Read the cookie and look the user up in the database.
// Returns the user row (without password_hash) or null if not logged in.
// Looking up the DB on each request makes sure that if an admin changes
// or deletes the user, the cookie alone cannot grant access.
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get('userId');
  if (!userIdCookie) return null;

  const userId = Number(userIdCookie.value);
  if (!Number.isInteger(userId) || userId <= 0) return null;

  // Parameterised query to prevent SQL injection (Class 9)
  const [rows] = await pool.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
    [userId]
  );
  return rows[0] || null;
}

// Set the auth cookies after a successful login.
// HttpOnly = JavaScript on the page can't read it (mitigates XSS - Class 7).
// SameSite=Lax = browser only sends the cookie on same-site navigations
// (mitigates CSRF for most cases).
export async function setSessionCookies(user) {
  const cookieStore = await cookies();
  const opts = {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 day
  };
  cookieStore.set('userId', String(user.id), opts);
  cookieStore.set('role', user.role, opts);
}

// Clear the auth cookies (used by /api/logout).
export async function clearSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('userId');
  cookieStore.delete('role');
}
