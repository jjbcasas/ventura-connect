const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth')
const passport = require('passport')
// const { ensureAuth } = require('../middleware/auth')

router.get('/google', () => console.log('Google auth route hit!'), passport.authenticate('google', { scope: ['email','profile'] }))
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), authController.googleCallback)

module.exports = router
