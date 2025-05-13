'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('project_master', {
      proj_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      proj_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      organization_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      proj_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        validate: {
          isIn: [['Residential', 'Commercial']]
        }
      },
      proj_status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        validate: {
          isIn: [['Active', 'Completed']]
        }
      },
      proj_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      proj_highlights: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      proj_launch_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      proj_expected_completion_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      proj_city: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      proj_locality: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      proj_address: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      proj_created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      proj_is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('project_master');
  }
};
