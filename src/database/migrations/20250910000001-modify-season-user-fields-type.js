'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('seasons', 'created_user', {
      type: Sequelize.CHAR(25),
      allowNull: true,
    });
    await queryInterface.changeColumn('seasons', 'updated_user', {
      type: Sequelize.CHAR(25),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('seasons', 'created_user', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.changeColumn('seasons', 'updated_user', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }
};
