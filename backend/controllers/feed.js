import Post from '../models/Post.js'
import User from '../models/User.js'
import Comment from '../models/Comment.js'
import { createPost, likePost, minusLike, createComment, followUser, unfollowUser } from '../utils/userActionService.js'

// Feed Controller
export const getFeed = async ( req, res ) => {
    try {
        // const user = req.user
        if (!req.user || !req.user._id) {
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
        const comments = await Comment.find().populate('commentUser').sort({ createdAt: 'desc'})
        // Get all Users
        const allUsers = await User.find({ _id: { $ne: req.user._id } })
        .select('_id userName profileImage followerId followingId')
        .sort({ createdAt: 'desc'}).lean()

        console.log('Data fetched!')
        // console.log(allUsers)
        res.status(200).json({ posts, comments, allUsers})
    } catch (error) {
        console.log('Error in Fetching Data:',error.message)
        res.status(500).json({message: 'Server Error!'})
    }
}

// Search Controller
export const getSearch = async ( req, res ) => {
    try {
        const name = req.query.name?.trim() // const { name } = req.query
        // A simple way to escape special characters
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Only search if 'name' is provided
        if (!name) return res.status(200).json({
            searchResult: [],
            message: "Please provide a name"

        });

        const searchResult = await User.find({
            _id: { $ne: req.user._id },
            userName: { $regex: `^${escapedName}`, $options: "i" /* case insensitive */} }, "userName profileImage" )
        .sort({ userName: 1 })
        .limit(10)
        .lean()

        if ( searchResult.length === 0 ) return res.status(200).json({
            searchResult,
            message: "No user found"
        })

        res.status(200).json({
            searchResult,
            message: "Successful Search"
        })
    } catch (error) {
        console.log("Error searching user: ", error.message)
        res.status(500).json({ message: "Server error" })
    }
}

export const createPostInFeed = createPost
export const likePostInFeed = likePost
export const minusLikeInFeed = minusLike
export const createCommentInFeed = createComment
export const followUserInFeed = followUser
export const unfollowUserInFeed = unfollowUser