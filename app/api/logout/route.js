// POST /api/logout
// Clears the session cookies. Called from the navbar's "Logout" button.

import { clearSessionCookies } from '@/lib/session';

export async function POST() {
  await clearSessionCookies();
  return Response.json({ message: 'Logged out' });
}
