const { DataTypes } = require("sequelize");

const Files = (sequelize) =>
  sequelize.define(
    "file",
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
      link : {
        type: DataTypes.STRING,
        allowNull : false
      },
      type : {
        type: DataTypes.STRING,
        allowNull : false
      },
      group : {
        type : DataTypes.STRING,
        allowNull : false
      }
    },
    {
      tableName: "files",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

module.exports = Files;