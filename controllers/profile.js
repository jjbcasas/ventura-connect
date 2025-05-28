const cloudinary = require('../middleware/cloudinary')
const Post = require('../models/Post')
const User = require('../models/User')
const Comment = require('../models/Comment')

// Upload an image
module.exports = {
    getProfile: async( req, res ) => {
        try {
            // Find all post under that specific user
            const posts = await Post.find({ user: req.params.id }).sort({ createdAt: 'desc'}).lean()

            // Get the user that owns the specific profile page
            const accountUser = await User.find({ _id: req.params.id }).populate('followingId').sort({ createdAt: 'desc'}).lean()
            
            // Get all comments and populate the commentUser field
            const comments = await Comment.find().populate({
                path: 'commentUser'
            }).sort({ createdAt: 'desc'}).lean()

            const usersFriends = await User.find({ _id: req.user.id }).populate('followingId').sort({ createdAt: 'desc'}).lean()
            res.render('profile.ejs', { posts: posts, user: req.user, accountUser: accountUser, comments: comments, usersFriends: usersFriends})

        } catch (error) {
            console.log(error)
        }
    },
    createPost: async ( req, res ) => { 
        try{
            const uploadResult = await cloudinary.uploader.upload(req.file.path)

            // Create a post
            await Post.create({
                title: req.body.title,
                image: uploadResult.secure_url,
                cloudinaryId: uploadResult.public_id,
                caption: req.body.caption,
                likes: 0,
                user: req.user.id,
                userName: req.user.userName
            })

            console.log('Post has been added!')
            res.redirect(`/profile/${req.user.id}`)
        } catch(error) {
            console.log(error);
        };
    },
    likePost: async( req, res ) => {
        try {
            // Find and update a specific post
            let post = await Post.findOneAndUpdate(
                { _id: req.params.id },
                {
                    $inc: { likes: 1 }
                }
            )

            // Find and update a specific user
            await User.findOneAndUpdate(
                { _id: req.user.id },
                {
                    $push: { likedPostId: req.params.id }
                }
            )

            console.log('Likes +1')
            res.redirect(`/profile/${post.user}#${req.params.id}`)
        } catch (error) {
            console.log(error)
        }
    },
    minusLikePost: async ( req, res ) => {
        try {
            // Find and update a specific post
            let post = await Post.findOneAndUpdate(
                { _id: req.params.id},
                {
                    $inc: { likes: -1}
                }
            )

            // Find and update a specific user
            await User.findOneAndUpdate(
                { _id: req.user.id },
                {
                    $pull: { likedPostId: req.params.id }
                }
            )

            console.log('Likes -1')
            res.redirect(`/profile/${post.user}#${req.params.id}`)
        } catch (error) {
            console.log(error)
        }
    },
    deletePost: async ( req, res ) => {
        try {
            // Find a specific post
            let post = await Post.findById({ _id: req.params.id})

            await cloudinary.uploader.destroy(post.cloudinaryId)

            // Delete that post
            await Post.deleteOne({ _id: req.params.id })

            console.log('Deleted Post')
            res.redirect(`/profile/${req.user.id}`)
        } catch (error) {
            console.log(error)
            res.redirect(`/profile/${req.user.id}`)
        }
    },
    uploadProfilePhoto: async ( req, res ) => {
        try{
            const uploadResult = await cloudinary.uploader.upload(req.file.path)

            // Find and update a specific user
            await User.findOneAndUpdate(
                { _id: req.user.id },
                {
                    $set: {
                        profileImage: uploadResult.secure_url,
                        cloudinaryId: uploadResult.public_id
                    }
                }
            )

            console.log('Profile Photo has been added!')
            res.redirect(`/profile/${req.user.id}`)
        } catch(error) {
            console.log(error);
        };
    },
    changeProfilePhoto: async ( req, res ) => {
        try{
            const uploadResult = await cloudinary.uploader.upload(req.file.path)

            await User.findOneAndUpdate(
                { _id: req.user.id },
                {
                    $set: {
                        profileImage: uploadResult.secure_url,
                        cloudinaryId: uploadResult.public_id
                    }
                }
            )
        
            console.log('Profile Photo has been changed!')
            res.redirect(`/profile/${req.user.id}`)
        } catch(error) {
            console.log(error);
        };
    },
    followUser: async ( req, res ) => {
        try {

            // Find and update a specific user
            await User.findOneAndUpdate(
                { _id: req.params.id },
                {
                    $push: {
                        followerId: req.user.id,
                    }
                }
            )

            // Find and update a specific user
            await User.findOneAndUpdate(
                { _id: req.user.id },
                {
                    $push: {
                        followingId: req.params.id
                    }
                }
            )

            console.log('Followed a user')
            res.redirect(`/profile/${req.params.id}`)
        } catch (error) {
            console.log(error)
        }
    },
    unfollowUser: async ( req, res ) => {
        try {
            // Find and update a specific user
            await User.findOneAndUpdate(
                { _id: req.params.id },
                {
                    $pull: {
                        followerId: req.user.id
                    }
                }
            )

            // Find and update a specific user
            await User.findOneAndUpdate(
                { _id: req.user.id },
                {
                    $pull: {
                        followingId: req.params.id
                    }
                }
            )

            console.log('Unfollowed a user')
            res.redirect(`/profile/${req.params.id}`)
        } catch (error) {
            console.log(error)
        }
    },
    createComment: async ( req, res ) => {
        try {
            // Create a comment
            await Comment.create({
                comment: req.body.comment,
                commentUser: req.user.id,
                commentUserName: req.user.userName,
                postId: req.params.id
            })

            console.log('Comment has been added')
            res.redirect(`/profile/${post[0].user}`)
        } catch (error) {
            console.log(error)
        }
    }
}