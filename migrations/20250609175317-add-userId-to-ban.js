'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('bans','user_id',{
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
    })

    await queryInterface.addConstraint("bans", {
        fields: ["user_id"],
        type: "unique",
        name: "unique_user",
      });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('bans','user_id')
    await queryInterface.removeConstraint('ban','unique_user')
  }
};
