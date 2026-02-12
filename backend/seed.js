#!/usr/bin/env node
/**
 * Seed script for Pickleball Platform - populates 10 realistic courts
 * Usage: node seed.js [--reset]
 *   --reset: Drop and recreate courts table before seeding
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'pickleball.db');
const RESET = process.argv.includes('--reset');

const courts = [
  {
    name: "Sunset Pickleball Club",
    location: "123 Sunset Blvd, San Jose, CA",
    surface_type: "hardcourt",
    amenities: "Lights, Restrooms, Water fountain, Ball machine rental",
    price_per_hour: 25,
    operating_hours: "6:00 AM - 10:00 PM daily",
    photo_url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800"
  },
  {
    name: "Bay Area Courts",
    location: "456 Marina Dr, San Francisco, CA",
    surface_type: "hardcourt",
    amenities: "Covered courts, Pro shop, Parking, Coaching available",
    price_per_hour: 35,
    operating_hours: "7:00 AM - 9:00 PM daily",
    photo_url: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800"
  },
  {
    name: "Golden Gate Pickleball",
    location: "789 Park Ave, Oakland, CA",
    surface_type: "other",
    amenities: "Indoor, Climate controlled, Locker rooms, Showers",
    price_per_hour: 45,
    operating_hours: "6:00 AM - 11:00 PM daily",
    photo_url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800"
  },
  {
    name: "Peninsula Paddle Center",
    location: "321 El Camino Real, Palo Alto, CA",
    surface_type: "hardcourt",
    amenities: "Lights, Seating, Vending machines, Free Wi-Fi",
    price_per_hour: 30,
    operating_hours: "7:00 AM - 10:00 PM daily",
    photo_url: null
  },
  {
    name: "South Bay Smash Courts",
    location: "555 Stevens Creek, Cupertino, CA",
    surface_type: "other",
    amenities: "Outdoor, Shaded seating, Free parking, Picnic area",
    price_per_hour: 20,
    operating_hours: "6:00 AM - 9:00 PM daily",
    photo_url: null
  },
  {
    name: "Desert Dink Pickleball",
    location: "2100 E Camelback Rd, Scottsdale, AZ",
    surface_type: "hardcourt",
    amenities: "Shaded courts, Misting system, Pro shop, Tournament hosting",
    price_per_hour: 28,
    operating_hours: "5:00 AM - 9:00 PM daily",
    photo_url: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800"
  },
  {
    name: "Lone Star Paddle Club",
    location: "800 Congress Ave, Austin, TX",
    surface_type: "clay",
    amenities: "Clay courts, Clubhouse, Bar & grill, Lessons",
    price_per_hour: 40,
    operating_hours: "7:00 AM - 10:00 PM Mon-Sat, 8:00 AM - 8:00 PM Sun",
    photo_url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800"
  },
  {
    name: "Peach State Pickleball",
    location: "450 Peachtree St NE, Atlanta, GA",
    surface_type: "hardcourt",
    amenities: "Lights, Restrooms, Water stations, Beginner clinics",
    price_per_hour: 22,
    operating_hours: "6:00 AM - 10:00 PM daily",
    photo_url: null
  },
  {
    name: "Mile High Dinks",
    location: "1550 Court Pl, Denver, CO",
    surface_type: "other",
    amenities: "Indoor, Heated, Altitude training, Equipment rental",
    price_per_hour: 38,
    operating_hours: "6:00 AM - 11:00 PM daily",
    photo_url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800"
  },
  {
    name: "Emerald City Courts",
    location: "305 Harrison St, Seattle, WA",
    surface_type: "hardcourt",
    amenities: "Covered outdoor, Rain shelters, Coffee bar, Open play sessions",
    price_per_hour: 15,
    operating_hours: "7:00 AM - 9:00 PM daily",
    photo_url: null
  }
];

try {
  const db = new Database(DB_PATH);
  
  // Ensure courts table has new columns (migration)
  const tableInfo = db.pragma('table_info(courts)');
  const columns = tableInfo.map(c => c.name);
  
  if (!columns.includes('price_per_hour')) {
    db.exec('ALTER TABLE courts ADD COLUMN price_per_hour INTEGER DEFAULT 25');
    console.log('  Added column: price_per_hour');
  }
  if (!columns.includes('operating_hours')) {
    db.exec("ALTER TABLE courts ADD COLUMN operating_hours TEXT DEFAULT '6:00 AM - 10:00 PM daily'");
    console.log('  Added column: operating_hours');
  }
  if (!columns.includes('photo_url')) {
    db.exec('ALTER TABLE courts ADD COLUMN photo_url TEXT');
    console.log('  Added column: photo_url');
  }

  if (RESET) {
    db.exec('DELETE FROM courts');
    console.log('🗑️  Cleared existing courts');
  }

  const insert = db.prepare(`
    INSERT INTO courts (owner_id, name, location, surface_type, amenities, price_per_hour, operating_hours, photo_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  // Get owner_id (carol) or default to 1
  const owner = db.prepare("SELECT id FROM users WHERE role = 'owner' LIMIT 1").get();
  const ownerId = owner ? owner.id : 1;

  const insertMany = db.transaction((courts) => {
    for (const c of courts) {
      insert.run(ownerId, c.name, c.location, c.surface_type, c.amenities, c.price_per_hour, c.operating_hours, c.photo_url);
    }
  });

  insertMany(courts);

  const count = db.prepare('SELECT COUNT(*) as count FROM courts').get();
  console.log(`✅ Seeded 10 courts (${count.count} total in database)`);

  // Display summary
  const all = db.prepare('SELECT id, name, location, price_per_hour, surface_type FROM courts ORDER BY id').all();
  console.log('\n📋 Courts in database:');
  for (const c of all) {
    console.log(`  #${c.id} ${c.name} | ${c.location} | $${c.price_per_hour}/hr | ${c.surface_type}`);
  }

  db.close();
} catch (err) {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
}
