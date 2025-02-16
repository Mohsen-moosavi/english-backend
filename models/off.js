const { DataTypes } = require("sequelize");

const Offs = (sequelize) =>
  sequelize.define(
    "off",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      percent: {
        type: DataTypes.TINYINT,
        allowNull: false,
      },
      code : {
        type: DataTypes.STRING,
        allowNull : true
      },
      expire : {
        type: DataTypes.DATE,
        allowNull : false
      },
      times : {
        type: DataTypes.INTEGER,
        allowNull : true
      },
      remainingTimes : {
        type: DataTypes.INTEGER,
        allowNull : true
      },
      public: {
        type : DataTypes.BOOLEAN,
        allowNull : false
      }
    },
    {
      tableName: "offs",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

module.exports = Offs;