const { DataTypes } = require("sequelize");
const User = require("./user");
const Course = require("./courses");

const UserBag =(sequelize) =>
    sequelize.define(
      "user_bag",
      {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
          },
        //   user_id: {
        //     type: DataTypes.INTEGER.UNSIGNED,
        //     allowNull: false,
        //     references: {
        //       model: User,
        //       key: "id",
        //     },
        //     onDelete: "CASCADE",
        //   },
        //   course_id: {
        //     type: DataTypes.INTEGER.UNSIGNED,
        //     allowNull: false,
        //     references: {
        //       model: Course,
        //       key: "id",
        //     },
        //     onDelete: "CASCADE",
        //   }
      },
      {
        tableName: "user_bag",
        timestamps: true,    
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );

module.exports = UserBag;