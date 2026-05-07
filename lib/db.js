// MySQL connection pool (Class 8)
// Connection details come from .env.local (never hard-code credentials).
// A pool reuses connections instead of opening a new one for every query,
// which improves performance under concurrent users (Class 8).

import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // sensible defaults
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
