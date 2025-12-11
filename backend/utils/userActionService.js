import cloudinary from '../middleware/cloudinary.js'
import Post from '../models/Post.js'
import User from '../models/User.js'
import Comment from '../models/Comment.js'
import mongoose from 'mongoose'

export const createPost = async ( req, res ) => { 
    try{
        const { title, caption } = req.body
        // const post = req.body ( also correct )

        if ( !title || !caption ) {
            return res.status(400).json({ message: 'Please provide all fields.'})
        }
        if ( !req.file ) {
            return res.status(400).json({ message: 'No image file uploaded.'})
        }
        const uploadResult = await cloudinary.uploader.upload(req.file.path)

        // Create a Post
        const newPost = await Post.create({
            title: req.body.title,
            image: uploadResult.secure_url,
            cloudinaryId: uploadResult.public_id,
            caption: req.body.caption,
            likes: 0,
            user: req.user.id,
            userName: req.user.userName
        })

        const post = await Post.findById(newPost._id).populate({
            path: 'user'
        })

            console.log('Post has been added!')
            res.status(201).json({ post, message: 'Post added successfully!'})
        } catch(error) {
            console.log('Error in Creating Post:', error.message)
            res.status(500).json({message: 'Server Error!'})
        };
}

export const likePost = async ( req, res ) => {
    try {
        const { id } = req.params
        const userId = req.user.id

        // Validate if the provided ID is a valid MongoDB ObjectId
        if ( !mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({message: 'Invalid Post Id!'})
        }

        // 2. Check if the user has already liked this post to prevent duplicates
        const user = await User.findById(userId);

        if (user.likedPostId.includes(id)) {
            return res.status(409).json({ message: 'You have already liked this post.' });
        }

        // Find a specific post and update
        const updatedLike = await Post.findOneAndUpdate(
            { _id: id},
            {
                $inc: { likes: 1}
            },
            { new: true }
        ).lean()

        // Find a specific user and update
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user.id },
            {
                $push: { likedPostId: id }
            },
            { new: true }
        ).lean()

        // Check if the post was found
        if (!updatedLike) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        console.log('Likes +1!')
        res.status(200).json({ message: 'Post Liked!', updatedLike, updatedUser })
    } catch (error) {
        console.error('Error in Liking Post:', error.message)
        res.status(500).json({message: 'Server Error!' })
    }
}

export const minusLike = async ( req, res ) => {
    try {
        const { id } = req.params
        const userId = req.user.id

        // Validate if the provided ID is a valid MongoDB ObjectId
        if ( !mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({message: 'Invalid Post Id!'})
        }

        // 2. Check if the user has already liked this post before unliking
        const user = await User.findById(userId);

        if (!user.likedPostId.includes(id)) {
            return res.status(409).json({ message: 'You have not liked this post.' });
        }

        // Find a specific post and update
        const updatedLike = await Post.findOneAndUpdate(
            { _id: id},
            {
                $inc: { likes: -1}
            },
            { new: true }
        ).lean()

        // Find a specific user and update
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user.id },
            {
                $pull: { likedPostId: id }
            },
            { new: true }
        ).lean()

        // 5. Check if the post was found and updated
        if (!updatedLike) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        console.log('Likes -1!')
        res.status(200).json({ message: 'Post Unliked!', updatedLike, updatedUser })
    } catch (error) {
        console.error('Error in Unliking Post:', error.message)
        res.status(500).json({message: 'Server Error!' })
    }
}

export const deletePost = async ( req, res ) => {
    try {
        const { id } = req.params

        // Validate if the provided ID is a valid MongoDB ObjectId
        if ( !mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({message: 'Invalid Post Id!'})
        }
        // Find a specific post and delete
        const post = await Post.findById({ _id: id })

        // Check if the post was found
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        await Post.deleteOne({ _id: id })
        await Comment.deleteMany({ postId: id })
        
        await User.updateMany(
            { likedPostId: id },
            {
                $pull: { likedPostId: id }
            }
        )
        
        // This is the last step to ensure we don't end up with a broken record if any prior steps fail.
        await cloudinary.uploader.destroy(post.cloudinaryId)

        console.log('Deleted Post!')
        res.status(200).json({message: 'Post Deleted!'})
    } catch (error) {
        console.error('Error in Deleting Post:', error.message)
        res.status(500).json({message: 'Server Error!' })
    }
}

