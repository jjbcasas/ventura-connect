import express from "express"
const router = express.Router()
import { protectRoute } from '../middleware/auth.js'
import { arcjetProtection } from '../middleware/arcjet.js'
import { checkoutSession, createConnectAccount, handleStripeWebhook, verifySession } from "../controllers/tip.js"

router.use( arcjetProtection )

router.get('/verify', protectRoute, verifySession )
router.patch('/createAccount', protectRoute, createConnectAccount )
router.post('/checkout-session/:id', protectRoute, checkoutSession)
router.post('/webhook/payment', handleStripeWebhook )

export default router