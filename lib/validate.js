// Server-side input validation (Class 7 says validate on the server,
// because client-side validation can be bypassed).
// Each function returns an error string, or null if the input is OK.
// Higher-level helpers return an "errors" object keyed by field.

const ALLOWED_ROLES = ['organiser', 'attendee', 'admin'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Generic single-field helpers
// ----------------------------------------------------------------

export function validateName(name) {
  if (typeof name !== 'string') return 'Name is required';
  const v = name.trim();
  if (v.length < 2) return 'Name must be at least 2 characters';
  if (v.length > 100) return 'Name must be 100 characters or fewer';
  return null;
}

export function validateEmail(email) {
  if (typeof email !== 'string') return 'Email is required';
  const v = email.trim();
  if (!EMAIL_RE.test(v)) return 'Please enter a valid email address';
  if (v.length > 100) return 'Email must be 100 characters or fewer';
  return null;
}

export function validatePassword(password) {
  if (typeof password !== 'string') return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (password.length > 100) return 'Password must be 100 characters or fewer';
  return null;
}

export function validateRole(role) {
  if (typeof role !== 'string') return 'Role is required';
  if (!ALLOWED_ROLES.includes(role)) {
    return `Role must be one of: ${ALLOWED_ROLES.join(', ')}`;
  }
  return null;
}

// Combined validators that return an errors object
// ----------------------------------------------------------------

// Used by /api/users (POST) when registering or when admin creates a user.
export function validateRegistration({ name, email, password, role }) {
  const errors = {};
  const nameErr = validateName(name);
  if (nameErr) errors.name = nameErr;
  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;
  const passwordErr = validatePassword(password);
  if (passwordErr) errors.password = passwordErr;
  const roleErr = validateRole(role);
  if (roleErr) errors.role = roleErr;
  return errors;
}

// Used by /api/login (POST). Lighter check: just non-empty email + password.
export function validateLogin({ email, password }) {
  const errors = {};
  if (typeof email !== 'string' || !email.trim()) errors.email = 'Email is required';
  if (typeof password !== 'string' || !password) errors.password = 'Password is required';
  return errors;
}

// Used by POST /api/events and PUT /api/events/[id]
export function validateEvent({ title, description, location, event_date, capacity, price }) {
  const errors = {};

  if (typeof title !== 'string' || title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (title.length > 150) {
    errors.title = 'Title must be 150 characters or fewer';
  }

  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      errors.description = 'Description must be text';
    } else if (description.length > 5000) {
      errors.description = 'Description must be 5000 characters or fewer';
    }
  }

  if (location !== undefined && location !== null && location !== '') {
    if (typeof location !== 'string' || location.length > 200) {
      errors.location = 'Location must be 200 characters or fewer';
    }
  }

  // event_date: required, must parse to a valid Date
  if (!event_date) {
    errors.event_date = 'Event date is required';
  } else {
    const d = new Date(event_date);
    if (isNaN(d.getTime())) errors.event_date = 'Event date is invalid';
  }

  // capacity: positive integer
  if (capacity !== undefined && capacity !== null && capacity !== '') {
    const c = Number(capacity);
    if (!Number.isInteger(c) || c < 1) {
      errors.capacity = 'Capacity must be a positive whole number';
    } else if (c > 10000) {
      errors.capacity = 'Capacity is unrealistically large';
    }
  }

  // price: non-negative number
  if (price !== undefined && price !== null && price !== '') {
    const p = Number(price);
    if (isNaN(p) || p < 0) {
      errors.price = 'Price must be zero or a positive number';
    } else if (p > 100000) {
      errors.price = 'Price is unrealistically large';
    }
  }

  return errors;
}

// Convenience: turn errors object into a single human-readable message.
export function firstErrorMessage(errors) {
  const keys = Object.keys(errors);
  if (keys.length === 0) return null;
  return errors[keys[0]];
}

export { ALLOWED_ROLES };
