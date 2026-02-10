require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const http = require('http')
const socketIO = require('socket.io')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { Pool } = require('pg')

const app = express()
const server = http.createServer(app)
const io = socketIO(server, {
  cors: { origin: '*' },
})

// Middleware
app.use(cors())
app.use(bodyParser.json())

// Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Initialize database tables
async function initializeDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50),
        skill_level VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS courts (
        id SERIAL PRIMARY KEY,
        owner_id INT REFERENCES users(id),
        name VARCHAR(255),
        location VARCHAR(255),
        surface_type VARCHAR(100),
        amenities TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        court_id INT REFERENCES courts(id),
        player_id INT REFERENCES users(id),
        time_slot VARCHAR(100),
        status VARCHAR(50) DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INT REFERENCES users(id),
        receiver_id INT REFERENCES users(id),
        content TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    console.log('✅ Database tables initialized')
  } catch (error) {
    console.error('❌ Database initialization error:', error)
  }
}

// Auth Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.id
    req.userRole = decoded.role
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// Routes

// Auth Routes
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name, role, skillLevel } = req.body

    // Check if user exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password, name, role, skill_level) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role',
      [email, hashedPassword, name, role, skillLevel]
    )

    const user = result.rows[0]
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET)

    res.json({ token, user })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const user = result.rows[0]
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET)

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Courts Routes
app.get('/courts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courts ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (error) {
    console.error('Fetch courts error:', error)
    res.status(500).json({ error: 'Failed to fetch courts' })
  }
})

app.post('/courts', authenticate, async (req, res) => {
  try {
    const { name, location, surfaceType, amenities } = req.body

    const result = await pool.query(
      'INSERT INTO courts (owner_id, name, location, surface_type, amenities) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.userId, name, location, surfaceType, amenities]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('Create court error:', error)
    res.status(500).json({ error: 'Failed to create court' })
  }
})

// Bookings Routes
app.get('/bookings', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, c.name as court_name, c.location 
       FROM bookings b 
       JOIN courts c ON b.court_id = c.id 
       WHERE b.player_id = $1 
       ORDER BY b.created_at DESC`,
      [req.userId]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Fetch bookings error:', error)
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
})

app.post('/bookings', authenticate, async (req, res) => {
  try {
    const { courtId, timeSlot } = req.body

    const result = await pool.query(
      'INSERT INTO bookings (court_id, player_id, time_slot) VALUES ($1, $2, $3) RETURNING *',
      [courtId, req.userId, timeSlot]
    )

    io.emit('booking_created', result.rows[0])
    res.json(result.rows[0])
  } catch (error) {
    console.error('Create booking error:', error)
    res.status(500).json({ error: 'Failed to create booking' })
  }
})

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Pickleball API is running' })
})

// Socket.io
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Start server
const PORT = process.env.PORT || 3001
initializeDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🎾 Pickleball API running on port ${PORT}`)
  })
})
