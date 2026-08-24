const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Category = sequelize.define(
  'Category',{id:{type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
    name: {type: DataTypes.STRING(100),allowNull: false,},
    userId: {type: DataTypes.INTEGER,allowNull: false,},},
  {tableName: 'categories',timestamps: true,}
);
module.exports = Category;