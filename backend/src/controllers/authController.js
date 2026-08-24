const crypto =require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {User,Note}= require('../models');
const AppError = require('../utils/AppError');
const catchAsync=require('../middleware/catchAsync');
const logger=require('../config/logger');
const {sendPasswordResetEmail} = require('../config/email')
const signToken =(id)=>
    jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN||'7d',});
    const sanitizeUser =(user)=>({id: user.id, fullName: user.fullName, email: user.email,categories: JSON.parse(user.categories, [],), tagline: user.tagline, theme:user.theme, language: user.language, timezone: user.timezone, accountType:user.accountType, createdAt:user.createdAt,})
    const signup = catchAsync(async(req,res,next)=> {
        const fullName = String(req.body.fullName || '').trim();
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');

        if (password.length < 8) {
            return next(new AppError('Password must be at least 8 characters long.', 400));
        }
        const existing = await User.findOne({where: {email}});
        if(existing){
            return next(new AppError('An account with this email already exists.', 409));
        }
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await User.create({fullName, email,passwordHash});
        const token = signToken(user.id);
        logger.info({userId: user.id}, 'New user signed up');
        res.status(201).json({success: true, token, user:sanitizeUser(user)});
    });
    const login = catchAsync(async(req,res,next)=> {
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');

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
        if(req.body.categories !== undefined){
            req.user.categories = JSON.stringify(req.body.categories);
        }
        await req.user.save();
        res.status(200).json({success: true, user: sanitizeUser(req.user)});
    });
    const getMe = catchAsync(async(req,res)=>{
        res.status(200).json({success: true, user:sanitizeUser(req.user)});
    });
    const changePassword = catchAsync(async(req,res,next)=>{
        const {currentPassword, newPassword} = req.body;
        if(String(newPassword || '').length < 8) {
        return next(new AppError('Password must be at least 8 characters long.', 400));
        }
        const isMatch = await bcrypt.compare(currentPassword, req.user.passwordHash);
        if(!isMatch){
            return next(new AppError('Current password is incorrect.', 401));
        }
        req.user.passwordHash= await bcrypt.hash(newPassword, 12);
        await req.user.save();
        res.status(200).json({success: true, message:"Password updated successfully."});
    });
    const deleteMe = catchAsync(async(req,res)=>{
        await Note.destroy({where:{userId:req.user.id}});
        await req.user.destroy();
        res.status(200).json({success:true, message:"Account deleted successfully."});
    });
    const forgotPassword =catchAsync(async(req,res,next)=>{
        const email=String(req.body.email || '').trim().toLowerCase();
        const user = await User.findOne({where:{email}});
        const response ={
            success: true, message:"If an account exists for that email, a password reset token has been generated"
        };
        if(!user){
            return res.status(200).json(response);
        }
        const rawToken=crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        user.resetPasswordExpiresAt = new Date (Date.now()+15*60*1000);
        await user.save();
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;
        await sendPasswordResetEmail(user.email,resetUrl);
        logger.info({userId: user.id}, 'Password reset email sent.');
        res.status(200).json(response);
    });
    const resetPassword=catchAsync(async(req,res,next)=>{
        const {token, newPassword}=req.body;
        if(String(newPassword || '').length<8){
            return next(new AppError("Password must be at least 8 characters long", 400));
        }
        const hashedToken = crypto.createHash('sha256').update(String(token|| '')).digest('hex');
        const user = await User.findOne({where:{resetPasswordToken:hashedToken},});
        if(!user || !user.resetPasswordExpiresAt|| user.resetPasswordExpiresAt <= new Date()){
            return next(new AppError('Invalid or expired password reset token', 400));
        }
        user.passwordHash = await bcrypt.hash(newPassword,12);
        user.resetPasswordToken = null;
        user.resetPasswordExpiresAt = null;
        await user.save();
        res.status(200).json({success: true, message:"Password changed successfully."});
    });
module.exports ={signup, login,getMe, updateMe,changePassword, deleteMe, forgotPassword, resetPassword,};