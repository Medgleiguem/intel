import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Import routes
import servicesRoutes from './src/routes/services.js'
import documentsRoutes from './src/routes/documents.js'
import proceduresRoutes from './src/routes/procedures.js'
import aiRoutes from './src/routes/ai.js'
import syncRoutes from './src/routes/sync.js'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://moussadar.com', 'https://www.moussadar.com']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Apply rate limiting to all API routes
app.use('/api/', limiter)

// Stricter rate limiting for AI routes
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // limit each IP to 20 AI requests per windowMs
  message: 'Too many AI requests, please try again later.',
})

// Body parsing middleware
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  })
})

// API routes
app.use('/api/services', servicesRoutes)
app.use('/api/documents', documentsRoutes)
app.use('/api/procedures', proceduresRoutes)
app.use('/api/ai', aiLimiter, aiRoutes)
app.use('/api/sync', syncRoutes)

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')))
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  
  const status = err.status || 500
  const message = err.message || 'Internal Server Error'
  
  res.status(status).json({
    error: {
      message,
      status,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
      timestamp: new Date().toISOString()
    }
  })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
  })
})

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Moussadar backend server running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})

export default app