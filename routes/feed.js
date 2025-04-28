const express = require('express')
const router = express.Router()
const feedController = require('../controllers/feed')
const upload = require('../middleware/multer')
const { ensureAuth } = require('../middleware/auth')

router.get('/', ensureAuth, feedController.getFeed)
router.post('/createPost', upload.single('file'), feedController.createPost)
router.put('/likePost/:id', feedController.likePost)
router.put('/minusLike/:id', feedController.minusLike)
router.delete('/deletePost/:id', feedController.deletePost)
router.post('/comments/:id', feedController.createComment)

module.exports = router