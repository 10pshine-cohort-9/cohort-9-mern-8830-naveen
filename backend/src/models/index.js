const {sequelize} =require('../config/db');
const User=require('./User');
const Note = require('./Note');
const Category = require('./Category');
User.hasMany(Note,{foreignKey: 'userId', onDelete:'CASCADE'});
Note.belongsTo(User, {foreignKey:'userId'});
User.hasMany(Category, {foreignKey: 'userId',onDelete: 'CASCADE',});
Category.belongsTo(User, {foreignKey: 'userId',});
module.exports = {sequelize, User, Note, Category};