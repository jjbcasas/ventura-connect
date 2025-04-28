const cloudinary = require('../middleware/cloudinary')
const Post = require('../models/Post')
const User = require('../models/User')
const Comment = require('../models/Comment')

// Upload an image
module.exports = {
    getProfile: async( req, res ) => {
        try {
            const posts = await Post.find({ user: req.params.id }).sort({ createdAt: 'desc'}).lean()
            const accountUser = await User.find({ _id: req.params.id }).sort({ createdAt: 'desc'}).lean()
            const comments = await Comment.find().sort({ createdAt: 'desc'}).lean()
            const usersFriends = await User.find({ _id: req.user.id }).populate('followingId').sort({ createdAt: 'desc'}).lean()
            res.render('profile.ejs', { posts: posts, user: req.user, accountUser: accountUser, comments: comments, usersFriends: usersFriends})
        } catch (error) {
            console.log(error)
        }
    },
    // getPost: async(req, res) => {
    //     try {
    //         const post = await Post.findById(req.params.id)
    //         res.render('post.ejs', { post: post, user: req.user})
    //     } catch (error) {
    //         console.log(err)
    //     }

    // },
    createPost: async ( req, res ) => { 
        try{
            const uploadResult = await cloudinary.uploader.upload(req.file.path)

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
                res.redirect(`/profile/${req.params.id}`)
            } catch(error) {
                console.log(error);
            };
    
            // console.log(uploadResult);
    },
    likePost: async( req, res ) => {
        try {
            await Post.findOneAndUpdate(
                { _id: req.params.id },
                {
                    $inc: { likes: 1 }
                }
            )
            console.log('Likes +1')
            res.redirect(`/profile#${req.params.id}`)
        } catch (error) {
            console.log(error)
        }
    },
    deletePost: async ( req, res ) => {
        try {
            let post = await Post.findById({ _id: req.params.id})

            await cloudinary.uploader.destroy(post.cloudinaryId)

            await Post.deleteOne({ _id: req.params.id })

            console.log('Deleted Post')
            res.redirect('/profile')
        } catch (error) {
            console.log(error)
            res.redirect(`/profile/${req.params.id}`)
        }
    },
    uploadProfilePhoto: async ( req, res ) => {
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
                console.log('Profile Photo has been added!')
                res.redirect(`/profile/${req.user.id}`)
            } catch(error) {
                console.log(error);
            };
    },
    followUser: async ( req, res ) => {
        try {
            await User.findOneAndUpdate(
                { _id: req.params.id },
                {
                    $push: {
                        followerId: req.user.id,
                        // followingId: req.params.id
                    }
                }
            )
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
            await User.findOneAndUpdate(
                { _id: req.params.id },
                {
                    $pull: {
                        followerId: req.user.id
                    }
                }
            )
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
    }
}