import mongoose from 'mongoose'

const CommentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    commentUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    commentUserName: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model('Comment', CommentSchema)