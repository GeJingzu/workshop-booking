// Registration page - delegates to the RegistrationForm component.

import RegistrationForm from '@/app/components/RegistrationForm';

export const metadata = {
  title: 'Register - Workshop Booking',
};

export default function RegisterPage() {
  return <RegistrationForm />;
}
