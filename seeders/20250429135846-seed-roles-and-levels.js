'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      { name: 'MANAGER'},
      { name: 'ADMIN'},
      { name: 'USER'},
      { name: 'TEACHER'},
      { name: 'WRITTER'},
      { name: 'TEACHERWRITTER'},
    ]);

    await queryInterface.bulkInsert('levels', [
      { name: 'A1'},
      { name: 'A2'},
      { name: 'B1'},
      { name: 'B2'},
      { name: 'C1'},
      { name: 'C2'},
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
    await queryInterface.bulkDelete('levels', null, {});
  }
};
