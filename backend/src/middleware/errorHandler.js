const logger = require('../config/logger');
const errorHandler =(err, req, res,next)=>{
    const statusCode=err.statusCode||500;
    const isOperational = err.isOperational||false;
    logger.error({err, req: {method: req.method,url: req.originalUrl}, statusCode}, err.message);
    res.status(statusCode).json({success: false, message: isOperational? err.message: "Something went wrong. Please try again later.", ...(process.env.NODE_ENV === 'development'&& !isOperational? {stack: err.stack}:{}),});

};
module.exports = errorHandler;