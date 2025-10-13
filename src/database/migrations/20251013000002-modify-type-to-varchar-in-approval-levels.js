'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('approval_levels', 'type', {
      type: Sequelize.STRING(10),
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('approval_levels', 'type', {
      type: Sequelize.CHAR(10),
      allowNull: true
    });
  }
};

