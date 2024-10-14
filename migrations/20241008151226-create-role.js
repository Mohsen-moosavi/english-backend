'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
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
      jobs : {
        type: Sequelize.STRING,
        allowNull: false,
        get() {
            return this.getDataValue('favColors').split(';')
        },
        set(val) {
           this.setDataValue('favColors',val.join(';'));
        },
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('roles');
  }
};