import CustomError from "../utils/CustomError.js";

const validate = (schema, source) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[source]);

        if (error) {
            const message = error.details[0].message;

            return next(new CustomError(message, 400));
        }

        req[source] = value;

        next();
    };
};

export default validate;