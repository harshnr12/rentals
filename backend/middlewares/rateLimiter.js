import rateLimit from 'express-rate-limit';

// 1. Strict Business Logic Limiter (User ID based)
export const contactLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 10, // Max 10 contacts per day
    keyGenerator: (req) => req.user.id, // Limit by User ID, not IP
    message: { error: "Daily limit reached. You can only view 10 owner contacts per 24 hours." }
});

// 2. General API Protection (IP based)
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Max 200 requests per IP per 15 mins
    message: { error: "Too many requests from this IP, please try again after 15 minutes." }
});