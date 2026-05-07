// Login page - delegates to the LoginForm component.
// Keeping this file thin makes routing simple and the form reusable.

import LoginForm from '@/app/components/LoginForm';

export const metadata = {
  title: 'Login - Workshop Booking',
};

export default function LoginPage() {
  return <LoginForm />;
}
