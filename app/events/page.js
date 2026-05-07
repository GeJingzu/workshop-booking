'use client';

// Public events list page.
// - Anyone can browse (no login required)
// - Search by title (Class 9 - LIKE search via ?q= parameter)
// - Organisers can toggle "show my events only"
// - Organisers see a "Create event" button

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function EventsListPage() {
  const [events, setEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState('');
  const [showMine, setShowMine] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load current user once on mount
  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((data) => setCurrentUser(data.loggedIn ? data.user : null));
  }, []);

  // Reload events whenever the filter or search changes
  useEffect(() => {
    loadEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMine, search]);

  async function loadEvents() {
    setLoading(true);
    const params = new URLSearchParams();
    if (showMine) params.set('mine', '1');
    if (search.trim()) params.set('q', search.trim());
    const res = await fetch('/api/events?' + params.toString());
    const data = await res.json();
    setEvents(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function formatDateTime(s) {
    if (!s) return '';
    const d = new Date(s);
    return d.toLocaleString();
  }

  const canCreate = currentUser?.role === 'organiser' || currentUser?.role === 'admin';

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '1rem' }}>
      <h1>Workshops &amp; Classes</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="search"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '8px' }}
        />
        {canCreate && (
          <>
            <button onClick={() => setShowMine(!showMine)}>
              {showMine ? 'Show all events' : 'Show my events only'}
            </button>
            <Link href="/events/new"><button>+ Create new</button></Link>
          </>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : events.length === 0 ? (
        <p style={{ color: '#666' }}>
          {showMine
            ? "You haven't created any events yet."
            : search
              ? `No events match "${search}".`
              : 'No events have been published yet.'}
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {events.map((e) => {
            const isFull = e.bookings_count >= e.capacity;
            const isCancelled = e.status === 'cancelled';
            return (
              <li
                key={e.id}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  padding: '1rem',
                  marginBottom: '0.75rem',
                  background: isCancelled ? '#fafafa' : 'white',
                  opacity: isCancelled ? 0.7 : 1,
                }}
              >
                <Link href={`/events/${e.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h3 style={{ margin: '0 0 0.5rem' }}>
                    {e.title}
                    {isCancelled && <span style={{ color: 'red', marginLeft: 8 }}>(cancelled)</span>}
                    {!isCancelled && isFull && <span style={{ color: '#aa6e00', marginLeft: 8 }}>(full)</span>}
                    {e.user_has_booked && <span style={{ color: 'green', marginLeft: 8 }}>✓ booked</span>}
                  </h3>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}>
                    Organised by {e.organiser_name} · {formatDateTime(e.event_date)}
                  </p>
                  {e.location && (
                    <p style={{ margin: '0.25rem 0', color: '#666' }}>📍 {e.location}</p>
                  )}
                  <p style={{ margin: '0.25rem 0' }}>
                    {e.bookings_count} / {e.capacity} booked · €{Number(e.price).toFixed(2)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
