import express from 'express'
const router = express.Router()
import upload from '../middleware/multer.js'
import { ensureAuth } from '../middleware/auth.js'
import { getProfile, createPostInProfile, likePostInProfile, minusLikeInProfile, deletePostInProfile, followUserInProfile, unfollowUserInProfile, uploadProfilePhotoInProfile, changeProfilePhotoInProfile, createCommentInProfile } from '../controllers/profile.js'
import { arcjetProtection } from '../middleware/arcjet.js'

router.use(arcjetProtection)

// Profile Routes
router.get('/:id', ensureAuth, getProfile)
router.post('/createPost', upload.single('file'), createPostInProfile)
router.put('/likePost/:id', likePostInProfile)
router.put('/minusLikePost/:id', minusLikeInProfile)
router.delete('/deletePost/:id', deletePostInProfile)
router.put('/followUser/:id', followUserInProfile)
router.put('/unfollowUser/:id', unfollowUserInProfile)
router.put('/uploadProfilePhoto', upload.single('file'), uploadProfilePhotoInProfile)
router.put('/changeProfilePhoto', upload.single('file'), changeProfilePhotoInProfile)
router.post('/comments/:id', createCommentInProfile)

export default router