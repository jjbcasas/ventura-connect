import cloudinary from '../middleware/cloudinary.js'
import Post from '../models/Post.js'
import User from '../models/User.js'
import Comment from '../models/Comment.js'
import mongoose from 'mongoose'
import { createPost, likePost, minusLike, deletePost, createComment, followUser, unfollowUser, changeProfilePhoto, uploadProfilePhoto } from '../utils/userActionService.js'

// Upload an image
export const getProfile = async( req, res ) => {
    try {
        const { id } = req.params

        // Validate if the provided ID is a valid MongoDB ObjectId
        if ( !mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({message: 'Invalid User Id!'})
        }

        // Find all post under that specific user
        const posts = await Post.find({ user: req.params.id }).populate({
        path: 'user',
            populate: {
                path: 'followingId'
            }
    }).sort({ createdAt: 'desc'}).lean()

        // Get the user that owns the specific profile page
        const accountUser = await User.findOne({ _id: req.params.id }).populate('followingId').lean()

        if (!accountUser) {
            return res.status(404).json({ message: 'User profile not found.' });
        }

        const postIdsArray = posts.map(post => post._id)
        // Get all comments and populate the commentUser field
        const comments = await Comment.find({
            postId: { $in: postIdsArray }
        }).populate({
            path: 'commentUser'
        }).sort({ createdAt: 'desc'})

        const usersFriends = await User.findOne({ _id: req.user.id }).populate('followingId').lean()

        console.log('Data fetched!')
        res.status(200).json({ posts, accountUser, comments, usersFriends, message: 'Data fetched successfully!'})
    } catch (error) {
        console.log('Error Fetching Data:', error.message)
        res.status(500).json({message: 'Server Error!'})
    }
}

export const createPostInProfile = createPost
export const likePostInProfile = likePost
export const minusLikeInProfile = minusLike
export const deletePostInProfile = deletePost
export const createCommentInProfile = createComment
export const followUserInProfile = followUser
export const unfollowUserInProfile = unfollowUser
export const uploadProfilePhotoInProfile = uploadProfilePhoto
export const changeProfilePhotoInProfile = changeProfilePhoto

// Old functions
// export const createPost = async ( req, res ) => { 
//     try{
//         const { title, caption } = req.body
//         // const post = req.body ( also correct )
        
//         if ( !title || !caption ) {
//             return res.status(400).json({ message: 'Please provide all fields.'})
//         }
//         if ( !req.file ) {
//             return res.status(400).json({ message: 'No image file uploaded.'})
//         }
//         const uploadResult = await cloudinary.uploader.upload(req.file.path)
        
//         // Create a Post
//         const newPost = await Post.create({
//             title: req.body.title,
//             image: uploadResult.secure_url,
//             cloudinaryId: uploadResult.public_id,
//             caption: req.body.caption,
//             likes: 0,
//             user: req.user.id,
//             userName: req.user.userName
//         })
        
//         const post = await Post.findById(newPost._id).populate({
//             path: 'user'
//         })
                        
//             console.log('Post has been added!')
//             res.status(201).json({ post, message: 'Post added successfully!'})
//         } catch(error) {
//             console.log('Error in Creating Post:', error.message)
//             res.status(500).json({message: 'Server Error!'})
//         };
//     }

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
//         // Find a specific post and delete
//         let post = await Post.findById({ _id: id })

//         await cloudinary.uploader.destroy(post.cloudinaryId)

//         await Post.deleteOne({ _id: id })

//         console.log('Deleted Post!')
//         res.status(200).json({message: 'Post Deleted!'})
//     } catch (error) {
//         console.error('Error in Deleting Post:', error.message)
//         res.status(500).json({message: 'Server Error!' })
//     }
// }

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

// export const uploadProfilePhoto = async ( req, res ) => {
//     try{
//         if ( !req.file ) {
//             return res.status(400).json({ message: 'No image file uploaded.'})
//            }
//         const uploadResult = await cloudinary.uploader.upload(req.file.path)

//          // Find and update a specific user
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
//         const { id } = req.user

//         if ( !req.file ) {
//             return res.status(400).json({ message: 'No image file uploaded.'})
//         }

//         // uncomment if you want two-step process
//         // Validate if the provided ID is a valid MongoDB ObjectId
//         // if ( !mongoose.Types.ObjectId.isValid(id)){
//         //     return res.status(404).json({message: 'Invalid Post Id!'})
//         // }

//         const user = await User.findById({ _id: id })
//         if (!user) {
//             return res.status(404).json({ message: 'User not found.' });
//         }
//         await cloudinary.uploader.destroy(user.cloudinaryId)

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