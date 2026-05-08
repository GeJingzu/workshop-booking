'use client';

// Event detail page.
// - Public (anyone can view)
// - Booking actions live in the <BookingActions> component.
// - Owner organisers and admins see Edit/Delete buttons.

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import BookingActions from '@/app/components/BookingActions';

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [event, setEvent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/me').then((r) => r.json()),
      fetch(`/api/events/${id}`).then((r) => r.json().then((data) => ({ ok: r.ok, data }))),
    ]).then(([meData, eventResult]) => {
      setCurrentUser(meData.loggedIn ? meData.user : null);
      if (eventResult.ok) {
        setEvent(eventResult.data);
      } else {
        setError(eventResult.data.error || 'Event not found');
      }
      setLoading(false);
    });
  }, [id]);

  async function handleDelete() {
    if (
      !confirm(
        'Are you sure you want to delete this event? All bookings will also be removed.'
      )
    ) {
      return;
    }
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/events');
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Failed to delete');
    }
  }

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;
  if (error || !event) {
    return (
      <div style={{ padding: '2rem' }}>
        <Link href="/events">← Back to events</Link>
        <p style={{ color: 'red' }}>{error || 'Event not found'}</p>
      </div>
    );
  }

  const isOwner = currentUser?.id === event.organiser_id;
  const isAdmin = currentUser?.role === 'admin';
  const canManage = isOwner || isAdmin;

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '1rem' }}>
      <Link href="/events">← Back to events</Link>

      <h1 style={{ marginTop: '0.5rem' }}>
        {event.title}
        {event.status === 'cancelled' && (
          <span style={{ color: 'red', fontSize: '1rem', marginLeft: 8 }}>
            (cancelled)
          </span>
        )}
      </h1>

      <p style={{ color: '#666' }}>
        Organised by <strong>{event.organiser_name}</strong>
      </p>

      <table style={{ marginTop: '1rem', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={cellLabel}>When</td>
            <td style={cellValue}>{new Date(event.event_date).toLocaleString()}</td>
          </tr>
          {event.location && (
            <tr>
              <td style={cellLabel}>Where</td>
              <td style={cellValue}>{event.location}</td>
            </tr>
          )}
          <tr>
            <td style={cellLabel}>Capacity</td>
            <td style={cellValue}>
              {event.bookings_count} / {event.capacity} booked
            </td>
          </tr>
          <tr>
            <td style={cellLabel}>Price</td>
            <td style={cellValue}>€{Number(event.price).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      {event.description && (
        <div style={{ margin: '1.5rem 0' }}>
          <h3>About this event</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{event.description}</p>
        </div>
      )}

      {/* === Booking action area - Jingzu Ge's component === */}
      <BookingActions event={event} currentUser={currentUser} />

      {/* === Owner / admin controls === */}
      {canManage && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
          <h3>Manage event</h3>
          <Link href={`/events/${event.id}/edit`}>
            <button>Edit</button>
          </Link>
          <button
            onClick={handleDelete}
            style={{ marginLeft: 8, color: 'red', borderColor: 'red' }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

const cellLabel = {
  padding: '4px 12px 4px 0',
  fontWeight: 600,
  verticalAlign: 'top',
  color: '#666',
};
const cellValue = {
  padding: '4px 0',
};
