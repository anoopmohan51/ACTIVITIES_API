'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('approval_logs', 'reason_for_reject', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Reason for rejection or comments from approver'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('approval_logs', 'reason_for_reject');
  }
};

