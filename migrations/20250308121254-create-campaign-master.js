'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('campaign_master', {
      campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      campaign_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      campaign_description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      campaign_start_date: {
        type: Sequelize.DATE, // For storing full timestamp (date + time)
        allowNull: true,
      },
      campaign_end_date: {
        type: Sequelize.DATE, // For storing full timestamp (date + time)
        allowNull: true,
      },
      campaign_budget: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      campaign_status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        validate: {
          isIn: [['Active', 'Completed', 'Paused', 'Pending']],
        },
      },
      campaign_ad_platform: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      campaign_is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      campaign_created_at: {
        type: Sequelize.DATE,  // Use Sequelize.DATE which maps to TIMESTAMP in PostgreSQL
        defaultValue: Sequelize.NOW,  // Set default value to the current timestamp
        allowNull: false,
      },
      campaign_updated_at: {
        type: Sequelize.DATE,  // Use Sequelize.DATE for TIMESTAMP
        allowNull: true,
      },
      campaign_created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      campaign_last_updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('campaign_master');
  }
};
