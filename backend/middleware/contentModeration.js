import client from '../config/googleVision.js';
import fs from 'fs'

export const moderateImage = async (req, res, next) => {
    // Get the image from the request (from Multer or your body)
    const imageUri = req.file?.path

    if (!imageUri) return next(); // Skip if no image

    try {
        const [result] = await client.safeSearchDetection(imageUri);
        const detections = result.safeSearchAnnotation;

        const isNSFW = 
            ['LIKELY', 'VERY_LIKELY'].includes(detections.adult) ||
            ['LIKELY', 'VERY_LIKELY'].includes(detections.violence) ||
            ['LIKELY', 'VERY_LIKELY'].includes(detections.racy);

        if (isNSFW) {
            console.log("Image rejected: NSFW content detected.")

            // CLEANUP: Delete the temp file from YOUR server
            // Use the non-blocking version
            fs.unlink(imageUri, (err) => {
                if (err) console.error("Cleanup Error:", err);
                else console.log("File successfully removed.");
            });

            return res.status(400).json({ 
                message: "Image rejected: Content does not meet community guidelines." 
            });
        }

        console.log('Content are up to community standards.')
        next(); // Content is clean, move to the controller
    } catch (error) {
        console.error("Vision API Error:", error);
        next(); // Optional: let it pass if API is down, or return error
    }
};