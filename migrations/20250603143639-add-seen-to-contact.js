'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('contact','seen',{
      type : Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull : false,
    })

    await queryInterface.addColumn('contact','answered',{
      type : Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull : false,
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('contact','seen')
    await queryInterface.removeColumn('contact','answered')
  }
};
