'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('lead_lifecycle', {
      lifecycle_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      lead_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'lead_master',
          key: 'lead_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      lead_status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      action_taken: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      call_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      call_duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      lead_response_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      action_taken_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      follow_up_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      lead_cycle_remark: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,  // Automatically uses the current timestamp
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('lead_lifecycle');
  }
};
