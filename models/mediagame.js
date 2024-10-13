const { DataTypes } = require("sequelize");

const MediaGames = (sequelize) =>
  sequelize.define(
    "mediagame",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      time: {
        type: DataTypes.SMALLINT,
        allowNull: false,
      },
      file:{
        type : DataTypes.TEXT,
        allowNull : false,
      },
      fileType:{
        type : DataTypes.ENUM,
        values: ["video", "voice" , "text"],
        allowNull:false
      }
    },
    {
      tableName: "mediagames",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

module.exports = MediaGames;