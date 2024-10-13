'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('userSessiongames', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      q4game: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      mediagame: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      phrasegame: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('userSessiongames');
  }
};