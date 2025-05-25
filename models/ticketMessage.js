const { DataTypes } = require("sequelize");
const Ticket = require("./ticket");
const User = require("./user");

const TicketMessage =(sequelize) =>
    sequelize.define(
      "ticket_message",
      {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
          },
          ticket_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
              model: Ticket,
              key: "id",
            },
            onDelete: "CASCADE",
          },
          sender_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
              model: User,
              key: "id",
            },
            onDelete: "CASCADE",
          },
          message: {
            type: DataTypes.TEXT,
            allowNull: false,
          },
      },
      {
        tableName: "ticket_messages",
        timestamps: true,    
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );

module.exports = TicketMessage;