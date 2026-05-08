'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MyBookingsPage() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

  useEffect(() => {
        load();
  }, []);

  async function load() {
        setLoading(true);
        const res = await fetch('/api/bookings');
        if (res.status === 401) {
                setError('Please login to see your bookings.');
        } else {
                const data = await res.json();
                setList(Array.isArray(data) ? data : []);
        }
        setLoading(false);
  }

  async function cancel(id) {
        if (!confirm('Cancel this booking?')) return;
        const res = await fetch('/api/bookings/' + id, { method: 'DELETE' });
        if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                alert(d.error || 'Cancel failed');
                return;
        }
        setList(list.filter((b) => b.id !== id));
  }

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
  if (error) {
        return (
                <p style={{ padding: 24, color: '#a00' }}>
{error} <Link href="/login">Login</Link>
  </p>
    );
}

  return (
        <div style={{ maxWidth: 800, margin: '2rem auto', padding: 16 }}>
      <h1>My Bookings</h1>
{list.length === 0 ? (
          <p style={{ color: '#666' }}>
          No bookings yet. <Link href="/events">Browse events</Link>.
  </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
{list.map((b) => (
              <li key={b.id} style={{
                border: '1px solid #ccc', borderRadius: 6,
                padding: 16, marginBottom: 12,
}}>
              <h3 style={{ margin: '0 0 6px' }}>
                <Link href={'/events/' + b.event_id}>{b.title}</Link>
  </h3>
              <p style={{ margin: '4px 0', color: '#666' }}>
{new Date(b.event_date).toLocaleString()} · by {b.organiser_name}
</p>
{b.location && (
                  <p style={{ margin: '4px 0', color: '#666' }}>📍 {b.location}</p>
              )}
              <p style={{ margin: '4px 0' }}>€{Number(b.price).toFixed(2)}</p>
              <button onClick={() => cancel(b.id)}>Cancel</button>
                </li>
          ))}
            </ul>
      )}
</div>
  );
}
