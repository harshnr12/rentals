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

    // 2. Catch PostgreSQL Unique Constraint Violations (Code 23505)
    // The database enforces uniqueness even if two requests pass
    // the controller's existence check at the same time.
    //
    // Examples:
    // - Duplicate user email
    // - Duplicate favorite (same user + property)
    //
    // Contact history does not reach this handler for duplicates because
    // its INSERT uses ON CONFLICT (user_id, property_id) DO NOTHING.
    if (error.code === '23505') {

        if (error.constraint === 'users_email_key') {
            return res.status(409).json({
                message: 'Email already registered'
            });
        }

        return res.status(409).json({
            message: 'The request conflicts with an existing record'
        });
    }

    // 3. Process standard custom errors
    const statusCode = error.statusCode || 500;

    // Never expose unexpected internal errors to the client.
    // Detailed error information is logged on the server instead.
    const message =
        statusCode === 500
            ? 'Internal server error'
            : error.message || 'Request failed';

    // 4. Only log unexpected server errors
    if (statusCode === 500) {
        console.error('Server Error:', error);
    }

    // 5. Send final response
    res.status(statusCode).json({ message });
};

export default errorHandler;