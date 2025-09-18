'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('seasons', 'company_id', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('seasons', 'site_id', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('seasons', 'company_id');
    await queryInterface.removeColumn('seasons', 'site_id');
  }
};
