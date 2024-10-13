const { DataTypes } = require("sequelize");

const Q4Games = (sequelize) =>
  sequelize.define(
    "q4Game",
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
      }
    },
    {
      tableName: "q4games",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

module.exports = Q4Games;