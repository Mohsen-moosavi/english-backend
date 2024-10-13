const { DataTypes } = require("sequelize");

const Levels = (sequelize) =>
  sequelize.define(
    "level",
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
      }
    },
    {
      tableName: "levels",
      timestamps: false
    }
  );

module.exports = Levels;