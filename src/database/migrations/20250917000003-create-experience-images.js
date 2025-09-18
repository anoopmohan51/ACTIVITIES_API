'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('experienceImages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      experience_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'experiences',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      path: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      uploaded_file_name: {
        type: Sequelize.STRING,
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

    // Add index for faster lookups
    await queryInterface.addIndex('experienceImages', ['experience_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('experienceImages');
  }
};
