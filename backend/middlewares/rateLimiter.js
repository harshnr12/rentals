import rateLimit from 'express-rate-limit';

// 1. Strict Business Logic Limiter (User ID based)
export const contactLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    limit: 10, // Max 10 contacts per day
    keyGenerator: (req) => req.user.id, // Limit by User ID, not IP

    handler: (req, res) => {
        const resetAt = req.rateLimit?.resetTime;
        res.status(429).json({
            message: 'You have reached your contact limit.',
            resetAt: resetAt ? resetAt.toISOString() : null
        });
    }
});

// 2. General API Protection (IP based)
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 200, // Max 200 requests per IP per 15 mins
    message: { error: "Too many requests from this IP, please try again after 15 minutes." }
});