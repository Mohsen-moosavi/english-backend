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
      },
      jobs : {
        type : DataTypes.ARRAY(DataTypes.STRING),
        allowNull : false
      }
    },
    {
      tableName: "roles",
      timestamps: false
    }
  );

module.exports = Roles;