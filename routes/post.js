const express = require('express')
const router = express.Router()
const upload = require('../middleware/multer')
const postController = require('../controllers/post')
const { ensureAuth } = require('../middleware/auth')

// Post Routes
router.get('/:id',ensureAuth, postController.getPost)
router.post('/createPost/:id', upload.single('file'), postController.createPost)
router.put('/likePost/:id', postController.likePost)
router.put('/minusLikePost/:id', postController.minusLikePost)
router.delete('/deletePost/:id', postController.deletePost)
router.put('/followUser/:id', postController.followUser)
router.put('/unfollowUser/:id', postController.unfollowUser)
router.post('/comments/:id', postController.createComment)

module.exports = router