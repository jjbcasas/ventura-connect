// const { create } = require('connect-mongo')
const cloudinary = require('../middleware/cloudinary')
const Post = require('../models/Post')
const User = require('../models/User')
const Comment = require('../models/Comment')

module.exports = {
    getFeed: async ( req, res ) => {
        try {
            const posts = await Post.find().sort({ createdAt: 'desc'}).lean()
            const allUsers = await User.find().sort({ createdAt: 'desc'}).lean()
            const comments = await Comment.find().sort({ createdAt: 'desc'}).lean()
            res.render('feed.ejs', { posts: posts, user: req.user, comments: comments, allUsers: allUsers })
            // console.log(comments[0].postId)
            // console.log(posts)
            // console.log(req)
        } catch (err) {
            console.log(err)
        }
    },
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
                    res.redirect('/feed')
                } catch(error) {
                    console.log(error);
                };
        },
        likePost: async ( req, res ) => {
            try {
                await Post.findOneAndUpdate(
                    { _id: req.params.id},
                    {
                        $inc: { likes: 1}
                    }
                )
                await User.findOneAndUpdate(
                    { _id: req.user.id },
                    {
                        $push: { likedPostId: req.params.id }
                    }
                )
                console.log(' Likes +1')
                res.redirect(`/feed#${req.params.id}`)
            } catch (error) {
                console.log(error)
            }
        },
        minusLike: async ( req, res ) => {
            try {
                await Post.findOneAndUpdate(
                    { _id: req.params.id},
                    {
                        $inc: { likes: -1}
                    }
                )
                await User.findOneAndUpdate(
                    { _id: req.user.id },
                    {
                        $pull: { likedPostId: req.params.id }
                    }
                )
                console.log(' Likes -1')
                res.redirect(`/feed#${req.params.id}`)
            } catch (error) {
                console.log(error)
            }
        },
        deletePost: async ( req, res ) => {
            try {
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
                await Comment.create({
                    comment: req.body.comment,
                    commentUserName: req.user.userName ,
                    postId: req.params.id
                })
                console.log('Comment has been added')
                res.redirect('/feed')
            } catch (error) {
                console.log(error)
            }
        }
}