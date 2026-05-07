'use client';

// ===========================================================
// PLACEHOLDER - JINGZU GE will replace this entire file.
//
// Contract (do not change without team agreement):
//
// Props:
//   event:        full event object from GET /api/events/[id]
//   currentUser:  current user from /api/me, or null if not logged in
//
// event fields available:
//   id, organiser_id, organiser_name,
//   title, description, location, event_date,
//   capacity, price, status,        // 'open' | 'cancelled'
//   bookings_count,                 // number of confirmed bookings
//   user_has_booked,                // boolean
//   user_booking_id                 // booking id (or null)
//
// Render rules (Jingzu to implement):
//   !currentUser                              -> "Login to book" link
//   currentUser.id === event.organiser_id     -> "This is your own event"
//   event.status === 'cancelled'              -> "Event cancelled"
//   bookings_count >= capacity && !booked     -> "Event is full"
//   user_has_booked === true                  -> "Booked! [Cancel]"
//   default                                   -> "Book Now" button
// ===========================================================

export default function BookingActions({ event, currentUser }) {
  // Visible placeholder so the page works end-to-end before Jingzu writes
  // the real component. Jingzu will replace this with the real UI.
  return (
    <div
      style={{
        padding: '1rem',
        margin: '1rem 0',
        border: '2px dashed #ccc',
        background: '#fafafa',
        color: '#666',
      }}
    >
      <strong>[ BookingActions placeholder ]</strong>
      <br />
      Jingzu Ge will implement Book / Cancel buttons, capacity-full and
      cancelled messages here. See contract in the file header.
    </div>
  );
}
