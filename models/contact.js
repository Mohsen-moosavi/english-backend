const { DataTypes } = require("sequelize");

const Contact = (sequelize) =>
    sequelize.define(
        "contact",
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            seen : {
                type: DataTypes.BOOLEAN,
                allowNull:false,
                default: false
            },
            answered : {
                type: DataTypes.BOOLEAN,
                allowNull:false,
                default: false
            }
        },
        {
            tableName: "contact",
            timestamps: true,
            underscored: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

module.exports = Contact;