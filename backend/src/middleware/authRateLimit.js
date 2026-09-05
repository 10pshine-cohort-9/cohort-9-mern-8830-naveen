const attempts = new Map();
const WINDOWS_MS = 15*60*1000;
const MAX_ATTEMPTS = 10;
const cleanup=(now)=>{
    for(const [key, value] of attempts){
        if(now>=value.resetAt){
            attempts.delete(key);
        }
    }
};
const authRateLimit = (req,res,next)=>{
    const now = Date.now();
    cleanup(now);
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const current = attempts.get(key);
    if(!current || now>= current.resetAt){
        attempts.set(key, {count: 1, resetAt:now+WINDOWS_MS});
        return next();
    }
    current.count+=1;
    if(current.count > MAX_ATTEMPTS){
        const retryAfter = Math.ceil((current.resetAt-now) / 1000);
        res.set("Retry-After", String(retryAfter));
        return res.status(429).json({success: false, message: 'Too many authentication attempts. Please try again later.'});
    }
    next();
};
authRateLimit.reset = () => { attempts.clear(); };
module.exports = authRateLimit;
