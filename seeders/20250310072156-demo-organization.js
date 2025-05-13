'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('organization_master', [
      {
        // org_id: 1, // Org ID 1
        organization_name: 'Tech Innovators Inc.',
        organization_website: 'https://www.techinnovators.com',
        purchased_by: 1, // Assuming 101 is the ID of the user who purchased
        employee_registered: null,
        employee_plan_size: 100,
        subscription_plan: 2, // Plan ID 2
        subscription_end_date: new Date('2026-12-31'), // Example end date
        purchased_on: new Date(),
        org_isactive: true,
      },
      {
        // org_id: 2, // Org ID 2
        organization_name: 'Health Solutions Ltd.',
        organization_website: 'https://www.healthsolutions.com',
        purchased_by: 2, // Assuming 102 is the ID of the user who purchased
        employee_registered: null,
        employee_plan_size: 50,
        subscription_plan: 1, // Plan ID 1
        subscription_end_date: new Date('2025-11-30'), // Example end date
        purchased_on: new Date(),
        org_isactive: true,
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('organization_master', null, {});
  },
};
