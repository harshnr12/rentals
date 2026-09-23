class CustomError extends Error {
    constructor(status, msg) {
        super(msg);
        this.statusCode = status;
    }
}
export default CustomError;