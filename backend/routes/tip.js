import express from "express"
const router = express.Router()
import { protectRoute } from '../middleware/auth.js'
import { arcjetProtection } from '../middleware/arcjet.js'
import { checkoutSession, createConnectAccount, verifySession } from "../controllers/tip.js"

router.use( arcjetProtection, protectRoute )

router.get('/verify', verifySession )
router.patch('/createAccount', createConnectAccount )
router.post('/checkout-session/:id', checkoutSession)

export default router