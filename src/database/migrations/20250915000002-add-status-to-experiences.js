const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('experiences', 'status', {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'pending'
    });

    // Update existing records to have status = 'pending'
    await queryInterface.sequelize.query(`
      UPDATE experiences 
      SET status = 'pending' 
      WHERE status IS NULL
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('experiences', 'status');
  }
};
