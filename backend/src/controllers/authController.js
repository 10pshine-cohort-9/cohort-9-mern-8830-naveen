const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {User}= require('../models');
const AppError = require('../utils/AppError');
const catchAsync=require('../middleware/catchAsync');
const logger=require('../config/logger');

const signToken =(id)=>
    jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN||'7d',});
    const sanitizeUser =(user)=>({id: user.id, fullName: user.fullName, email: user.email, tagline: user.tagline, theme:user.theme, language: user.language, timezone: user.timezone, accountType:user.accountType, createdAt:user.createdAt,})
    const signup = catchAsync(async(req,res,next)=> {
        const {fullName, email, password} = req.body;
        const existing = await User.findOne({where: {email}});
        if(existing){
            return next(new AppError('an account with this email already exists.', 409));
        }
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await User.create({fullName, email,passwordHash});
        const token = signToken(user.id);
        logger.info({userId: user.id}, 'New user signed up');
        res.status(201).json({success: true, token, user:sanitizeUser(user)});
    });
    const login = catchAsync(async(req,res,next)=> {
        const {email, password} = req.body;
        const user = await User.findOne({where: {email}});
        if(!user){
            return next(new AppError('Invalid email or password.', 401));
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if(!isMatch){
            return next(new AppError('Invalid email or password.', 401));
        }
        const token = signToken(user.id);
        logger.info({userId: user.id}, 'User logged in');
        res.status(200).json({success: true, token, user:sanitizeUser(user)});
    });
    const updateMe = catchAsync(async(req,res)=>{
        const allowedFields = ['fullName', 'tagline', 'theme', 'language', 'timezone'];
        allowedFields.forEach((field)=>{
            if(req.body[field] !== undefined){
                req.user[field]=req.body[field];
            }
        });
        await req.user.save();
        res.status(200).json({success: true, user: sanitizeUser(req.user)});
    });
    const getMe = catchAsync(async(req,res)=>{
        res.status(200).json({success: true, user:sanitizeUser(req.user)});
    });
    const changePassword = catchAsync(async(req,res,next)=>{
        const {currentPassword, newPassword} = req.body;
        const isMatch = await bcrypt.compare(currentPassword, req.user.passwordHash);
        if(!isMatch){
            return next(new AppError('Current password is incorrect.', 401));
        }
        req.user.passwordHash= await bcrypt.hash(newPassword, 12);
        await req.user.save();
        res.status(200).json({success: true, message:"Password updated successfully."});
    });
    const deleteMe = catchAsync(async(req,res)=>{
        await req.user.destroy();
        res.status(200).json({success:true, message:"Account deleted successfully."});
    });
module.exports ={signup, login,getMe, updateMe,changePassword, deleteMe};