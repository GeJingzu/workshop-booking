'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BookingActions({ event, currentUser }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState('');

  async function book() {
        setBusy(true);
        setMsg('');
        const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event_id: event.id }),
        });
        const data = await res.json();
        if (!res.ok) {
                setMsg(data.error || 'Booking failed');
        } else {
                setMsg('Booked!');
                router.refresh();
        }
        setBusy(false);
  }

  async function cancel() {
        if (!confirm('Cancel this booking?')) return;
        setBusy(true);
        setMsg('');
        const res = await fetch('/api/bookings/' + event.user_booking_id, {
                method: 'DELETE',
        });
        const data = await res.json();
        if (!res.ok) {
                setMsg(data.error || 'Cancel failed');
        } else {
                setMsg('Cancelled.');
                router.refresh();
        }
        setBusy(false);
  }

  const box = {
        padding: '1rem',
        margin: '1rem 0',
        border: '1px solid #ddd',
        borderRadius: 6,
        background: '#fafafa',
  };

  // not logged in
  if (!currentUser) {
        return <div style={box}><Link href="/login">Login to book</Link></div>;
  }
    // own event
  if (currentUser.id === event.organiser_id) {
        return <div style={box}><em>This is your own event.</em></div>;
  }
    // cancelled by organiser
  if (event.status === 'cancelled') {
        return <div style={box}>Event cancelled.</div>;
  }
    // already booked
  if (event.user_has_booked) {
        return (
                <div style={box}>
                  <p style={{ color: 'green', margin: '0 0 .5rem' }}>You have booked this.</p>
          <button onClick={cancel} disabled={busy}>
  {busy ? 'Cancelling...' : 'Cancel booking'}
</button>
{msg && <p>{msg}</p>}
  </div>
     );
}
  // full
  if (event.bookings_count >= event.capacity) {
        return <div style={box}>Sorry, this event is full.</div>;
  }
  // default - can book
  return (
        <div style={box}>
          <button onClick={book} disabled={busy}>
  {busy ? 'Booking...' : 'Book Now'}
</button>
      <span style={{ marginLeft: 12, color: '#666' }}>
{event.bookings_count}/{event.capacity} taken
  </span>
{msg && <p>{msg}</p>}
  </div>
   );
}
