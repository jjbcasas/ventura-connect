import cloudinary from '../middleware/cloudinary.js'
import Post from '../models/Post.js'
import User from '../models/User.js'
import Comment from '../models/Comment.js'
import mongoose from 'mongoose'
import { createPost, likePost, minusLike, /*deletePost,*/ createComment, followUser, unfollowUser } from '../utils/userActionService.js'

export const getFeed = async ( req, res ) => {
    try {
        // const user = req.user
        if (!req.user || !req.user.id) {
            // If the user isn't logged in, perhaps show a general public feed or login prompt
            return res.status(401).json({ message: 'Authentication required to access feed.' });
        }

        // Get all post
        const posts = await Post.find()
        .populate('user')
        .sort({ createdAt: 'desc'})
        .limit(10)
        .lean()
        // Get all Comments
        const comments = await Comment.find().populate({
            path: 'commentUser'
        }).sort({ createdAt: 'desc'})
        // Get all Users
        const allUsers = await User.find({ _id: { $ne: req.user.id } })
        .select('_id userName profileImage followingId')
        .sort({ createdAt: 'desc'}).limit(5).lean()

        console.log('Data fetched!')
        res.status(200).json({ posts, comments, allUsers})
    } catch (error) {
        console.log('Error in Fetching Data:',error.message)
        res.status(500).json({message: 'Server Error!'})
    }
}

export const createPostInFeed = createPost
export const likePostInFeed = likePost
export const minusLikeInFeed = minusLike
// export const deletePostInFeed = deletePost
export const createCommentInFeed = createComment
export const followUserInFeed = followUser
export const unfollowUserInFeed = unfollowUser

// Old functions
// export const createPost = async ( req, res ) => { 
//         try{
//             const { title, caption } = req.body
//             // const post = req.body ( also correct )

//             if ( !title || !caption ) {
//                 return res.status(400).json({ message: 'Please provide all fields.'})
//             }
//             if ( !req.file ) {
//                 return res.status(400).json({ message: 'No image file uploaded.'})
//             }
//             const uploadResult = await cloudinary.uploader.upload(req.file.path)

//             // Create a Post
//             const newPost = await Post.create({
//                 title: req.body.title,
//                 image: uploadResult.secure_url,
//                 cloudinaryId: uploadResult.public_id,
//                 caption: req.body.caption,
//                 likes: 0,
//                 user: req.user.id,
//                 userName: req.user.userName
//             })

//             const post = await Post.findById(newPost._id).populate({
//                 path: 'user'
//             })
                
//                 console.log('Post has been added!')
//                 res.status(201).json({ post, message: 'Post added successfully!'})
//             } catch(error) {
//                 console.log('Error in Creating Post:', error.message)
//                 res.status(500).json({message: 'Server Error!'})
//             };
//     }

// export const likePost = async ( req, res ) => {
//         try {
//             const { id } = req.params

//             // Validate if the provided ID is a valid MongoDB ObjectId
//             if ( !mongoose.Types.ObjectId.isValid(id)){
//                 return res.status(404).json({message: 'Invalid Post Id!'})
//             }

//             // Find a specific post and update
//             const updatedLike = await Post.findOneAndUpdate(
//                 { _id: id},
//                 {
//                     $inc: { likes: 1}
//                 },
//                 { new: true }
//             )

//             // Find a specific user and update
//             const updatedUser = await User.findOneAndUpdate(
//                 { _id: req.user.id },
//                 {
//                     $push: { likedPostId: id }
//                 },
//                 { new: true }
//             )

//             console.log('Likes +1!')
//             res.status(200).json({ message: 'Post Liked!', updatedLike, updatedUser })
//         } catch (error) {
//             console.error('Error in Liking Post:', error.message)
//             res.status(500).json({message: 'Server Error!' })
//         }
//     }

// export const minusLike = async ( req, res ) => {
//         try {
//             const { id } = req.params

//             // Validate if the provided ID is a valid MongoDB ObjectId
//             if ( !mongoose.Types.ObjectId.isValid(id)){
//                 return res.status(404).json({message: 'Invalid Post Id!'})
//             }

//             // Find a specific post and update
//             const updatedLike = await Post.findOneAndUpdate(
//                 { _id: id},
//                 {
//                     $inc: { likes: -1}
//                 },
//                 { new: true }
//             )

