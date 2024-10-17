'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sessions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      time: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isFree:{
        type : Sequelize.BOOLEAN,
        allowNull : false,
      },
      video:{
        type : Sequelize.STRING,
        allowNull : false,
      },
      file:{
        type : Sequelize.STRING,
        allowNull : false,
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
    await queryInterface.dropTable('sessions');
  }
};