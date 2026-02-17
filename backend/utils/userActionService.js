import cloudinary from '../middleware/cloudinary.js'
import Post from '../models/Post.js'
import User from '../models/User.js'
import Comment from '../models/Comment.js'
import mongoose from 'mongoose'
import fs from 'fs' // Import File System

export const createPost = async ( req, res ) => { 
    let uploadResult
    try{
        const { title, caption } = req.body
        // const post = req.body ( also correct )

        if ( !title || !caption ) {
            return res.status(400).json({ message: 'Please provide all fields.'})
        }
        if ( !req.file ) {
            return res.status(400).json({ message: 'No image file uploaded.'})
        }
        uploadResult = await cloudinary.uploader.upload(req.file.path)

        // Create a Post
        const post = await Post.create({
            title: req.body.title,
            image: uploadResult.secure_url,
            cloudinaryId: uploadResult.public_id,
            caption: req.body.caption,
            likes: 0,
            user: req.user._id,
            userName: req.user.userName
        })

        await post.populate('user')

        console.log('Post has been added!')
        res.status(201).json({ post, message: 'Post added successfully!'})
    } catch(error) {
        // SAFETY CLEANUP: If the DB failed, delete the image from Cloudinary
        if ( uploadResult && uploadResult.public_id ) { /*or (uploadResult?.public_id)*/
            await cloudinary.uploader.destroy(uploadResult.public_id);
            console.log('Database failed: Cloudinary image rolled back.');
        }
        console.log('Error in Creating Post:', error.message)
        res.status(500).json({message: 'Server Error!'})
    } finally {
        // CLEANUP: Delete the temp file from YOUR server
        if (req.file?.path) {
            fs.unlinkSync(req.file.path); 
        }
    }
}

export const likePost = async ( req, res ) => {
    const session = await mongoose.startSession() // Start the session
    try {
        const { id } = req.params
        const { _id: userId } = req.user

        // Validate if the provided ID is a valid MongoDB ObjectId
        if ( !mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({message: 'Invalid Post Id!'})
        }
        
        session.startTransaction() // Start the transaction

        // Find the specific user first and update
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId, likedPostId: { $ne: id } }, // "$ne" means "Not Equal" (if ID is NOT there)
            { $addToSet: { likedPostId: id } },
            { new: true, runValidators: true, session }
        ).lean()
        
        // If updatedUser is null, they already liked it.
        if ( !updatedUser ) {
            await session.abortTransaction() // Clean up before returning!
            return res.status(409).json({ message: 'You have already liked this post.' });
        }

        // only now update the Post likes
        const updatedLike = await Post.findByIdAndUpdate(
            id,
            { $inc: { likes: 1} },
            { new: true, runValidators: true, session }
        ).lean()

        // Check if the post was found
        if (!updatedLike) {
            await session.abortTransaction() // Clean up before returning!
            // Optional: Roll back the user update since the post doesn't exist
            // await User.updateOne(
            //     { _id: userId },
            //     { $pull: { likedPostId: id } }
            // )
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Commit both at once
        await session.commitTransaction()

        console.log('Likes +1!')
        res.status(200).json({ message: 'Post Liked!', updatedLike, updatedUser })
    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction()
        console.error('Error in Liking Post:', error.message)
        res.status(500).json({message: 'Server Error!' })
    } finally {
        await session.endSession()
    }
}

export const minusLike = async ( req, res ) => {
    const session = await mongoose.startSession() // Start Session
    try {
        const { id } = req.params
        const { _id: userId } = req.user

        // Validate if the provided ID is a valid MongoDB ObjectId
        if ( !mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({message: 'Invalid Post Id!'})
        }
        
        session.startTransaction() // Start the transaction

        // Find a specific user and update
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId, likedPostId: id },
            { $pull: { likedPostId: id } },
            { new: true, runValidators: true, session }
        ).lean()

        if ( !updatedUser ) {
            await session.abortTransaction() // Clean up before returning!
            return res.status(409).json({ message: 'You have not liked this post.' });
        }

        // then find the specific post and update
        const updatedLike = await Post.findByIdAndUpdate(
            id,
            { $inc: { likes: -1} },
            { new: true, runValidators: true, session }
        ).lean()

        // 5. Check if the post was found and updated
        if (!updatedLike) {
            await session.abortTransaction() // Clean up before returning!
            // await User.updateOne(
            //     { _id: userId },
            //     { $addToSet: { likedPostId: id }}
            // )
            return res.status(404).json({ message: 'Post not found.' });
        }

        await session.commitTransaction()

        console.log('Likes -1!')
        res.status(200).json({ message: 'Post Unliked!', updatedLike, updatedUser })
    } catch (error) {
        if ( session.inTransaction() ) await session.abortTransaction()
        console.error('Error in Unliking Post:', error.message)
        res.status(500).json({message: 'Server Error!' })
    } finally {
        await session.endSession()
    }
}

