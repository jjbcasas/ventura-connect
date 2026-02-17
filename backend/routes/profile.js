import express from 'express'
const router = express.Router()
import upload from '../middleware/multer.js'
import { protectRoute } from '../middleware/auth.js'
import { getProfile, createPostInProfile, likePostInProfile, minusLikeInProfile, deletePostInProfile, followUserInProfile, unfollowUserInProfile, uploadProfilePhotoInProfile, createCommentInProfile } from '../controllers/profile.js'
import { arcjetProtection } from '../middleware/arcjet.js'
import { handleUpload } from '../middleware/handleUpload.js'

router.use( arcjetProtection, protectRoute )

// Profile Routes
router.get('/:id', getProfile)
router.post('/createPost', handleUpload(upload.single('file')), createPostInProfile)
router.put('/likePost/:id', likePostInProfile)
router.put('/minusLikePost/:id', minusLikeInProfile)
router.delete('/deletePost/:id', deletePostInProfile)
router.put('/followUser/:id', followUserInProfile)
router.put('/unfollowUser/:id', unfollowUserInProfile)
router.patch('/uploadProfilePhoto', handleUpload(upload.single('file')), uploadProfilePhotoInProfile)
// router.put('/changeProfilePhoto', upload.single('file'), changeProfilePhotoInProfile)
router.post('/comments/:id', createCommentInProfile)

export default router