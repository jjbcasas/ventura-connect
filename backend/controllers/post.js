import Post from '../models/Post.js'
import Comment from '../models/Comment.js'
import mongoose from 'mongoose'
import { likePost, minusLike, deletePost, createComment, followUser, unfollowUser, uploadProfilePhoto } from '../utils/userActionService.js'

// Post Controller
export const getPost = async(req, res) => {
    try {
        const { id } = req.params

        // Validate if the provided ID is a valid MongoDB ObjectId
        if ( !mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({message: 'Post not found.'})
        }
        // Find a specific post and populate
        const post = await Post.findOne({ _id: req.params.id }).populate({
            path: 'user',
                populate: {
                    path: 'followingId'
                }
        }).lean()

        if (!post) {
            // This handles the "invalid ID requested" scenario where the ID format is correct 
            // but no document exists. This is a data-specific 404.
            return res.status(404).json({ message: 'Post not found.' });
        }

        const accountUser = post.user

        // Find or get all comment under the same user
        const comments = await Comment.find({ postId: req.params.id}).populate({
            path: 'commentUser'
        })
        .sort({ createdAt: 'desc'}).lean()

        console.log('Data fetched!')
        res.status(200).json({ post, accountUser ,comments, message: 'Data fetched successfully!' })
    } catch (error) {
        console.log('Error Fetching Data:', error.message)
        res.status(500).json({message: 'Server Error!'})
    }
}

export const likePostInPost = likePost
export const minusLikeInPost = minusLike
export const deletePostInPost = deletePost
export const createCommentInPost = createComment
export const followUserInPost = followUser
export const unfollowUserInPost = unfollowUser
export const uploadProfilePhotoInPost = uploadProfilePhoto