import express from 'express'
const router = express.Router()
import upload from '../middleware/multer.js'
import { getPost, followUserInPost, unfollowUserInPost, likePostInPost, minusLikeInPost, deletePostInPost, createCommentInPost, uploadProfilePhotoInPost, changeProfilePhotoInPost } from '../controllers/post.js'
import { ensureAuth } from '../middleware/auth.js'
import { arcjetProtection } from '../middleware/arcjet.js'

router.use(arcjetProtection)

// Post Routes
router.get('/:id',ensureAuth, getPost)
// router.post('/createPost/:id', upload.single('file'), postController.createPost)
router.put('/likePost/:id', likePostInPost)
router.put('/minusLikePost/:id', minusLikeInPost)
router.delete('/deletePost/:id', deletePostInPost)
router.put('/followUser/:id', followUserInPost)
router.put('/unfollowUser/:id', unfollowUserInPost)
router.post('/comments/:id', createCommentInPost)
router.put('/uploadProfilePhoto', upload.single('file'), uploadProfilePhotoInPost)
router.put('/changeProfilePhoto', upload.single('file'), changeProfilePhotoInPost)

export default router