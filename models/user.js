const { DataTypes } = require("sequelize");

const User = (sequelize) =>
  sequelize.define(
    "user",
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
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique : true
      },
      phone : {
        type: DataTypes.STRING,
        allowNull: false,
        unique : true
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      friends : {
        type: DataTypes.JSON,
        allowNull : true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      grate : {
        type : DataTypes.STRING,
        allowNull : true,
      },
      score : {
        type : DataTypes.STRING,
        allowNull : false,
        defaultValue : '0'
      },
    },
    {
      tableName: "users",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

module.exports = User;