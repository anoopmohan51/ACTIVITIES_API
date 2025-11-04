'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Change fields to CHARACTER VARYING (STRING)
    await queryInterface.changeColumn('experiences', 'duration', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    await queryInterface.changeColumn('experiences', 'guideType', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    await queryInterface.changeColumn('experiences', 'noOfGuides', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    await queryInterface.changeColumn('experiences', 'travellMedium', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    await queryInterface.changeColumn('experiences', 'prefferedTime', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    await queryInterface.changeColumn('experiences', 'company_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    await queryInterface.changeColumn('experiences', 'site_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    await queryInterface.changeColumn('experiences', 'created_user', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    await queryInterface.changeColumn('experiences', 'updated_user', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Rollback to original types
    await queryInterface.changeColumn('experiences', 'duration', {
      type: Sequelize.CHAR(30),
      allowNull: true,
    });
    
    await queryInterface.changeColumn('experiences', 'guideType', {
      type: Sequelize.CHAR(30),
      allowNull: true,
    });
    
    await queryInterface.changeColumn('experiences', 'noOfGuides', {
      type: Sequelize.CHAR(30),
      allowNull: true,
    });
    
    await queryInterface.changeColumn('experiences', 'travellMedium', {
      type: Sequelize.CHAR(50),
      allowNull: true,
    });
    
    await queryInterface.changeColumn('experiences', 'prefferedTime', {
      type: Sequelize.CHAR(50),
      allowNull: true,
    });
    
    await queryInterface.changeColumn('experiences', 'company_id', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    
    await queryInterface.changeColumn('experiences', 'site_id', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    
    await queryInterface.changeColumn('experiences', 'created_user', {
      type: Sequelize.CHAR(50),
      allowNull: true,
    });
    
    await queryInterface.changeColumn('experiences', 'updated_user', {
      type: Sequelize.CHAR(50),
      allowNull: true,
    });
  }
};
