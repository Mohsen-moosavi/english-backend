'use strict';

const { sequelize } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique : true
      },
      phone : {
        type: Sequelize.STRING,
        allowNull: false,
        unique : true
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      friends : {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull : true
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue : 0
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      grate : {
        type : Sequelize.STRING,
        allowNull : true,
      },
      role: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: "user",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue : Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue : Sequelize.NOW
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};