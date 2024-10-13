const { DataTypes } = require("sequelize");

const Sessions = (sequelize) =>
  sequelize.define(
    "session",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      time: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isFree:{
        type : DataTypes.BOOLEAN,
        allowNull : false,
      },
      video:{
        type : DataTypes.STRING,
        allowNull : false,
      },
      file:{
        type : DataTypes.STRING,
        allowNull : false,
      }
    },
    {
      tableName: "sessions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

module.exports = Sessions;