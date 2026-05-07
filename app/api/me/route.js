// GET /api/me
// Tells the client who is currently logged in. Used by the navbar and
// every protected page to decide what to render and where to redirect.

import { getCurrentUser } from '@/lib/session';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ loggedIn: false });
  }
  return Response.json({
    loggedIn: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}
