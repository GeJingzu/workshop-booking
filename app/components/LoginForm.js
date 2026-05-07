'use client';

// Login form component. Posts {email, password} to /api/login and on
// success redirects to the home page. The cookie is set HttpOnly by the
// server, so we don't need to handle it on the client at all.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();

  // Sticky form: we keep entered values when validation/login fails so
  // the user only has to fix the wrong field (Class 4 sticky form pattern).
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setGeneralError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        // router.refresh() re-runs server components / re-fetches /api/me
        // so the navbar updates to the logged-in state.
        router.push('/');
        router.refresh();
      } else if (data.errors) {
        setErrors(data.errors);
      } else {
        setGeneralError(data.error || 'Login failed');
      }
    } catch {
      setGeneralError('Network error - please try again');
    }

    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto', padding: '1rem' }}>
      <h1>Login</h1>

      {generalError && (
        <p style={{ color: 'red', margin: '0.5rem 0' }}>{generalError}</p>
      )}

      <form onSubmit={handleSubmit}>
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
          <label htmlFor="password"><strong>Password</strong></label><br />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: 4 }}
          />
          {errors.password && (
            <p style={{ color: 'red', margin: '4px 0 0' }}>{errors.password}</p>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: '1.5rem' }}>
        Don&apos;t have an account? <Link href="/register">Register here</Link>
      </p>
    </div>
  );
}
