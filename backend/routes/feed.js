import express from 'express'
const router = express.Router()
import { getFeed, createPostInFeed, likePostInFeed, minusLikeInFeed, /*deletePostInFeed,*/ createCommentInFeed, followUserInFeed, unfollowUserInFeed } from '../controllers/feed.js'
import upload  from '../middleware/multer.js'
import { ensureAuth } from '../middleware/auth.js'
import { arcjetProtection } from '../middleware/arcjet.js'

router.use(arcjetProtection)

// Feed Routes
router.get('/', ensureAuth, getFeed)
router.post('/createPost', upload.single('file'), createPostInFeed)
router.put('/likePost/:id', likePostInFeed)
router.put('/minusLike/:id', minusLikeInFeed)
// router.delete('/deletePost/:id', deletePostInFeed)
router.post('/comments/:id', createCommentInFeed)
router.put('/followUser/:id', followUserInFeed)
router.put('/unfollowUser/:id', unfollowUserInFeed)

export default router