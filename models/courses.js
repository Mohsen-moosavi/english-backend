const { DataTypes } = require("sequelize");

const Courses = (sequelize) =>
  sequelize.define(
    "course",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      shortDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      longDescription : {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      grate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cover : {
        type: DataTypes.STRING,
        allowNull : true
      },
      introductionVideo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      off: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue : 0,
      },
      price : {
        type : DataTypes.STRING,
        allowNull : false,
      },
      isCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0
      },
      score : {
        type : DataTypes.STRING,
        allowNull : false,
        defaultValue : '5'
      },
      slug : {
        type : DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      book_file : {
        type : DataTypes.STRING,
        allowNull : false,
      }
    },
    {
      tableName: "courses",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

module.exports = Courses;