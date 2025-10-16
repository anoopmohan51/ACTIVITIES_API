'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('approval_logs', 'current_level', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('approval_logs', 'previous_level', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('approval_logs', 'approved_by', {
      type: Sequelize.STRING(30),
      allowNull: true,
    });

    await queryInterface.addColumn('approval_logs', 'status', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await queryInterface.addColumn('approval_logs', 'action', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('approval_logs', 'current_level');
    await queryInterface.removeColumn('approval_logs', 'previous_level');
    await queryInterface.removeColumn('approval_logs', 'approved_by');
    await queryInterface.removeColumn('approval_logs', 'status');
    await queryInterface.removeColumn('approval_logs', 'action');
  }
};