//             // Find a specific user and update
//             const updatedUser = await User.findOneAndUpdate(
//                 { _id: req.user.id },
//                 {
//                     $pull: { likedPostId: id }
//                 },
//                 { new: true }
//             )

//             console.log('Likes -1!')
//             res.status(200).json({ message: 'Post Unliked!', updatedLike, updatedUser })
//         } catch (error) {
//             console.error('Error in Unliking Post:', error.message)
//             res.status(500).json({message: 'Server Error!' })
//         }
//     }

// export const deletePost = async ( req, res ) => {
//         try {
//             const { id } = req.params

//             // Validate if the provided ID is a valid MongoDB ObjectId
//             if ( !mongoose.Types.ObjectId.isValid(id)){
//                 return res.status(404).json({message: 'Invalid Post Id!'})
//             }
//             // Find a specific post and delete
//             let post = await Post.findById({ _id: id })

//             await cloudinary.uploader.destroy(post.cloudinaryId)

//             await Post.deleteOne({ _id: id })

//             console.log('Deleted Post!')
//             res.status(200).json({message: 'Post Deleted!'})
//         } catch (error) {
//             console.error('Error in Deleting Post:', error.message)
//             res.status(500).json({message: 'Server Error!' })
//         }
//     }

// export const createComment = async ( req, res ) => {
//     try {
//         if ( !req.body.comment /* const { comment } = req.body */) {
//             return res.status(404).json({ message: 'Please provide all fields.'})
//         }
        
//         // Create comment
//         const newComment = await Comment.create({
//             comment: req.body.comment,
//             commentUser: req.user.id,
//             commentUserName: req.user.userName ,
//             postId: req.params.id
//         })

//         const comment = await Comment.findById(newComment._id).populate({
//             path: 'commentUser'
//         })

//         console.log('Comment has been added!')
//         res.status(201).json({comment, message: 'Comment added successfully!' })
//     } catch (error) {
//         console.log('Error in Creating Comment:', error.message)
//         res.status(500).json({message: 'Server Error!'})
//     }
// }

// export const followUser = async ( req, res ) => {
//         try {
//             const { id } = req.params

//             // Validate if the provided ID is a valid MongoDB ObjectId
//             if ( !mongoose.Types.ObjectId.isValid(id)){
//                 return res.status(404).json({message: 'Invalid Post Id!'})
//             }

//             // Find a specific user and update
//             await User.findOneAndUpdate(
//                 { _id: id },
//                 {
//                     $push: {
//                         followerId: req.user.id,
//                     }
//                 },
//                 { new: true }
//             )
        
//             // Find a specific user and update
//             const updatedFollowing = await User.findOneAndUpdate(
//                 { _id: req.user.id },
//                 {
//                     $push: {
//                         followingId: id
//                     }
//                 },
//                 { new: true }
//             )
        
//             console.log('Followed a user!')
//             res.status(200).json({ updatedFollowing, message: 'Followed successfully!'})
//         } catch (error) {
//             console.log('Error in Following User:', error.message)
//             res.status(500).json({message: 'Server Error!' })
//         }
//     }

// export const unfollowUser = async ( req, res ) => {
//         try {
//              const { id } = req.params

//             // Validate if the provided ID is a valid MongoDB ObjectId
//             if ( !mongoose.Types.ObjectId.isValid(id)){
//                 return res.status(404).json({message: 'Invalid Post Id!'})
//             }

//             // Find a specific user and update
//             await User.findOneAndUpdate(
//                 { _id: id },
//                 {
//                     $pull: {
//                         followerId: req.user.id
//                     }
//                 },
//                 { new: true }
//             )
        
//             // Find a specific user and update
//             const updatedUnfollowing = await User.findOneAndUpdate(
//                 { _id: req.user.id },
//                 {
//                     $pull: {
//                         followingId: id
//                     }
//                 },
//                 { new: true }
//             )

//             console.log('Unfollowed a user!')
//             res.status(200).json({ updatedUnfollowing, message: 'Unfollowed successfully!'})
//         } catch (error) {
//             console.log('Error in Following User:', error.message)
//             res.status(500).json({message: 'Server Error!' })
//         }
//     }