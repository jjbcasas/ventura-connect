import mongoose from 'mongoose'

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    cloudinaryId: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userName: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
    // timestamps: true // createdAt. updatedAt
})

export default mongoose.model('Post', PostSchema)