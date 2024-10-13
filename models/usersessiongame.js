const { DataTypes } = require("sequelize");

const UserSessionGames = (sequelize) =>
  sequelize.define(
    "userSessiongame",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      q4game: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      mediagame: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      phrasegame: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      tableName: "userSessiongames",
      timestamps: false
    }
  );

module.exports = UserSessionGames;