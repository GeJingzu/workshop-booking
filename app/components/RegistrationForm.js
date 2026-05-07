'use client';

// Registration form. Posts {name, email, password, role} to /api/users.
// Public users can pick 'attendee' or 'organiser' from the dropdown.
// 'admin' is intentionally NOT offered here - the API will reject any
// request to create an admin account unless the requester is already an
// admin (defence in depth: client UI hides the option AND the server
// enforces it).

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegistrationForm() {
  const router = useRouter();

  // Sticky form values (Class 4)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('attendee');
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setGeneralError('');
    setLoading(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();

      if (res.ok) {
        // Successful registration -> push to login. The user will then
        // log in to get session cookies (we don't auto-login because
        // the registration endpoint can also be called by an admin
        // creating a user for somebody else).
        router.push('/login');
      } else if (data.errors) {
        setErrors(data.errors);
      } else {
        setGeneralError(data.error || 'Registration failed');
      }
    } catch {
      setGeneralError('Network error - please try again');
    }

    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '1rem' }}>
      <h1>Create an account</h1>

      {generalError && (
        <p style={{ color: 'red', margin: '0.5rem 0' }}>{generalError}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="name"><strong>Name</strong></label><br />
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
            style={{ width: '100%', padding: '8px', marginTop: 4 }}
          />
          {errors.name && (
            <p style={{ color: 'red', margin: '4px 0 0' }}>{errors.name}</p>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email"><strong>Email</strong></label><br />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={100}
            required
            style={{ width: '100%', padding: '8px', marginTop: 4 }}
          />
          {errors.email && (
            <p style={{ color: 'red', margin: '4px 0 0' }}>{errors.email}</p>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password">
            <strong>Password</strong> <span style={{ color: '#666' }}>(min 6 characters)</span>
          </label><br />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            maxLength={100}
            required
            style={{ width: '100%', padding: '8px', marginTop: 4 }}
          />
          {errors.password && (
            <p style={{ color: 'red', margin: '4px 0 0' }}>{errors.password}</p>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="role"><strong>I want to...</strong></label><br />
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: 4 }}
          >
            <option value="attendee">Attend events (book workshops &amp; classes)</option>
            <option value="organiser">Organise events (create workshops &amp; classes)</option>
          </select>
          {errors.role && (
            <p style={{ color: 'red', margin: '4px 0 0' }}>{errors.role}</p>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p style={{ marginTop: '1.5rem' }}>
        Already have an account? <Link href="/login">Login here</Link>
      </p>
    </div>
  );
}
