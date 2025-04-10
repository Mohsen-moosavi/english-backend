const { DataTypes } = require("sequelize");
const moment = require('moment-jalaali');

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
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      score : {
        type : DataTypes.INTEGER,
        allowNull : false,
        defaultValue : '0'
      },
      shamsi_month:{
        type : DataTypes.STRING,
        allowNull: true
      },
      refreshToken : {
        type : DataTypes.STRING,
        allowNull : true
      },
    },
    {
      hooks : {
        beforeCreate: (user, options) => {
          const createdAt = user.created_at || new Date();
          user.shamsi_month = moment(createdAt).format('jYYYY-jMM');
        }
      },
      tableName: "users",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

module.exports = User;