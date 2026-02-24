import cloudinary from "../middleware/cloudinary.js"
import Message from "../models/Message.js"
import User from "../models/User.js"
import mongoose from 'mongoose'
import { uploadProfilePhoto } from "../utils/userActionService.js"
import { getReceiverSocketId, io } from "../config/socket.js"
import fs from 'fs' // Import File System

export const getAllContacts = async ( req, res ) => {
    try {
        const { _id: userId } = req.user
        const myContacts = await User.find({
            _id: { $ne: userId }, $or: [
                { followingId: userId }, // They follow me
                { _id: { $in: req.user.followingId || [] }} // I follow them
            ]
        })
        .select("-password")
        .sort({ userName: 'asc'})
        .collation({ locale: 'en', strength: 2 }) // Strength 2 ignores case differences
        .lean()

        // Handle Empty Results gracefully
        if (!myContacts || myContacts.length === 0) {
            return res.status(200).json({
                myContacts: [],
                message: "No contacts found"
            })
        }

        console.log('Fetched all contacts')
        res.status(200).json({
            myContacts,
            message: "Successfully fetched all contacts"
        })
    } catch (error) {
        console.error("Error in getAllContacts controller: ", error.message)
        res.status(500).json({
            message: "Server error"
        })
    }
}

export const getChatPartners = async (req, res ) => {
    try {
        const { _id: myId } = req.user

        // Find all messages related to me and get the unique IDs of everyone. Either sender or receiver is me
        // const [ sentTo, receivedFrom ] = await Promise.all([
        //     Message.distinct("receiverId", { senderId: myId }),
        //     Message.distinct("senderId", { receiverId: myId })
        // ])

        // Combine and remove duplicates
        // const chatPartnerIds = [ ...new Set([ ...sentTo, ...receivedFrom ]) ]

        // Get messages sorted by newest first
        const messages = await Message.find({
            $or: [ { senderId: myId }, { receiverId: myId } ]
        }).sort({ createdAt: -1}).lean()

        // Extract unique partner IDs while preserving order
        const partnerIds = messages.map( msg => {
            return msg.receiverId.toString() === myId.toString()
                ? msg.senderId.toString()
                : msg.receiverId.toString()
        })
        
        // Remove Duplicates
        const chatPartnerIds = [ ...new Set(partnerIds)]

        if (chatPartnerIds.length === 0) {
            return res.status(200).json({ chatPartners: [], message: "No chat partners found" })
        }

        // Look for and Fetch that User id
        const users = await User.find({ 
            _id: { $in: chatPartnerIds }
        })
        .select("-password").lean()

        // Re-sort the users to match our uniquePartnerIds order
        const chatPartners = chatPartnerIds.map(id => 
            users.find(u => u._id.toString() === id)
        ).filter(Boolean); // Safety: filter out any nulls if a user was deleted

        // Handle Empty Results gracefully
        if (!chatPartners || chatPartners.length === 0) {
            return res.status(200).json({
                chatPartners: [],
                message: "No chat partners found"
            })
        }

        console.log('Fetched all chat partners')
        res.status(200).json({
            chatPartners,
            message: "Success fetching all chat partners"
        })
    } catch (error) {
        console.error("Error in getChatPartners controller: ", error.message)
        res.status(500).json({
            message: "Server error"
        })
    }
}

export const getMessagesByUserId = async ( req, res ) => {
    try {
        const { _id: myId } = req.user
        const { id: chatPartnerId } = req.params

        // Validate if the provided ID is a valid MongoDB ObjectId
        if ( !mongoose.Types.ObjectId.isValid( chatPartnerId )){
            return res.status(404).json({message: 'Invalid User Id!'})
        }

        // const areFriends = await User.exists({
        //     _id: myId,
        //     // in the future make this bi-directional. Right now its one-directional so it won't feel too restrictive
        //     $or: [
        //         { followerId: chatPartnerId },
        //         { followingId: chatPartnerId }
        //     ]
        // })

        // if ( !areFriends ) {
        //     return res.status(403).json({ message: "Not following the user." }) // 403 - Status Forbidden
        // }

        const messages = await Message.find({ 
            $or: [
                { senderId: myId, receiverId: chatPartnerId },
                { senderId: chatPartnerId, receiverId: myId }
            ]
        }).populate('senderId receiverId',"userName profileImage")
        .sort({ createdAt: -1 }) // newest to oldest
        .limit(20)
        .lean()

        console.log('Fetched all messages')
        res.status(200).json({
            messages,
            message: "Successfully fetched all messages"
        })
    } catch (error) {
        console.log("Error in getMessagesByUserId controller: ", error.message)
        res.status(500).json({
            message: "Server error"
        })
    }
}

