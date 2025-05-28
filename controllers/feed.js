const cloudinary = require('../middleware/cloudinary')
const Post = require('../models/Post')
const User = require('../models/User')
const Comment = require('../models/Comment')

module.exports = {
    getFeed: async ( req, res ) => {
        try {
            // Get all post
            const posts = await Post.find().populate('user').sort({ createdAt: 'desc'}).lean()
            // Get all Comments
            const comments = await Comment.find().populate({
                path: 'commentUser'
            }).sort({ createdAt: 'desc'}).lean()
            // Get all Users
            const allUsers = await User.find().sort({ createdAt: 'desc'}).lean()

            res.render('feed.ejs', { posts: posts, user: req.user, comments: comments, allUsers: allUsers})
        } catch (err) {
            console.log(err)
        }
    },
    createPost: async ( req, res ) => { 
        try{
            const uploadResult = await cloudinary.uploader.upload(req.file.path)

            // Create a Post
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
                res.redirect('/feed')
            } catch(error) {
                console.log(error);
            };
    },
    likePost: async ( req, res ) => {
        try {
            // Find a specific post and update
            await Post.findOneAndUpdate(
                { _id: req.params.id},
                {
                    $inc: { likes: 1}
                }
            )

            // Find a specific user and update
            await User.findOneAndUpdate(
                { _id: req.user.id },
                {
                    $push: { likedPostId: req.params.id }
                }
            )
            console.log('Likes +1')
            res.redirect(`/feed#${req.params.id}`)
        } catch (error) {
            console.log(error)
        }
    },
    minusLike: async ( req, res ) => {
        try {
            // Find a specific post and update
            await Post.findOneAndUpdate(
                { _id: req.params.id},
                {
                    $inc: { likes: -1}
                }
            )

            // Find a specific user and update
            await User.findOneAndUpdate(
                { _id: req.user.id },
                {
                    $pull: { likedPostId: req.params.id }
                }
            )
            console.log('Likes -1')
            res.redirect(`/feed#${req.params.id}`)
        } catch (error) {
            console.log(error)
        }
    },
    deletePost: async ( req, res ) => {
        try {
            // Find a specific post and delete
            let post = await Post.findById({ _id: req.params.id })

            await cloudinary.uploader.destroy(post.cloudinaryId)

            await Post.deleteOne({ _id: req.params.id })

            console.log('Deleted Post')
            res.redirect('/feed')
        } catch (error) {
            console.log(error)
        }
    },
    createComment: async ( req, res ) => {
        try {
            // Create comment
            await Comment.create({
                comment: req.body.comment,
                commentUser: req.user.id,
                commentUserName: req.user.userName ,
                postId: req.params.id
            })

            console.log('Comment has been added')
            res.redirect(`/feed#${req.params.id}`)
        } catch (error) {
            console.log(error)
        }
    },
    followUser: async ( req, res ) => {
        try {
            // Find a specific user and update
            await User.findOneAndUpdate(
                { _id: req.params.id },
                {
                    $push: {
                        followerId: req.user.id,
                    }
                }
            )
        
            // Find a specific user and update
            await User.findOneAndUpdate(
                { _id: req.user.id },
                {
                    $push: {
                        followingId: req.params.id
                    }
                }
            )
        
            console.log('Followed a user')
            res.redirect(`/feed#${req.params.id}`)
        } catch (error) {
            console.log(error)
        }
    },
    unfollowUser: async ( req, res ) => {
        try {
            // Find a specific user and update
            await User.findOneAndUpdate(
                { _id: req.params.id },
                {
                    $pull: {
                        followerId: req.user.id
                    }
                }
            )
        
            // Find a specific user and update
            await User.findOneAndUpdate(
                { _id: req.user.id },
                {
                    $pull: {
                        followingId: req.params.id
                    }
                }
            )

            console.log('Unfollowed a user')
            res.redirect(`/feed#${req.params.id}`)
        } catch (error) {
            console.log(error)
        }
    }
}