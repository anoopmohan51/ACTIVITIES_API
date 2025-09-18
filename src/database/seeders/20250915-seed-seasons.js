'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('seasons', [
      {
        name: 'Summer',
        start_month: 'June',
        end_month: 'August',
        created_user: 1,
        updated_user: 1,
        is_delete: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Winter',
        start_month: 'December',
        end_month: 'February',
        created_user: 1,
        updated_user: 1,
        is_delete: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Spring',
        start_month: 'March',
        end_month: 'May',
        created_user: 1,
        updated_user: 1,
        is_delete: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Fall',
        start_month: 'September',
        end_month: 'November',
        created_user: 1,
        updated_user: 1,
        is_delete: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('seasons', null, {});
  }
};
