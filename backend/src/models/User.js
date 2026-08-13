const {DataTypes} =require('sequelize');
const {sequelize} = require('../config/db');
const User=sequelize.define(
    'User', {
        id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        fullName: {type: DataTypes.STRING(120), allowNull: false, validate: {notEmpty: true}},
        email: {type:DataTypes.STRING(200), allowNull: false, unique: true, validate:{isEmail: true}},
        passwordHash:{type:DataTypes.STRING(250), allowNull:false},
        tagline:{type:DataTypes.STRING(180), allowNull:true, defaultvalue: 'Work smart, stay organized.'},
        theme: {type: DataTypes.ENUM('Light','Dark'), defaultValue:'Light'},
        language: {type:DataTypes.STRING(50), defaultValue: "English"},
        timezone:{type: DataTypes.STRING(80), defaultValue: "UTC"},
        accountType: {type: DataTypes.ENUM('Free Plan','Pro Plan'), defaultValue: 'Free Plan'},
    },
    {
        tableName: 'users',
        timestamps: true
    }
);
module.exports = User;