'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('categories', 'created_user', {
      type: Sequelize.CHAR(50),
      allowNull: true,
    });
    await queryInterface.changeColumn('categories', 'updated_user', {
      type: Sequelize.CHAR(50),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('categories', 'created_user', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.changeColumn('categories', 'updated_user', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }
};
