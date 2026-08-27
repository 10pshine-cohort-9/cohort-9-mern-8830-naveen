const {DataTypes} =require('sequelize');
const {sequelize}=require('../config/db');
const Note=sequelize.define(
    'Note', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement:true},
        title: {type: DataTypes.STRING(200), allowNull: false, validate: {notEmpty:true},},
        content: {type:DataTypes.TEXT, allowNull:true,defaultValue: '',},
        category:{type:DataTypes.STRING, allowNull:true,defaultValue: null},
        isFavourite:{type:DataTypes.BOOLEAN, defaultValue: false},
        isArchived:{type:DataTypes.BOOLEAN, defaultValue: false},
        isDeleted: {type:DataTypes.BOOLEAN, defaultValue: false,},
        userId:{type:DataTypes.INTEGER,allowNull: false},
    },
    {
        tableName:'notes',
        timestamps:true,
    }
);
module.exports = Note;