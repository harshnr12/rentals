import multer from 'multer';

const errorHandler = (error, req, res, next) => {

    // 1. Catch Multer errors BEFORE they default to 500
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File is too large. Maximum size is 5MB.'
            });
        }
        // Catch any other Multer configuration errors
        return res.status(400).json({
            message: error.message
        });
    }

    // 2. Process standard custom errors
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal server error";

    // 3. Only log actual server crashes, hide standard client mistakes
    if (statusCode === 500) {
        console.error("Server Error:", error);
    }

    // 4. Send final response
    res.status(statusCode).json({ message });
};

export default errorHandler;