export const deletePost = async ( req, res ) => {
    const session = await mongoose.startSession() /* Start the Session */
    try {
        const { id } = req.params
        
        // Validate if the provided ID is a valid MongoDB ObjectId
        if ( !mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({message: 'Invalid Post Id!'})
        }

        session.startTransaction() /* Start the Session */

        // Find and Delete in ONE step + Security Check
        const post = await Post.findOneAndDelete(
            { _id: id, user: req.user._id },
            { session }
        ).lean()

        if (!post) {
            await session.abortTransaction() // Clean up before returning!
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Cleanup (These can run in parallel for speed)
        // This is the last step to ensure we don't end up with a broken data/record if any prior steps fail.
        await Promise.all([
            Comment.deleteMany({ postId: id }, { session }),
            User.updateMany(
                { likedPostId: id },
                { $pull: { likedPostId: id } },
                { session }
            )
        ])

        // If DB steps succeed, COMMIT
        await session.commitTransaction()

        // Isolated Cloudinary Cleanup (Safe)
        try {
            if (post.cloudinaryId) {
                await cloudinary.uploader.destroy(post.cloudinaryId);
            }
        } catch (cloudinaryError) {
            // We log this for the dev, but don't stop the success response
            console.error('Cloudinary deletion failed, but DB is clean:', cloudinaryError);
        }

        console.log('Deleted Post!')
        res.status(200).json({message: 'Post Deleted!'})
    } catch (error) {
        // Rollback ALL DB changes if anything fails
        if (session.inTransaction() ) {
            await session.abortTransaction()
        }
        console.error('Error in Deleting Post:', error.message)
        res.status(500).json({message: 'Server Error!' })
    } finally {
        // Close the session
        await session.endSession();
    }
}

export const createComment = async ( req, res ) => {
    try {
        const { id } = req.params
                    
        // Validate if the provided ID is a valid MongoDB ObjectId - 404 - Not Found 
        if ( !mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({message: 'Invalid Post Id!'})
        }
        
        if ( !req.body.comment /* const { comment } = req.body */) {
            return res.status(400).json({ message: 'Please provide all fields.'}) /* 400 - Bad Request */
        }

        // Check if Post exists
        const postExists = await Post.exists({ _id: id });
        if (!postExists) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Create comment
        const comment = await Comment.create({
            comment: req.body.comment,
            commentUser: req.user._id,
            commentUserName: req.user.userName ,
            postId: id
        })

        await comment.populate('commentUser')

        console.log('Comment has been added!')
        res.status(201).json({comment, message: 'Comment added successfully!' })
    } catch (error) {
        console.log('Error in Creating Comment:', error.message)
        res.status(500).json({message: 'Server Error!'})
    } finally {
        // CLEANUP: Delete the temp file from YOUR server
        if (req.file?.path) {
            fs.unlinkSync(req.file.path); 
        }
    }
}

export const followUser = async ( req, res ) => {
    // Start the Session
    const session = await mongoose.startSession()
    try {
        const { id } = req.params
        const { _id: userId } = req.user

        // Prevent self-following
        if (id === userId.toString()) {
            return res.status(400).json({ message: "You cannot follow yourself!" });
        }

        // Validate if the provided ID is a valid MongoDB ObjectId
        if ( !mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({message: 'Invalid User Id!'})
        }

        // Start the Transaction
        session.startTransaction()
        
        // Check if already following (Prevents redundant DB writes)
        const alreadyFollowing = await User.exists({ _id: userId, followingId: id }).session(session)
        if (alreadyFollowing) {
            await session.abortTransaction()
            return res.status(409).json({ message: 'You are already following this user.' }) // 409 - Status Conflict
        }
        
        // Update both users in Parallel
        // Array Destructuring
        const [updatedFollow, updatedFollowing] = await Promise.all([
            // Add logged-in user to the "Target" user's followers
            User.findByIdAndUpdate(
                id ,
                // $addToSet only adds the ID if it doesn't already exist in the array
                { $addToSet: { followerId: userId } },
                { new: true, runValidators: true, session } // Pass Session
            ).lean(),

            // Add target user to the "Logged-in" user's following list
            User.findByIdAndUpdate(
                userId,
                // $addToSet only adds the ID if it doesn't already exist in the array
                { $addToSet: { followingId: id } },
                {  new: true, runValidators: true, session } // Pass Session
            ).lean()
        ])
        
        if (!updatedFollow || !updatedFollowing) {
            // await session.abortTransaction() // Clean up before returning!
            return res.status(404).json({ message: 'User not found!' });
        }

        // If everything is good, COMMIT the changes to the DB
        await session.commitTransaction()
        
        console.log('Followed a user!')
        res.status(200).json({ updatedFollow, updatedFollowing, message: 'Followed successfully!'})
    } catch (error) {
        // If ANY error happens, UNDO everything
        // Only abort if the transaction was actually started
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        console.log('Error in Following User:', error.message)
        res.status(500).json({message: 'Server Error!' })
    } finally {
        // Always end the session to free up server resources
        await session.endSession()
    }
}

export const unfollowUser = async ( req, res ) => {
    // Start the Session
    const session = await mongoose.startSession()
    try {
         const { id } = req.params
         const { _id: userId } = req.user

        // Validate if the provided ID is a valid MongoDB ObjectId
        if ( !mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({message: 'Invalid User Id!'})
        }

        // Start the Transaction
        session.startTransaction()

        // Update both users in Parallel
        // Array Destructuring
        const [updatedUnfollow, updatedUnfollowing] = await Promise.all([
            User.findOneAndUpdate(
                { _id: id, followerId: userId },// Only update if I am actually a follower
                { $pull: { followerId: userId } },
                { new: true, runValidators: true, session } // Pass Session
            ).lean(),
            
            // Find a specific user and update
            User.findOneAndUpdate(
                { _id: userId, followingId: id }, // Only update if I am actually following them
                { $pull: { followingId: id } },
                { new: true, runValidators: true, session } // Pass Session
            ).lean()
        ])

        // If either is null, the relationship didn't exist
        if (!updatedUnfollow || !updatedUnfollowing) {
            await session.abortTransaction()
            return res.status(400).json({ message: "You are not following this user." })
        }

        // If everything is good, COMMIT the changes to the DB
        await session.commitTransaction()

        console.log('Unfollowed a user!')
        res.status(200).json({ updatedUnfollow, updatedUnfollowing, message: 'Unfollowed successfully!'})
    } catch (error) {
        // If ANY error happens, UNDO everything
        // Only abort if the transaction was actually started
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        console.log('Error in Following User:', error.message)
        res.status(500).json({message: 'Server Error!' })
    } finally {
        // Always end the session to free up server resources
        await session.endSession()
    }
}

export const uploadProfilePhoto = async ( req, res ) => {
    let uploadResult
    try{
        const { user: userId } = req

        if ( !req.file ) {
            return res.status(400).json({ message: 'No image file uploaded.'})
           }

        // uncomment if you want two-step process
        // Validate if the provided ID is a valid MongoDB ObjectId
        // if ( !mongoose.Types.ObjectId.isValid(id)){
        //     return res.status(404).json({message: 'Invalid User Id!'})
        // }

        // const user = await User.findById( userId )
        // if (!user) {
        //     return res.status(404).json({ message: 'User not found.' });
        // }

        if ( userId.cloudinaryId ) {
            await cloudinary.uploader.destroy(userId.cloudinaryId)
        }

        uploadResult = await cloudinary.uploader.upload(req.file.path)

         // Find and update a specific user
        const newProfileImage = await User.findByIdAndUpdate(
            userId._id ,
            {
                profileImage: uploadResult?.secure_url,
                cloudinaryId: uploadResult?.public_id
            },
            { new: true, runValidation: true }
        ).select("-password").lean()

        console.log('Profile Photo has been added!')
        res.status(200).json({ newProfileImage , message: 'Photo uploaded successfully!'})
    } catch(error) {
        // SAFETY CLEANUP: If the DB failed, delete the image from Cloudinary
        if ( uploadResult && uploadResult.public_id ) { /*or (uploadResult?.public_id)*/
            await cloudinary.uploader.destroy(uploadResult.public_id);
            console.log('Database failed: Cloudinary image rolled back.');
        }
        console.log('Error in uploading photo:', error.message)
        res.status(500).json({message: 'Server Error!'})
    } finally {
        // CLEANUP: Delete the temp file from YOUR server
        if (req.file?.path) {
            fs.unlinkSync(req.file.path); 
        }
    }
}