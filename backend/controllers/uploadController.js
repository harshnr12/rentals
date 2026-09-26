export const uploadImage = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            message: 'No file uploaded or file rejected by validation'
        });
    }

    // Rely solely on the 201 status code and return only the necessary data
    return res.status(201).json({
        photoUrl: `/images/${req.file.filename}`
    });
};