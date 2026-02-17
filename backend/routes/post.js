import express from 'express'
const router = express.Router()
import upload from '../middleware/multer.js'
import { getPost, followUserInPost, unfollowUserInPost, likePostInPost, minusLikeInPost, deletePostInPost, createCommentInPost, uploadProfilePhotoInPost } from '../controllers/post.js'
import { protectRoute } from '../middleware/auth.js'
import { arcjetProtection } from '../middleware/arcjet.js'
import { handleUpload } from '../middleware/handleUpload.js'

router.use( arcjetProtection, protectRoute )

// Post Routes
router.get('/:id', getPost)
// router.post('/createPost/:id', upload.single('file'), postController.createPost)
router.put('/likePost/:id', likePostInPost)
router.put('/minusLikePost/:id', minusLikeInPost)
router.delete('/deletePost/:id', deletePostInPost)
router.put('/followUser/:id', followUserInPost)
router.put('/unfollowUser/:id', unfollowUserInPost)
router.post('/comments/:id', createCommentInPost)
router.patch('/uploadProfilePhoto', handleUpload(upload.single('file')), uploadProfilePhotoInPost)
// router.put('/changeProfilePhoto', upload.single('file'), changeProfilePhotoInPost)

export default router