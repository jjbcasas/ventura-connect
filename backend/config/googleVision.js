import vision from '@google-cloud/vision';

// Initialize with your credentials
const client = new vision.ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_VISION_API_KEY
});

export default client