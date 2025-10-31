'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('level_mappings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      approvallevels: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'approval_levels',
          key: 'id'
        }
      },
      user_id: {
        type: Sequelize.CHAR(30),
        allowNull: true
      },
      usergroup: {
        type: Sequelize.CHAR(30),
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('level_mappings');
  }
};
