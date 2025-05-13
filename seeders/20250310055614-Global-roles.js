'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insert initial data into the role_master table
    await queryInterface.bulkInsert('role_master', [
      {
        role_name: 'superadmin',
        role_level: 0,
        role_permission: ['DEFAULT'],
        organization_name: 'Overview',
        role_created_at: new Date(),
        role_isactive: true,
      },
      {
        role_name: 'admin',
        role_level: 1,
        role_permission: ['DEFAULT'],
        organization_name: 'Global',
        role_created_at: new Date(),
        role_isactive: true,
      },
      {
        role_name: 'manager',
        role_level: 2,
        role_permission: ['DEFAULT'],
        organization_name: 'Global',
        role_created_at: new Date(),
        role_isactive: true,
      },
      {
        role_name: 'agent',
        role_level: 3,
        role_permission: ['DEFAULT'],
        organization_name: 'Global',
        role_created_at: new Date(),
        role_isactive: true,
      },
      {
        role_name: 'marketing',
        role_level: 3,
        role_permission: ['DEFAULT'],
        organization_name: 'Global',
        role_created_at: new Date(),
        role_isactive: true,
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Optionally, remove the inserted data when rolling back
    await queryInterface.bulkDelete('role_master', null, {});
  },
};
