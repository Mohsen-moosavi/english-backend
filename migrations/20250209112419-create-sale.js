'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sales', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      price: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      mainPrice: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      off : {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue : 0,
      },
      offPercent : {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue : 0,
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
    await queryInterface.dropTable('sales');
  }
};