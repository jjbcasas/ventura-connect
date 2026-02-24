// imports express
import express from 'express'
// initializes express
// const app = express()
// helps us log everything thats happening. to see all the requests coming thru
import logger from 'morgan'
// enable cross-origin requests
import cors from 'cors'
// parses cookies from the request headers and populates req.cookies
import cookieParser from 'cookie-parser'
// requires dotenv for us to use environment variables
import dotenv from 'dotenv'
import path from 'path'
import { connectDB } from './config/database.js'
import feedRoutes from './routes/feed.js'
import mainRoutes from './routes/main.js'
import profileRoutes from './routes/profile.js'
import postRoutes from './routes/post.js'
import messageRoutes from "./routes/message.js"
import tipRoute from "./routes/tip.js"
import { handleStripeWebhook } from './controllers/tip.js';
import { app, server } from './config/socket.js'
// import { fileURLToPath } from 'url'

// Load .env variables first
dotenv.config({ path: './backend/config/.env'})

// connect to the Database
connectDB()

const __dirname = path.resolve()
// Trust the first proxy (e.g., Render, Vercel, Nginx) to allow HTTPS cookies
app.set('trust proxy', 1)

// static folder
// app.use(express.static('public'))

// logging
app.use(logger('dev'))

const allowedOrigins = [
    'http://localhost:5173',
    process.env.BACKEND_URL
]

// cors middleware & cors header
app.use(
    cors({
        origin: allowedOrigins,
        credentials: true // If you're sending cookies/sessions
    })
)

// Route for Stripe Webhook, must be before the express.json()
app.post('/api/tip/webhook/payment', express.raw({ type: 'application/json' }), handleStripeWebhook )

// body parsing, so we can pull something from the request
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api', mainRoutes)
app.use('/api/feed', feedRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/post', postRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/tip', tipRoute)

// Production Static Assets
if ( process.env.NODE_ENV === 'production' ) {
    app.use(express.static(path.join(__dirname, '/frontend/dist')))
    app.get('/*path', (req, res) => {
        res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'))
    })
}

// Creates the http.createServer() for you behind the scenes. It's a shortcut.
// Start Server
server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}, you better catch it`)
})