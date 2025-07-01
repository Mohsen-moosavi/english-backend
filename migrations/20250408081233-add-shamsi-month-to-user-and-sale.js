'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'shamsi_month', {
      type: Sequelize.STRING,
      allowNull: true, // بعداً مقداردهی می‌کنیم
    });

    await queryInterface.addColumn('sales', 'shamsi_month', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'shamsi_month');
    await queryInterface.removeColumn('sales', 'shamsi_month');
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
