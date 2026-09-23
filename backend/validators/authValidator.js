import Joi from 'joi';

const registerSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .required(),

    email: Joi.string()
        .email()
        .required(),

    password: Joi.string()
        .min(8)
        .required(),

    phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .optional()
});


const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required(),

    password: Joi.string()
        .required()
});


export {
    registerSchema,
    loginSchema
};