const express = require('express')
const router = express.Router()
const upload = require('../middleware/multer')
const profileController = require('../controllers/profile')
const { ensureAuth } = require('../middleware/auth')
// const { route } = require('./feed')

router.get('/:id', ensureAuth, profileController.getProfile)
router.post('/createPost', upload.single('file'), profileController.createPost)
// router.get('/getPost/:id', profileController.getPost)
router.put('/likePost/:id', profileController.likePost)
router.put('/minusLikePost/:id', profileController.minusLikePost)
router.delete('/deletePost/:id', profileController.deletePost)
router.put('/followUser/:id', profileController.followUser)
router.put('/unfollowUser/:id', profileController.unfollowUser)
router.put('/uploadProfilePhoto', upload.single('file'), profileController.uploadProfilePhoto)
router.post('/comments/:id', profileController.createComment)

module.exports = router