const {DataTypes} =require('sequelize');
const {sequelize}=require('../config/db');
const Note=sequelize.define(
    'Note', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement:true},
        title: {type: DataTypes.STRING(200), allowNull: false, validate: {notEmpty:true},},
        content: {type:DataTypes.TEXT, allowNull:true,defaultValue: '',},
        category:{type:DataTypes.ENUM('Personal', 'Work','Ideas','Study','Other'),defaultValue: 'Personal'},
        isFavourite:{type:DataTypes.BOOLEAN, defaultvalue: false},
        isArchived:{type:DataTypes.BOOLEAN, defaultValue: false},
        isDeleted: {type:DataTypes.BOOLEAN, defaultValue: false,},
        userId:{type:DataTypes.INTEGER,allowNull: false},
    },
    {
        tableName:'notes',
        timestampls:true,
    }
);
module.exports = Note;