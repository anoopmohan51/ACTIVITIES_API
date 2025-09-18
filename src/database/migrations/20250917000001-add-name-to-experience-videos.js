'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('experienceVideos', 'name', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'experience_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('experienceVideos', 'name');
  }
};