export const sendMessage = async ( req, res ) => {
    let uploadResult // = undefined
    try {
        const { text } = req.body
        const { id: receiverId } = req.params
        const { _id: senderId } = req.user

        if ( !text && !req.file ) {
            return res.status(400).json({ message: "Text or image is required." })
        }
        if ( senderId.toString() === receiverId ) {
            return res.status(400).json({ message: "Cannot send messages to yourself." })
        }
        const receiverExists = await User.exists({ _id: receiverId})
        if ( !receiverExists ) {
            return res.status(400).json({ message: "Receiver not found." })
        }

        if ( req.file ){
           uploadResult = await cloudinary.uploader.upload(req.file.path)
        }

        const fullMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: uploadResult?.secure_url
        })

        await fullMessage
            .populate("senderId receiverId", "userName profileImage")
        
        const receiverSocketId = getReceiverSocketId( receiverId )
        const senderSocketId = getReceiverSocketId( senderId )
        // .emit() - send it to everyone .to() send to specific user
        // Send to Receiver if they are online
        if (receiverSocketId) {
            receiverSocketId.forEach( id => {
                io.to(id).emit("newMessage", fullMessage);
            })
        }

        // Send to Sender (their other tabs/devices) if they are online
        if (senderSocketId) {
            senderSocketId.forEach( id => {
                io.to(id).emit("newMessage", fullMessage);
            })
        }

        console.log('Successfully sent a message')
        res.status(201).json({
            fullMessage,
            message: "Successfully sent a message"
        })
    } catch (error) {
        // SAFETY CLEANUP: If the DB failed, delete the image from Cloudinary
        if ( uploadResult && uploadResult.public_id ) { /*or (uploadResult?.public_id)*/
            await cloudinary.uploader.destroy(uploadResult.public_id);
            console.log('Database failed: Cloudinary image rolled back.');
        }
        console.log("Error in sendingMessage controller: ", error.message)
        res.status(500).json({
            message: "Server error"
        })
    } finally {
        // CLEANUP: Delete the temp file from YOUR server
        if (req.file?.path) {
            fs.unlinkSync(req.file.path); 
        }
    }
}

export const getUnreadCount = async ( req, res ) => {
    try {
        const { _id: myId } = req.user
        // const unreadCount = Message.countDocuments({ receiverId: myId, isRead: false })
        const unreadCount = await Message.aggregate([
            { $match: { receiverId: myId, isRead: false } },
            {
                $group: {
                    _id: "$senderId", // Group by the person who sent it
                    count: { $sum: 1 } // Add 1 for every message found
                }
            }
        ])
    
        res.status(200).json({
            unreadCount, message: "Fetched message count."
        })
    } catch (error) {
        console.log("Error fetching messages: ", error.message)
        res.status(500).json({ message: "Server error" })
    }
}

export const unreadToRead = async ( req, res ) => {
    try {
        const { id: chatPartnerId } = req.params
        const { _id: myId } = req.user
    
        await Message.updateMany(
            { senderId: chatPartnerId, receiverId: myId, isRead: false},
            { $set: { isRead: true }}
        )
        
        res.status(200).json({ message: "Successfully updated messages."})
    } catch (error) {
        console.log("Error in updating messages: ", error.message)
        res.status(500).json({ message: "Server Error"})
    }
}

export const loadOldMessage = async ( req, res ) => {
    try {
        const { id: chatPartnerId } = req.params
        const { timestamp } = req.query; // Get the timestamp from the URL query
        const { _id: myId } = req.user

        const nextTenMessages = await Message.find({
            $or: [
                { senderId: myId, receiverId: chatPartnerId },
                { senderId: chatPartnerId, receiverId: myId }
            ],
            // Use the timestamp passed from frontend
            createdAt: { $lt: new Date(timestamp) }
        })
        .populate('senderId receiverId',"userName profileImage")
        .limit(10).sort({ createdAt: -1 }).lean()

        res.status(200).json({
            nextTenMessages,
            message: "Fetched messages successfully."
        })
    } catch (error) {
        console.log("Error loading messages: ", error.message)
        res.status(500).json({ message: "Server Error"})
    }
}

export const uploadProfilePhotoInChat = uploadProfilePhoto