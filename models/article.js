const { DataTypes } = require("sequelize");

const Articles = (sequelize) =>
  sequelize.define(
    "article",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      shortDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      longDescription : {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      cover : {
        type: DataTypes.STRING,
        allowNull : false
      },
      slug : {
        type : DataTypes.STRING,
        allowNull: false,
        unique: true,
      }
    },
    {
      tableName: "articles",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

module.exports = Articles;