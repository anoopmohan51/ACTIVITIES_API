'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('experiences', 'department_id', {
      type: Sequelize.CHAR(50),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('experiences', 'department_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }
};
