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
        type: Sequelize.JSON,
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      grate : {
        type : Sequelize.STRING,
        allowNull : true,
      },
      score : {
        type : Sequelize.INTEGER,
        allowNull : false,
        defaultValue : '0'
      },
      refreshToken : {
        type : Sequelize.STRING,
        allowNull : true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue : Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue : Sequelize.NOW
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('users');
  }
};