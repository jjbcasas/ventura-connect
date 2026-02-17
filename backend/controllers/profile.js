import Post from '../models/Post.js'
import User from '../models/User.js'
import Comment from '../models/Comment.js'
import mongoose from 'mongoose'
import stripe from '../config/stripe.js'
import { createPost, likePost, minusLike, deletePost, createComment, followUser, unfollowUser, uploadProfilePhoto } from '../utils/userActionService.js'

// Profile Controller
export const getProfile = async( req, res ) => {
    try {
        const { id } = req.params
        const { user } = req
        let available = 0, pending = 0, currency = "usd", chargesEnabled = false;

        // Validate if the provided ID is a valid MongoDB ObjectId
        if ( !mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({message: 'Invalid User Id!'})
        }

        // Find all post under that specific user
        // const posts = await Post.find({ user: req.params.id }).populate({
        // path: 'user',
        //     populate: {
        //         path: 'followingId'
        //     }
        // }).sort({ createdAt: 'desc'}).lean()

        // Get the user that owns the specific profile page
        // const accountUser = await User.findOne({ _id: req.params.id }).populate('followingId').lean()
        
        const [ posts, accountUser ] = await Promise.all([
            // Find all post under that specific user
            Post.find({ user: req.params.id }).populate({
                path: 'user',
                    populate: {
                        path: 'followingId'
                    }
            }).sort({ createdAt: 'desc'}).lean(),

            // Get the user that owns the specific profile page
            User.findOne(
                { _id: req.params.id }
            ).populate('followingId').lean()
        ])

        if (!accountUser) {
            return res.status(404).json({ message: 'User profile not found.' });
        }

        const postIdsArray = posts.map(post => post._id)
        // Get all comments and populate the commentUser field
        const comments = await Comment.find({
            postId: { $in: postIdsArray }
        }).populate('commentUser').sort({ createdAt: 'desc'})

        // Connect to Stripe to get the Balance info
        if ( id === user._id.toString() && user.stripeAccountId ){
            try {
                // 1. Retrieve the account details from Stripe
                const account = await stripe.accounts.retrieve(user.stripeAccountId);

                chargesEnabled = account.charges_enabled;

                // 2. Only fetch balance if they can actually receive money
                if (chargesEnabled) {
                    const balance = await stripe.balance.retrieve({
                        stripeAccount: user.stripeAccountId,
                    });

                    available = balance.available.reduce((sum, b) => sum + b.amount, 0) / 100;
                    pending = balance.pending.reduce((sum, b) => sum + b.amount, 0) / 100;
                    currency = balance.available[0]?.currency;
                } else {
                    console.log("User has an ID, but hasn't finished onboarding.");
                }
        
            } catch (error) {
                console.error("Stripe Balance Error:", error.message);
                // If the account is in a weird state, we just leave balance at 0
            }
        } 
        
        // for account thats not the user
        if ( id !== user._id.toString() && accountUser.stripeAccountId) {
            // 1. Retrieve the account details from Stripe
            const account = await stripe.accounts.retrieve(accountUser.stripeAccountId);

            chargesEnabled = account.charges_enabled;
        }

        // const usersFriends = await User.findOne({ _id: req.user._id }).populate('followingId').lean()

        console.log('Data fetched!')
        res.status(200).json({ posts, accountUser, comments, available, pending, currency, chargesEnabled, /*usersFriends,*/ message: 'Data fetched successfully!'})
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