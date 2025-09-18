'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('seasons', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      start_month: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      end_month: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_user: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      updated_user: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      is_delete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('seasons');
  }
};
