'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('categories', [
      {
        name: 'Adventure',
        description: 'Outdoor adventure activities',
        created_user: 1,
        updated_user: 1,
        is_delete: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cultural',
        description: 'Cultural and heritage experiences',
        created_user: 1,
        updated_user: 1,
        is_delete: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Nature',
        description: 'Nature and wildlife experiences',
        created_user: 1,
        updated_user: 1,
        is_delete: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
