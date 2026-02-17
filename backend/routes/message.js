import express from "express"
const router = express.Router()
import { getAllContacts, getChatPartners, getMessagesByUserId, getUnreadCount, loadOldMessage, sendMessage, unreadToRead, uploadProfilePhotoInChat } from "../controllers/message.js"
import { protectRoute } from "../middleware/auth.js"
import { arcjetProtection } from "../middleware/arcjet.js"
import upload from "../middleware/multer.js"
import { handleUpload } from "../middleware/handleUpload.js"

router.use( arcjetProtection, protectRoute )

router.get("/contacts", getAllContacts )
router.get("/chats",getChatPartners )
router.get("/unreadCount", getUnreadCount)

router.get("/oldMessages/:id",loadOldMessage )
router.get("/:id",getMessagesByUserId )
router.patch("/uploadProfilePhoto", handleUpload(upload.single('file')), uploadProfilePhotoInChat )
router.patch("/readMessages/:id", unreadToRead )

router.post("/send/:id", handleUpload(upload.single('file')), sendMessage )

export default router