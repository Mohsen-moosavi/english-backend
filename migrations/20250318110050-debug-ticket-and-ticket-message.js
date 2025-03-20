'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ticket_messages', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    })

    await queryInterface.sequelize.query(`
      ALTER TABLE tickets
      DROP COLUMN status
      `)

    await queryInterface.addColumn('tickets', 'status', {
      type: Sequelize.ENUM("open", "pending", "answered", "closed"),
      allowNull: false,
      defaultValue: 'open'
    })


  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ticket_messages', 'updated_at')
    await queryInterface.sequelize.query(`
      ALTER TABLE tickets
      DROP COLUMN status`)

    await queryInterface.addColumn('tickets', 'status', {
      type: Sequelize.ENUM("open", "pending", "closed"),
      allowNull: false,
      defaultValue: 'open'
    })
  }
};
