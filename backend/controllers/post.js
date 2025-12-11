import cloudinary from '../middleware/cloudinary.js'
import Post from '../models/Post.js'
import User from '../models/User.js'
import Comment from '../models/Comment.js'
import mongoose from 'mongoose'
import { likePost, minusLike, deletePost, createComment, followUser, unfollowUser, uploadProfilePhoto, changeProfilePhoto } from '../utils/userActionService.js'

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
export const changeProfilePhotoInPost = changeProfilePhoto

// export const followUser = async ( req, res ) => {
//     try {
//         const { id } = req.params

//         // Validate if the provided ID is a valid MongoDB ObjectId
//         if ( !mongoose.Types.ObjectId.isValid(id)){
//             return res.status(404).json({message: 'Invalid User Id!'})
//         }

//         // Find a specific user and update
//         const updatedFollow = await User.findOneAndUpdate(
//             { _id: id },
//             {
//                 $push: {
//                     followerId: req.user.id,
//                 }
//             },
//             { new: true }
//         )
        
//         // Find a specific user and update
//         await User.findOneAndUpdate(
//             { _id: req.user.id },
//             {
//                 $push: {
//                     followingId: id
//                 }
//             },
//             { new: true }
//         )
        
//         console.log('Followed a user!')
//         res.status(200).json({ updatedFollow, message: 'Followed successfully!'})
//     } catch (error) {
//         console.log('Error in Following User:', error.message)
//         res.status(500).json({message: 'Server Error!' })
//     }
// }

// export const unfollowUser = async ( req, res ) => {
//     try {
//          const { id } = req.params

//         // Validate if the provided ID is a valid MongoDB ObjectId
//         if ( !mongoose.Types.ObjectId.isValid(id)){
//             return res.status(404).json({message: 'Invalid User Id!'})
//         }

//         // Find a specific user and update
//         const updatedUnfollow = await User.findOneAndUpdate(
//             { _id: id },
//             {
//                 $pull: {
//                     followerId: req.user.id
//                 }
//             },
//             { new: true }
//         )
        
//         // Find a specific user and update
//         await User.findOneAndUpdate(
//             { _id: req.user.id },
//             {
//                 $pull: {
//                     followingId: id
//                 }
//             },
//             { new: true }
//         )

//         console.log('Unfollowed a user!')
//         res.status(200).json({ updatedUnfollow, message: 'Unfollowed successfully!'})
//     } catch (error) {
//         console.log('Error in Following User:', error.message)
//         res.status(500).json({message: 'Server Error!' })
//     }
// }

// export const likePost = async( req, res ) => {
//     try {
//         const { id } = req.params
    
//         // Validate if the provided ID is a valid MongoDB ObjectId
//         if ( !mongoose.Types.ObjectId.isValid(id)){
//             return res.status(404).json({message: 'Invalid Post Id!'})
//         }
    
//         // Find a specific post and update
//         const updatedLike = await Post.findOneAndUpdate(
//             { _id: id},
//             {
//                 $inc: { likes: 1}
//             },
//             { new: true }
//         )
    
//         // Find a specific user and update
//         const updatedUser = await User.findOneAndUpdate(
//             { _id: req.user.id },
//             {
//                 $push: { likedPostId: id }
//             },
//             { new: true }
//         )
    
//         console.log('Likes +1!')
//         res.status(200).json({ message: 'Post Liked!', updatedLike, updatedUser })
//     } catch (error) {
//         console.error('Error in Liking Post:', error.message)
//         res.status(500).json({message: 'Server Error!' })
//     }
// }

// export const minusLikePost = async ( req, res ) => {
// try {
//     const { id } = req.params

//     // Validate if the provided ID is a valid MongoDB ObjectId
//     if ( !mongoose.Types.ObjectId.isValid(id)){
//         return res.status(404).json({message: 'Invalid Post Id!'})
//     }

//     // Find a specific post and update
//     const updatedLike = await Post.findOneAndUpdate(
//         { _id: id},
//         {
//             $inc: { likes: -1}
//         },
//         { new: true }
//     )

//     // Find a specific user and update
//     const updatedUser = await User.findOneAndUpdate(
//         { _id: req.user.id },
//         {
//             $pull: { likedPostId: id }
//         },
//         { new: true }
//     )

//     console.log('Likes -1!')
//     res.status(200).json({ message: 'Post Unliked!', updatedLike, updatedUser })
// } catch (error) {
//     console.error('Error in Unliking Post:', error.message)
//     res.status(500).json({message: 'Server Error!' })
// }
// }

// export const deletePost = async ( req, res ) => {
//     try {
//         const { id } = req.params

//         // Validate if the provided ID is a valid MongoDB ObjectId
//         if ( !mongoose.Types.ObjectId.isValid(id)){
//             return res.status(404).json({message: 'Invalid Post Id!'})
//         }

//         let post = await Post.findById({ _id: id })

//         await cloudinary.uploader.destroy(post.cloudinaryId)

//         // Find a specific post and delete
//         await Post.deleteOne({ _id: id })

//         console.log('Deleted Post!')
//         res.status(200).json({message: 'Post Deleted!', post})
//     } catch (error) {
//         console.error('Error in Deleting Post:', error.message)
//         res.status(500).json({message: 'Server Error!' })
//     }
// }

// export const createComment = async ( req, res ) => {
//     try {
//         const { id } = req.params
            
//         // Validate if the provided ID is a valid MongoDB ObjectId
//         if ( !mongoose.Types.ObjectId.isValid(id)){
//             return res.status(404).json({message: 'Invalid User Id!'})
//         }

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

// export const uploadProfilePhoto = async ( req, res ) => {
//     try{
//         if ( !req.file ) {
//             return res.status(400).json({ message: 'No image file uploaded.'})
//         }
//         const uploadResult = await cloudinary.uploader.upload(req.file.path)

//         // Find and update a specific user
//         const newProfileImage = await User.findOneAndUpdate(
//             { _id: req.user.id },
//             {
//                 $set: {
//                     profileImage: uploadResult.secure_url,
//                     cloudinaryId: uploadResult.public_id
//                 }
//             },
//             { new: true }
//         )

//         console.log('Profile Photo has been added!')
//         res.status(200).json({ newProfileImage , message: 'Photo uploaded successfully!'})
//     } catch(error) {
//         console.log('Error in uploading photo:', error.message)
//         res.status(500).json({message: 'Server Error!'})
//     };
// }

// export const changeProfilePhoto = async ( req, res ) => {
//     try{
//         if ( !req.file ) {
//             return res.status(400).json({ message: 'No image file uploaded.'})
//         }
//         const uploadResult = await cloudinary.uploader.upload(req.file.path)

//         const newProfileImage = await User.findOneAndUpdate(
//             { _id: req.user.id },
//             {
//                 $set: {
//                     profileImage: uploadResult.secure_url,
//                     cloudinaryId: uploadResult.public_id
//                 }
//             },
//             { new: true }
//         )
    
        
//         console.log('Profile Photo has been updated!')
//         res.status(200).json({ newProfileImage , message: 'Photo updated successfully!'})
//     } catch(error) {
//         console.log('Error in uploading photo:', error.message)
//         res.status(500).json({message: 'Server Error!'})
//     };
// }