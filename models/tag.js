const { DataTypes } = require("sequelize");

const Tags = (sequelize) =>
  sequelize.define(
    "tag",
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
      tableName: "tags",
      timestamps: false
    }
  );

module.exports = Tags;