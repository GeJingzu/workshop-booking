// "Create new event" page - delegates to the shared EventForm component.

import EventForm from '@/app/components/EventForm';

export const metadata = {
  title: 'Create event - Workshop Booking',
};

export default function NewEventPage() {
  return <EventForm mode="create" />;
}
