const { DataTypes } = require("sequelize");

const Extrafiles = (sequelize) =>
    sequelize.define(
        "extrafile",
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            link: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            books: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 0
            },
            courses: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 0
            },
            articles: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 0
            },
        },
        {
            tableName: "extrafiles",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

module.exports = Extrafiles;