const { DataTypes } = require("sequelize");

const PhraseGames = (sequelize) =>
  sequelize.define(
    "phrasegame",
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
      score:{
        type : DataTypes.TINYINT,
        allowNull : false,
      },
      isWord:{
        type : DataTypes.BOOLEAN,
        allowNull : false,
      },
      times : {
        type: DataTypes.TINYINT,
        allowNull: false,
      },
      phrase : {
        type : DataTypes.STRING,
        allowNull : false,
      }
    },
    {
      tableName: "phrasegames",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

module.exports = PhraseGames;