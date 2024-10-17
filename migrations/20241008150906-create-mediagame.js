'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mediagames', {
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
      file:{
        type : Sequelize.TEXT,
        allowNull : false,
      },
      fileType:{
        type : Sequelize.ENUM,
        values: ["video", "voice" , "text"],
        allowNull:false
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
    await queryInterface.dropTable('mediagames');
  }
};