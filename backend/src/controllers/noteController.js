const {Op} = require('sequelize');
const Note = require("../models/Note");
const AppError = require("../utils/AppError");
const catchAsync = require('../middleware/catchAsync');
const logger = require('../config/logger');

const getNotes = catchAsync(async(req,res)=>{
    const {category, favourite, archived, trashed, search} = req.query;
    const where = {userId: req.user.id};
    where.isArchived = archived === 'true';
    where.isDeleted = trashed === 'true';
    if(favourite === 'true'){
        where.isFavourite = true;
    }
    if(category){
        where.category = category;
    }
    if(search){
        where.title = {[Op.like]: `%${search}%`};
    }
    const notes = await Note.findAll({where, order: [['updatedAt', 'DESC']]});
    res.status(200).json({success:true, count: notes.length, notes});
});

const getNote = catchAsync(async(req,res,next)=>{
    const note = await Note.findOne({where: {id: req.params.id, userId: req.user.id}});
    if(!note){
        return next(new AppError("Note not found.", 404));
    }
    res.status(200).json({success: true, note});
});
const createNote = catchAsync(async(req, res)=>{
    const {title, content, category} = req.body;
    const note = await Note.create({title, content: content || '', category: category || "Personal", userId: req.user.id,});
    logger.info({noteId: note.id, userId: req.user.id}, 'Note created');
    res.status(201).json({success: true, note});
});
const updateNote = catchAsync(async(req,res,next)=>{
    const note = await Note.findOne({where: {id: req.params.id, userId: req.user.id}});
    if(!note){
        return next(new AppError("Note not found",404));
    }
    const allowedFields =['title', 'content','category', 'isFavourite', 'isArchived', 'isDeleted'];
    allowedFields.forEach((field)=>{
        if(req.body[field] !== undefined){
            note[field]=req.body[field];
        }
    });
    await note.save();
    res.status(200).json({success: true, note});
});

const deleteNote = catchAsync(async(req,res,next)=>{
    const note = await Note.findOne({where:{id: req.params.id, userId: req.user.id}});
    if(!note){
        return next(new AppError("Note not found.",404));
    }
    if(note.isDeleted){
        await note.destroy();
        return res.status(200).json({success: true, message: "Note permanently deleted."});
    }
    note.isDeleted = true;
    await note.save();
    res.status(200).json({success: true, message: "Note moved to Trash.", note});
});
module.exports ={getNote,getNotes,createNote,updateNote,deleteNote};