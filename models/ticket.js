const { DataTypes } = require("sequelize");
const User = require("./user");

const Ticket = 
(sequelize) =>
    sequelize.define(
      "ticket",
      {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            allowNull : false,
            primaryKey: true,
          },
          user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
              model: User,
              key: "id",
            },
            onDelete: "CASCADE",
          },
          subject: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          title: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          status: {
            type: DataTypes.ENUM("open", "pending","answered", "closed"),
            defaultValue: "open",
          },
      },
      {
        tableName: "tickets",
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );

module.exports = Ticket;