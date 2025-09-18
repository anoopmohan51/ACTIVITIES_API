'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('experienceVideos', 'uploaded_file_name', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'path'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('experienceVideos', 'uploaded_file_name');
  }
};
