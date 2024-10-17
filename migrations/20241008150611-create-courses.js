'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('courses', {
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
      shortDescription: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      longDescription : {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      grate: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cover : {
        type: Sequelize.STRING,
        allowNull : true
      },
      introductionVideo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      off: {
        type: Sequelize.TINYINT,
        allowNull: true,
        defaultValue : 0,
      },
      price : {
        type : Sequelize.STRING,
        allowNull : false,
      },
      isCompleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0
      },
      score : {
        type : Sequelize.STRING,
        allowNull : false,
        defaultValue : '5'
      },
      slug : {
        type : Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      book_file : {
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('courses');
  }
};