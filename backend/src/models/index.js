const {sequelize} =require('../config/db');
const User=require('./User');
const Note = require('./Note');
User.hasMany(Note,{foreignKey: 'userId', onDelete:'CASCADE'});
Note.belongsTo(User, {foreignKey:'userId'});
module.exports = {sequelize, User, Note};