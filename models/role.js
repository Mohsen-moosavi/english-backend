const { DataTypes } = require("sequelize");

const Roles = (sequelize) =>
  sequelize.define(
    "role",
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
        unique : true
      },
      jobs : {
        type: DataTypes.JSON,
        allowNull : false
      }
    },
    {
      tableName: "roles",
      timestamps: false
    }
  );

module.exports = Roles;