export const createComment = async ( req, res ) => {
    try {
        const { id } = req.params
                    
        // Validate if the provided ID is a valid MongoDB ObjectId
        if ( !mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({message: 'Invalid User Id!'})
        }
        
        if ( !req.body.comment /* const { comment } = req.body */) {
            return res.status(404).json({ message: 'Please provide all fields.'})
        }

        // Create comment
        const newComment = await Comment.create({
            comment: req.body.comment,
            commentUser: req.user.id,
            commentUserName: req.user.userName ,
            postId: req.params.id
        })

        const comment = await Comment.findById(newComment._id).populate({
            path: 'commentUser'
        })

        console.log('Comment has been added!')
        res.status(201).json({comment, message: 'Comment added successfully!' })
    } catch (error) {
        console.log('Error in Creating Comment:', error.message)
        res.status(500).json({message: 'Server Error!'})
    }
}

export const followUser = async ( req, res ) => {
    try {
        const { id } = req.params

        // Validate if the provided ID is a valid MongoDB ObjectId
        if ( !mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({message: 'Invalid Id!'})
        }

        // Find a specific user and update
        const updatedFollow = await User.findOneAndUpdate(
            { _id: id },
            {
                $push: {
                    followerId: req.user.id,
                }
            },
            { new: true }
        ).lean()
        
        // Find a specific user and update
        const updatedFollowing = await User.findOneAndUpdate(
            { _id: req.user.id },
            {
                $push: {
                    followingId: id
                }
            },
            { new: true }
        ).lean()
        
        if (!updatedFollow || !updatedFollowing) {
            return res.status(404).json({ message: 'User not found!' });
        }
        
        console.log('Followed a user!')
        res.status(200).json({ updatedFollow, updatedFollowing, message: 'Followed successfully!'})
    } catch (error) {
        console.log('Error in Following User:', error.message)
        res.status(500).json({message: 'Server Error!' })
    }
}

export const unfollowUser = async ( req, res ) => {
    try {
         const { id } = req.params

        // Validate if the provided ID is a valid MongoDB ObjectId
        if ( !mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({message: 'Invalid Id!'})
        }

        // Find a specific user and update
        const updatedUnfollow = await User.findOneAndUpdate(
            { _id: id },
            {
                $pull: {
                    followerId: req.user.id
                }
            },
            { new: true }
        ).lean()
        
        // Find a specific user and update
        const updatedUnfollowing = await User.findOneAndUpdate(
            { _id: req.user.id },
            {
                $pull: {
                    followingId: id
                }
            },
            { new: true }
        ).lean()

        console.log('Unfollowed a user!')
        res.status(200).json({ updatedUnfollow, updatedUnfollowing, message: 'Unfollowed successfully!'})
    } catch (error) {
        console.log('Error in Following User:', error.message)
        res.status(500).json({message: 'Server Error!' })
    }
}

export const uploadProfilePhoto = async ( req, res ) => {
    try{
        const { id } = req.user

        if ( !req.file ) {
            return res.status(400).json({ message: 'No image file uploaded.'})
           }

        // uncomment if you want two-step process
        // Validate if the provided ID is a valid MongoDB ObjectId
        if ( !mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({message: 'Invalid User Id!'})
        }

        const user = await User.findById({ _id: id })
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const uploadResult = await cloudinary.uploader.upload(req.file.path)

         // Find and update a specific user
        const newProfileImage = await User.findOneAndUpdate(
            { _id: req.user.id },
            {
                $set: {
                    profileImage: uploadResult.secure_url,
                    cloudinaryId: uploadResult.public_id
                }
            },
            { new: true }
        )

        console.log('Profile Photo has been added!')
        res.status(200).json({ newProfileImage , message: 'Photo uploaded successfully!'})
    } catch(error) {
        console.log('Error in uploading photo:', error.message)
        res.status(500).json({message: 'Server Error!'})
    };
}

export const changeProfilePhoto = async ( req, res ) => {
    try{
        const { id } = req.user

        if ( !req.file ) {
            return res.status(400).json({ message: 'No image file uploaded.'})
        }

        // uncomment if you want two-step process
        // Validate if the provided ID is a valid MongoDB ObjectId
        if ( !mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({message: 'Invalid User Id!'})
        }

        const user = await User.findById({ _id: id })
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        await cloudinary.uploader.destroy(user.cloudinaryId)

        const uploadResult = await cloudinary.uploader.upload(req.file.path)

        const newProfileImage = await User.findOneAndUpdate(
            { _id: req.user.id },
            {
                $set: {
                    profileImage: uploadResult.secure_url,
                    cloudinaryId: uploadResult.public_id
                }
            },
            { new: true }
        )

        console.log('Profile Photo has been updated!')
        res.status(200).json({ newProfileImage , message: 'Photo updated successfully!'})
    } catch(error) {
        console.log('Error in uploading photo:', error.message)
        res.status(500).json({message: 'Server Error!'})
    };
}