const { DataTypes } = require("sequelize");

const FreeBooks = (sequelize) =>
  sequelize.define(
    "freeBook",
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
      grate : {
        type : DataTypes.STRING,
        allowNull : false,
      },
      cover : {
        type: DataTypes.STRING,
        allowNull : false
      },
      slug : {
        type : DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      fileText:{
        type : DataTypes.STRING,
        allowNull : false,
      },
      file:{
        type : DataTypes.STRING,
        allowNull : false,
      }
    },
    {
      tableName: "freebooks",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

module.exports = FreeBooks;