const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    // Change the default value of status column from 'pending' to 'draft'
    await queryInterface.changeColumn('experiences', 'status', {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'draft'
    });

    // Update existing records that have status = 'pending' to 'draft'
    await queryInterface.sequelize.query(`
      UPDATE experiences 
      SET status = 'draft' 
      WHERE status = 'pending'
    `);
  },

  async down(queryInterface) {
    // Revert the default value back to 'pending'
    await queryInterface.changeColumn('experiences', 'status', {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'pending'
    });

    // Revert existing records that have status = 'draft' back to 'pending'
    await queryInterface.sequelize.query(`
      UPDATE experiences 
      SET status = 'pending' 
      WHERE status = 'draft'
    `);
  }
};

