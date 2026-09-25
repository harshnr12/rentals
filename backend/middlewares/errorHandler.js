const errorHandler = (error, req, res, next) => {
    const statusCode = error.statusCode || 500;

    // Only log actual server crashes to the console, hide standard 400/401/404s
    if (statusCode === 500) {
        console.error("Server Error:", error);
    }

    res.status(statusCode).json({
        message: error.message || "Internal server error"
    });
};

export default errorHandler;