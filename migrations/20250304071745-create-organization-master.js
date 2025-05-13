'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('organization_master', {
      org_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true, // Auto-incrementing ID
        primaryKey: true, // Primary key
      },
      organization_name: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true, // This will make 'organization_name' part of the primary key
      },
      organization_website: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      purchased_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      employee_registered: {
        type: Sequelize.INTEGER,
        allowNull: true, // Assuming it is optional
      },
      employee_plan_size: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      subscription_plan: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      subscription_end_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      purchased_on: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW, // Default value as the current timestamp
      },
      org_isactive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true, // Default value is true (active organization)
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('organization_master');
  },
};
