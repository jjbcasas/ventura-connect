import express from 'express'
const router = express.Router()
import { getFeed, createPostInFeed, likePostInFeed, minusLikeInFeed, /*deletePostInFeed,*/ createCommentInFeed, followUserInFeed, unfollowUserInFeed, getSearch } from '../controllers/feed.js'
import upload  from '../middleware/multer.js'
import { protectRoute } from '../middleware/auth.js'
import { arcjetProtection } from '../middleware/arcjet.js'
import { handleUpload } from '../middleware/handleUpload.js'
import { moderateImage } from '../middleware/contentModeration.js'

router.use( arcjetProtection, protectRoute )

// Feed Routes
router.get('/', getFeed)
router.post('/createPost', handleUpload(upload.single('file')), moderateImage, createPostInFeed)
router.put('/likePost/:id', likePostInFeed)
router.put('/minusLike/:id', minusLikeInFeed)
// router.delete('/deletePost/:id', deletePostInFeed)
router.post('/comments/:id', createCommentInFeed)
router.put('/followUser/:id', followUserInFeed)
router.put('/unfollowUser/:id', unfollowUserInFeed)
router.get('/search', getSearch )

export default router