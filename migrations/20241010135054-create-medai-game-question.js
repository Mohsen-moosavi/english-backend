'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('medaiGameQuestions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      answer1: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      answer2: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      answer3: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      answer4: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      correctAnswer: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('medaiGameQuestions');
  }
};