'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('phrasegames', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      time: {
        type: Sequelize.SMALLINT,
        allowNull: false,
      },
      score:{
        type : Sequelize.TINYINT,
        allowNull : false,
      },
      isWord:{
        type : Sequelize.BOOLEAN,
        allowNull : false,
      },
      times : {
        type: Sequelize.TINYINT,
        allowNull: false,
      },
      phrase : {
        type : Sequelize.STRING,
        allowNull : false,
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
  async down(queryInterface) {
    await queryInterface.dropTable('phrasegames');
  }
};