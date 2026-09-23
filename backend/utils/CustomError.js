class CustomError extends Error {
    constructor(status, msg) {
        super(msg);
        this.statusCode = status;
        Error.captureStackTrace(this, this.constructor);
    }
}

export default CustomError;