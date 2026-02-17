import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        text: {
            type: String,
            trim: true, // Remove whitespace from the beginning and the end of a string
            maxlength: 200
        },
        image: {
            type: String
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true } // creates createdAt and updatedAt field
)

// "Unread Count" Index for speeding up filtering unread messages based on these two fields
messageSchema.index({ receiverId: 1, isRead: 1 })
// "Conversation History" Index for speeding up filtering all old messages based on these three fields
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 })
messageSchema.index({ receiverId: 1, senderId: 1, createdAt: -1 })

export default mongoose.model("Message", messageSchema)