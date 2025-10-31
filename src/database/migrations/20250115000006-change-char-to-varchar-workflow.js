'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Change CHAR(30) to VARCHAR(30) in approval_levels table
    await queryInterface.changeColumn('approval_levels', 'company_id', {
      type: Sequelize.STRING(30),
      allowNull: true
    });
    
    await queryInterface.changeColumn('approval_levels', 'created_user', {
      type: Sequelize.STRING(30),
      allowNull: true
    });
    
    await queryInterface.changeColumn('approval_levels', 'updated_user', {
      type: Sequelize.STRING(30),
      allowNull: true
    });

    // Change CHAR(30) to VARCHAR(30) in level_mappings table
    await queryInterface.changeColumn('level_mappings', 'user_id', {
      type: Sequelize.STRING(30),
      allowNull: true
    });
    
    await queryInterface.changeColumn('level_mappings', 'usergroup', {
      type: Sequelize.STRING(30),
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert VARCHAR(30) back to CHAR(30) in approval_levels table
    await queryInterface.changeColumn('approval_levels', 'company_id', {
      type: Sequelize.CHAR(30),
      allowNull: true
    });
    
    await queryInterface.changeColumn('approval_levels', 'created_user', {
      type: Sequelize.CHAR(30),
      allowNull: true
    });
    
    await queryInterface.changeColumn('approval_levels', 'updated_user', {
      type: Sequelize.CHAR(30),
      allowNull: true
    });

    // Revert VARCHAR(30) back to CHAR(30) in level_mappings table
    await queryInterface.changeColumn('level_mappings', 'user_id', {
      type: Sequelize.CHAR(30),
      allowNull: true
    });
    
    await queryInterface.changeColumn('level_mappings', 'usergroup', {
      type: Sequelize.CHAR(30),
      allowNull: true
    });
  }
};
