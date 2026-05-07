'use client';

// "Edit event" page - delegates to the shared EventForm component.
// useParams() reads the dynamic [id] segment from the URL.

import { useParams } from 'next/navigation';
import EventForm from '@/app/components/EventForm';

export default function EditEventPage() {
  const params = useParams();
  return <EventForm mode="edit" eventId={params.id} />;
}
