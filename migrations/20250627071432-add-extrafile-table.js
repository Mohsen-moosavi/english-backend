'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("extrafiles", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      link: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      books: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 0
      },
      courses: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 0
      },
      articles: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('extrafiles');
  }
};
