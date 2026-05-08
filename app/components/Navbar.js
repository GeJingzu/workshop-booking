'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState(null);

  useEffect(() => {
        fetch('/api/me')
          .then((r) => r.json())
          .then((d) => setUser(d.loggedIn ? d.user : null));
  }, []);

  async function logout() {
        await fetch('/api/logout', { method: 'POST' });
        setUser(null);
        router.push('/');
        router.refresh();
  }

  const a = { color: '#fff', marginRight: 16, textDecoration: 'none' };

  return (
        <nav style={{
          background: '#222', color: '#fff',
          padding: '10px 20px', display: 'flex', alignItems: 'center', flexWrap: 'wrap',
  }}>
      <Link href="/" style={{ ...a, fontWeight: 'bold' }}>Workshop Booking</Link>
      <Link href="/events" style={a}>Events</Link>

{user?.role === 'attendee' && <Link href="/bookings" style={a}>My Bookings</Link>}
 {(user?.role === 'organiser' || user?.role === 'admin') && (
           <Link href="/events?mine=1" style={a}>My Events</Link>
        )}
 {user?.role === 'admin' && <Link href="/admin" style={a}>Admin</Link>}

       <span style={{ flex: 1 }} />

 {user ? (
           <>
             <span style={{ color: '#bbb', marginRight: 12 }}>
 {user.name} ({user.role})
   </span>
           <button onClick={logout}>Logout</button>
   </>
       ) : (
                 <>
                   <Link href="/login" style={a}>Login</Link>
           <Link href="/register" style={a}>Register</Link>
         </>
       )}
</nav>
  );
}
