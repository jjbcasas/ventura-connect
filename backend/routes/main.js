import express from 'express'
const router = express.Router()
import { getUser, postLogin, logout, postSignup, googleLogin} from '../controllers/auth.js'
// import passport from 'passport'
import dotenv from 'dotenv'
import path from 'path'
import { arcjetProtection } from '../middleware/arcjet.js'
import { protectRoute } from '../middleware/auth.js'
dotenv.config({ path: './backend/config/.env'})

// Middlewares for Rate Limiting
router.use(arcjetProtection)

// Auth Routes
router.get('/user', protectRoute , getUser);
router.post('/login', postLogin);
router.post('/logout', logout);
router.post('/signup', postSignup);

// Google Routes
router.post("/google", googleLogin);

export default router
