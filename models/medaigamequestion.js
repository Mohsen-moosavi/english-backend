const { DataTypes } = require("sequelize");

const MediaQuestion = (sequelize) =>
  sequelize.define(
    "medaiGameQuestion",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      question : {
        type : DataTypes.TEXT,
        allowNull : false
      },
      answer1 : {
        type : DataTypes.TEXT,
        allowNull : false
      },
      answer2 : {
        type : DataTypes.TEXT,
        allowNull : false
      },
      answer3 : {
        type : DataTypes.TEXT,
        allowNull : false
      },
      answer4 : {
        type : DataTypes.TEXT,
        allowNull : false
      },
      correctAnswer : {
        type : DataTypes.STRING,
        allowNull : false
      }
    },
    {
      tableName: "medaiGameQuestions",
      timestamps: false
    }
  );

module.exports = MediaQuestion;