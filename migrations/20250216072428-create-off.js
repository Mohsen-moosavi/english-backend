'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('offs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      percent: {
        type: Sequelize.TINYINT,
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: true
      },
      expire: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      times: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      remainingTimes: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      public: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('offs');
  }
};