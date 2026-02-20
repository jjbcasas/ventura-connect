import express from 'express'
const router = express.Router()
import { getFeed, createPostInFeed, likePostInFeed, minusLikeInFeed, createCommentInFeed, followUserInFeed, unfollowUserInFeed, getSearch } from '../controllers/feed.js'
import upload  from '../middleware/multer.js'
import { protectRoute } from '../middleware/auth.js'
import { arcjetProtection } from '../middleware/arcjet.js'
import { handleUpload } from '../middleware/handleUpload.js'
import { moderateImage } from '../middleware/contentModeration.js'

// Middlewares for Rate Limiting and jwt authentication
router.use( arcjetProtection, protectRoute )

// Feed Routes
router.get('/', getFeed)
router.get('/search', getSearch )

router.put('/likePost/:id', likePostInFeed)
router.put('/minusLike/:id', minusLikeInFeed)
router.put('/followUser/:id', followUserInFeed)
router.put('/unfollowUser/:id', unfollowUserInFeed)
router.post('/createPost', handleUpload(upload.single('file')), moderateImage, createPostInFeed)
router.post('/comments/:id', createCommentInFeed)

export default router