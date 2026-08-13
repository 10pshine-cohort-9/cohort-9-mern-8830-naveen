const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const {User} = require('../models');
const catchAsync=require('./catchAsync');
const protect =catchAsync(async(req, res, next)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader||!authHeader.startsWith('Bearer ')){
        return next(new AppError('You are not logged in. Please login to continue'),401);
    }
    const token=authHeader.split(' ')[1];
    let decoded;
    try{
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    }
    catch(err){
        return next(new AppError('Invalid or expired token. Please log in again.', 401));
    }
    const user=await User.findByPk(decoded.id);
    if(!user){
        return next(new AppError('The user belonging to this token no longer exists.', 401));
    }
    req.user = user;
    next();
});
module.exports ={protect};