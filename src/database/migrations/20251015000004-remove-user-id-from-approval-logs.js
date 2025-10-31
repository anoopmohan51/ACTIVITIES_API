'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('approval_logs', 'user_id');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('approval_logs', 'user_id', {
      type: Sequelize.STRING(30),
      allowNull: true,
    });
  }
};

