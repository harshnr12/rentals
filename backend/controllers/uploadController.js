export const uploadImages = (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            message: 'No files uploaded or files rejected by validation'
        });
    }

    // Map over the array of files to create an array of paths
    const photoUrls = req.files.map(file => `/images/${file.filename}`);

    return res.status(201).json({
        message: 'Images uploaded successfully',
        photoUrls // Returns: ["/images/user_1_123.jpg", "/images/user_1_124.jpg"]
    });
};