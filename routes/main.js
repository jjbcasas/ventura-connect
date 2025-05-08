const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth')
const homeController = require('../controllers/home')
const passport = require('passport')
// const { ensureAuth } = require('../middleware/auth')

router.get('/', homeController.getIndex)
router.get('/login', authController.getLogin)
router.post('/login', authController.postLogin)
router.get('/logout', authController.logout)
router.get('/signup', authController.getSignup)
router.post('/signup', authController.postSignup)
router.get('/auth/google', () => console.log('Google auth route hit!'), passport.authenticate('google', { scope: ['email','profile'] }))
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), authController.googleCallback)

module.exports = router
