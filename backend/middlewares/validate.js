import CustomError from "../utils/CustomError.js";

const runValidation = (schema, data, req, source, next) => {
    const { error, value } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        return next(new CustomError(400, error.details[0].message));
    }

    req[source] = value;
    next();
};

export const validateBody = (schema) => (req, res, next) => {
    runValidation(schema, req.body, req, "body", next);
};

export const validateQuery = (schema) => (req, res, next) => {
    runValidation(schema, req.query, req, "query", next);
};
should
export const validateParams = (schema) => (req, res, next) => {
    runValidation(schema, req.params, req, "params", next);
};