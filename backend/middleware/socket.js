import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const socketAuthMiddleware = async( socket, next ) => {
    try {
        // extract tooken from http-only cookies
        const token = socket.handshake.headers.cookie
            ?.split("; ")
            .find((row)=> row.startsWith("jwt="))
            ?.split("=")[1]

            if ( !token ) {
                console.log("Socket connection rejected: No token provided")
                return next( new Error("Unauthorized - No token provided"))
            }
            
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            if ( !decoded ) {
                console.log("Socket Connection rejected: Invalid token")
                return next(new Error("Unauthorized - Invalid Token"))
            }

            // Find the user from db
            const user = await User.findById(decoded.userId).select("-password")
            if ( !user ) {
                console.log("Socket Connection rejected: User not found")
                return next(new Error("Unauthorized - User not found"))
            }

            // attach user info to socket
            socket.user = user
            socket.userId = user._id.toString()

            console.log(`Socket authenticated for user: ${user.userName} (${user._id})`)

            next()
    } catch (error) {
        console.log("Error in socket authentication: ", error.message)
        next(new Error("Unauthorized - Authentication failed"))
    }
}