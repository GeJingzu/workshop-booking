import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';

export default async function HomePage() {
    const user = await getCurrentUser();

  return (
        <div style={{ maxWidth: 800, margin: '2rem auto', padding: 16 }}>
      <h1>Workshop & Class Booking</h1>

{!user && (
          <>
            <p>Browse upcoming workshops or sign up to book a place.</p>
           <p>
              <Link href="/events">Browse events</Link> ·{' '}
             <Link href="/login">Login</Link> ·{' '}
             <Link href="/register">Register</Link>
  </p>
  </>
       )}

{user && (
          <>
            <p>Welcome back, {user.name} ({user.role}).</p>
           <ul>
              <li><Link href="/events">Browse events</Link></li>
{user.role === 'attendee' && (
                <li><Link href="/bookings">My bookings</Link></li>
              )}
{(user.role === 'organiser' || user.role === 'admin') && (
                <>
                  <li><Link href="/events?mine=1">My events</Link></li>
                  <li><Link href="/events/new">Create a new event</Link></li>
  </>
             )}
{user.role === 'admin' && (
                <li><Link href="/admin/users">Manage users</Link></li>
              )}
</ul>
  </>
       )}
</div>
  );
}
