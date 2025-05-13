'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('lead_master', {
      lead_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      lead_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lead_email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lead_mobile: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lead_occupation: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lead_status: {
        type: Sequelize.STRING,
        defaultValue: 'New',
        allowNull: false,
      },
      lead_assign_to: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      organization_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lead_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lead_city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lead_country: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lead_source: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lead_campaign_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lead_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lead_budget: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      lead_remark: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lead_created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      lead_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        // allowNull: true, // Adjust this as per your requirement
      },
      lead_last_updated: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('lead_master');
  },
};
