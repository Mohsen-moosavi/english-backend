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
        type: DataTypes.STRING,
        allowNull: false,
        get() {
            return this.getDataValue('favColors').split(';')
        },
        set(val) {
           this.setDataValue('favColors',val.join(';'));
        },
      }
    },
    {
      tableName: "roles",
      timestamps: false
    }
  );

module.exports = Roles;