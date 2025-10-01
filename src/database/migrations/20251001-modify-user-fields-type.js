'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('experiences', 'created_user', {
      type: Sequelize.CHAR(50),
      allowNull: true,
    });
    await queryInterface.changeColumn('experiences', 'updated_user', {
      type: Sequelize.CHAR(50),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('experiences', 'created_user', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.changeColumn('experiences', 'updated_user', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }
};
