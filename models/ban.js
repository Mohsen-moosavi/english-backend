const { DataTypes } = require("sequelize");

const Ban = (sequelize) =>
  sequelize.define(
    "ban",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      phone: {
        type: DataTypes.STRING,
        unique : true,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      }
    },
    {
      tableName: "bans",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

module.exports = Ban;