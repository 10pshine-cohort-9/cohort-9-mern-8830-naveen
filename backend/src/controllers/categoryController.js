const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const catchAsync = require('../middleware/catchAsync');

const getCategories = catchAsync(async (req, res) => {
  const categories = await Category.findAll({
    where: {userId: req.user.id,},
    order: [['createdAt', 'ASC']],
  });

  res.status(200).json({success: true,categories,});
});

const createCategory = catchAsync(async (req, res, next) => {
  const name = String(req.body.name || '').trim();

  if (!name) {
    return next(
      new AppError('Category name is required.', 400)
    );
  }
  const existing = await Category.findOne({
    where: {name,userId: req.user.id,},
  });

  if (existing) {
    return next(
      new AppError('Category already exists.', 409)
    );
  }
  const category = await Category.create({name,userId: req.user.id,});
  res.status(201).json({success: true,category,});
});

const deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findOne({
    where: {id: req.params.id,userId: req.user.id,},
  });
  if (!category) {
    return next(
      new AppError('Category not found.', 404)
    );
  }
  await category.destroy();
  res.status(200).json({success: true,message: 'Category deleted successfully.',});
});

module.exports = {getCategories,createCategory,deleteCategory,};