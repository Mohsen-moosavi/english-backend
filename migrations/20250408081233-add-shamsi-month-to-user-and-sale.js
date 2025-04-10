'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'shamsi_month', {
      type: Sequelize.STRING,
      allowNull: true, // بعداً مقداردهی می‌کنیم
    });

    await queryInterface.addColumn('Sales', 'shamsi_month', {
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
    await queryInterface.removeColumn('Users', 'shamsi_month');
    await queryInterface.removeColumn('Sales', 'shamsi_month');
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
