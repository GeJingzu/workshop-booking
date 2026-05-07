-- ============================================================
-- Workshop & Class Booking - Database Schema
-- SWD Assignment 3 - Jikun Li & Jingzu Ge
-- ============================================================
-- This file creates the database and all 3 tables with foreign keys.
--
-- USAGE:
--   1. Open MySQL terminal and run:   mysql -u root -p < mysqldump.sql
--   2. Then run the seed script:      node scripts/seed.mjs
--      (this populates sample users with bcrypt-hashed passwords,
--       plus sample events and bookings)
--
-- After developing the app and adding/changing data, regenerate this
-- file by running:
--   mysqldump -u root -p workshop_booking > mysqldump.sql
-- ============================================================

DROP DATABASE IF EXISTS workshop_booking;
CREATE DATABASE workshop_booking
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE workshop_booking;

-- ------------------------------------------------------------
-- users: 3 roles - organiser creates events, attendee books
-- events, admin manages users
-- password_hash stores bcrypt hashes (never plain text)
-- ------------------------------------------------------------
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('organiser', 'attendee', 'admin') NOT NULL DEFAULT 'attendee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- events: each event belongs to one organiser
-- ON DELETE CASCADE: if organiser is deleted, their events are
-- removed too (referential integrity, see Class 8)
-- ------------------------------------------------------------
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organiser_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  location VARCHAR(200),
  event_date DATETIME NOT NULL,
  capacity INT NOT NULL DEFAULT 20,
  price DECIMAL(8, 2) NOT NULL DEFAULT 0,
  status ENUM('open', 'cancelled') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organiser_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- bookings: links one attendee to one event
-- UNIQUE (event_id, attendee_id) prevents the same attendee from
-- booking the same event twice
-- ------------------------------------------------------------
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  attendee_id INT NOT NULL,
  status ENUM('confirmed', 'cancelled') NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (attendee_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_event_attendee (event_id, attendee_id)
);

-- ------------------------------------------------------------
-- Helpful index for the public events list (sort by date asc)
-- ------------------------------------------------------------
CREATE INDEX idx_events_date ON events (event_date);
