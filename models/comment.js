const { DataTypes } = require("sequelize");

const Comments = (sequelize) =>
  sequelize.define(
    "comment",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isAccept: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      score : {
        type: DataTypes.TINYINT,
        allowNull: true,
      }
    },
    {
      tableName: "comments",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

module.exports = Comments;