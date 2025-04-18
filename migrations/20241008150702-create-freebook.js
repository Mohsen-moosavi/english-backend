'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('freebooks', {
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

      cover : {
        type: Sequelize.STRING,
        allowNull : false
      },
      slug : {
        type : Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      fileText:{
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
        defaultValue : Sequelize.UNSIGNED
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue : Sequelize.UNSIGNED
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('freebooks');
  }
};