// Handles Ghost errors from multer
export const handleUpload = (uploadMiddleware) => {
    return (req, res, next) => {
        uploadMiddleware(req, res, (err) => {
            if (err) {
                // Handle specific Multer limit errors
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ message: 'File is too large. Max limit is 2MB.' });
                }
                // Handle filter errors (like "File type not supported")
                return res.status(400).json({ message: err.message });
            }
            next();
        });
    };
}