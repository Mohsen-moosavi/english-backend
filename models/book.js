const { DataTypes } = require("sequelize");

const Books = (sequelize) =>
  sequelize.define(
    "book",
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
      ageGrate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cover : {
        type: DataTypes.STRING,
        allowNull : false
      },
      files : {
        type : DataTypes.ARRAY(DataTypes.STRING),
        allowNull : false,
      },
      slug : {
        type : DataTypes.STRING,
        allowNull: false,
        unique: true,
      }
    },
    {
      tableName: "books",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

module.exports = Books;