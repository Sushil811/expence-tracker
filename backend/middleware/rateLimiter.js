// Simple in-memory rate limiter (no external dependency needed)
const requestCounts = new Map();

const rateLimiter = (maxRequests = 100, windowMs = 60000) => {
    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        if (!requestCounts.has(ip)) {
            requestCounts.set(ip, { count: 1, startTime: now });
            return next();
        }

        const record = requestCounts.get(ip);
        
        // Reset window if expired
        if (now - record.startTime > windowMs) {
            requestCounts.set(ip, { count: 1, startTime: now });
            return next();
        }

        // Increment count
        record.count++;

        if (record.count > maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.'
            });
        }

        next();
    };
};

// Stricter limiter for auth routes (prevent brute force)
export const authLimiter = rateLimiter(20, 60000); // 20 requests per minute
// General API limiter
export const apiLimiter = rateLimiter(100, 60000); // 100 requests per minute

export default rateLimiter;
