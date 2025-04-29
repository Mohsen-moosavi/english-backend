const moment = require("moment-jalaali");
const { DataTypes } = require("sequelize");

const Sales = (sequelize) =>
  sequelize.define(
    "sale",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      price: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      mainPrice: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      off : {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue : 0
      },
      shamsi_month:{
        type : DataTypes.STRING,
        allowNull: false
      },
      offPercent : {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue : 0
      },
    },
    {
      hooks : {
          beforeCreate: (sale, options) => {
          const createdAt = sale.created_at || new Date();
          sale.shamsi_month = moment(createdAt).format('jYYYY-jMM');
        }
      },
      tableName: "sales",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

module.exports = Sales;