const express = require('express')
const router = express.Router()
const passport = require('passport')
// const authGoogleController = require('../controllers/authGoogle')

router.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }))
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
function(req, res) {
  // Successful authentication, redirect home.
  res.redirect('/');
})

module.exports = router