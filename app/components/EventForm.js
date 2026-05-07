'use client';

// Reusable form for creating and editing events.
// Used by /events/new (mode="create") and /events/[id]/edit (mode="edit").
// Posts to /api/events or PUTs to /api/events/[id] depending on mode.

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EventForm({ mode, eventId }) {
  const router = useRouter();

  // Sticky form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [capacity, setCapacity] = useState(20);
  const [price, setPrice] = useState(0);
  const [status, setStatus] = useState('open');

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(mode === 'edit'); // load existing data
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Gate: only organisers or admins can use this form. Redirect others.
    fetch('/api/me').then((r) => r.json()).then((data) => {
      if (!data.loggedIn) {
        router.push('/login');
        return;
      }
      if (data.user.role !== 'organiser' && data.user.role !== 'admin') {
        router.push('/');
      }
    });

    if (mode === 'edit' && eventId) {
      loadEvent();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, eventId]);

  async function loadEvent() {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}`);
      if (!res.ok) {
        setGeneralError('Event not found');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setTitle(data.title || '');
      setDescription(data.description || '');
      setLocation(data.location || '');
      // Convert MySQL DATETIME ("YYYY-MM-DD HH:MM:SS") into the format
      // that <input type="datetime-local"> expects ("YYYY-MM-DDTHH:MM").
      if (data.event_date) {
        const d = new Date(data.event_date);
        const pad = (n) => String(n).padStart(2, '0');
        setEventDate(
          `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
        );
      }
      setCapacity(data.capacity ?? 20);
      setPrice(data.price ?? 0);
      setStatus(data.status || 'open');
    } catch {
      setGeneralError('Failed to load event');
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setGeneralError('');
    setSubmitting(true);

    const body = {
      title,
      description,
      location,
      event_date: eventDate,
      capacity,
      price,
    };
    if (mode === 'edit') body.status = status;

    const url = mode === 'create' ? '/api/events' : `/api/events/${eventId}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        const newId = mode === 'create' ? data.id : eventId;
        router.push(`/events/${newId}`);
      } else if (data.errors) {
        setErrors(data.errors);
      } else {
        setGeneralError(data.error || 'Save failed');
      }
    } catch {
      setGeneralError('Network error - please try again');
    }
    setSubmitting(false);
  }

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
      <Link href="/events">← Back to events</Link>
      <h1>{mode === 'create' ? 'Create Event' : 'Edit Event'}</h1>

      {generalError && (
        <p style={{ color: 'red', margin: '0.5rem 0' }}>{generalError}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="title"><strong>Title *</strong></label><br />
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={150}
            required
            style={{ width: '100%', padding: '8px', marginTop: 4 }}
          />
          {errors.title && <p style={{ color: 'red', margin: '4px 0 0' }}>{errors.title}</p>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="description"><strong>Description</strong></label><br />
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={5000}
            rows={4}
            style={{ width: '100%', padding: '8px', marginTop: 4 }}
          />
          {errors.description && <p style={{ color: 'red', margin: '4px 0 0' }}>{errors.description}</p>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="location"><strong>Location</strong></label><br />
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={200}
            placeholder="e.g. Studio A, Dublin 2"
            style={{ width: '100%', padding: '8px', marginTop: 4 }}
          />
          {errors.location && <p style={{ color: 'red', margin: '4px 0 0' }}>{errors.location}</p>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="event_date"><strong>Date and time *</strong></label><br />
          <input
            id="event_date"
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: 4 }}
          />
          {errors.event_date && <p style={{ color: 'red', margin: '4px 0 0' }}>{errors.event_date}</p>}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="capacity"><strong>Capacity *</strong></label><br />
            <input
              id="capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              min={1}
              max={10000}
              required
              style={{ width: '100%', padding: '8px', marginTop: 4 }}
            />
            {errors.capacity && <p style={{ color: 'red', margin: '4px 0 0' }}>{errors.capacity}</p>}
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="price"><strong>Price (€)</strong></label><br />
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min={0}
              step="0.01"
              required
              style={{ width: '100%', padding: '8px', marginTop: 4 }}
            />
            {errors.price && <p style={{ color: 'red', margin: '4px 0 0' }}>{errors.price}</p>}
          </div>
        </div>

        {mode === 'edit' && (
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="status"><strong>Status</strong></label><br />
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: 4 }}
            >
              <option value="open">Open (taking bookings)</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}

        <button type="submit" disabled={submitting}>
          {submitting
            ? 'Saving...'
            : mode === 'create' ? 'Create event' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
