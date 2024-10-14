'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('books', {
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
      ageGrate: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cover : {
        type: Sequelize.STRING,
        allowNull : false
      },
      files : {
        type: Sequelize.STRING,
        allowNull: false,
        get() {
            return this.getDataValue('favColors').split(';')
        },
        set(val) {
           this.setDataValue('favColors',val.join(';'));
        },
      },
      slug : {
        type : Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue : Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue : Sequelize.NOW
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('books');
  }
};