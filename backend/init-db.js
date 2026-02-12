#!/usr/bin/env node
/**
 * Initialize database tables (mirrors SQLAlchemy models from main.py)
 */
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'pickleball.db');
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    name VARCHAR(255),
    role VARCHAR(50),
    skill_level VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS courts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER REFERENCES users(id),
    name VARCHAR(255),
    location VARCHAR(255),
    surface_type VARCHAR(100),
    amenities TEXT,
    price_per_hour INTEGER DEFAULT 25,
    operating_hours VARCHAR(255) DEFAULT '6:00 AM - 10:00 PM daily',
    photo_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    court_id INTEGER REFERENCES courts(id),
    player_id INTEGER REFERENCES users(id),
    time_slot VARCHAR(100),
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed demo owner user if not exists
const existing = db.prepare("SELECT id FROM users WHERE email = 'carol@test.com'").get();
if (!existing) {
  db.exec(`
    INSERT INTO users (email, password, name, role, skill_level) VALUES
    ('alice@test.com', 'hashed', 'Alice Demo', 'player', 'intermediate'),
    ('bob@test.com', 'hashed', 'Bob Smith', 'player', 'beginner'),
    ('carol@test.com', 'hashed', 'Carol Owner', 'owner', 'advanced');
  `);
  console.log('✅ Demo users created');
}

console.log('✅ Database initialized:', DB_PATH);
db.close();
