const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('experiences', 'company_id', {
      type: DataTypes.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('experiences', 'site_id', {
      type: DataTypes.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('experiences', 'created_user', {
      type: DataTypes.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('experiences', 'updated_user', {
      type: DataTypes.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('experiences', 'is_delete', {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('experiences', 'company_id');
    await queryInterface.removeColumn('experiences', 'site_id');
    await queryInterface.removeColumn('experiences', 'created_user');
    await queryInterface.removeColumn('experiences', 'updated_user');
    await queryInterface.removeColumn('experiences', 'is_delete');
  }
};
