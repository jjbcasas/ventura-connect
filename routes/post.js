const express = require('express')
const router = express.Router()
const upload = require('../middleware/multer')
const postController = require('../controllers/post')
const { ensureAuth } = require('../middleware/auth')

router.get('/:id',ensureAuth, postController.getPost)
// router.get('/:id', ensureAuth, profileController.getProfile)
router.post('/createPost/:id', upload.single('file'), postController.createPost)
router.put('/likePost/:id', postController.likePost)
router.put('/minusLikePost/:id', postController.minusLikePost)
router.delete('/deletePost/:id', postController.deletePost)
router.put('/followUser/:id', postController.followUser)
router.put('/unfollowUser/:id', postController.unfollowUser)
// router.put('/uploadProfilePhoto', upload.single('file'), postController.uploadProfilePhoto)
router.post('/comments/:id', postController.createComment)

module.exports = router