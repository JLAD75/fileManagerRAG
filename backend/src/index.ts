import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fileUpload from 'express-fileupload'
import { connectDatabase } from './config/database'
import authRoutes from './routes/authRoutes'
import fileRoutes from './routes/fileRoutes'
import chatRoutes from './routes/chatRoutes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// File upload middleware
app.use(fileUpload({
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  },
  abortOnLimit: true,
  createParentPath: true,
  useTempFiles: false,
}))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/chat', chatRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ message: err.message || 'Something went wrong!' })
})

// Start server
const startServer = async () => {
  try {
    await connectDatabase()

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
