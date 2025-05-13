const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Update the path to your database configuration if necessary

const Campaign = sequelize.define('Campaign', {
  campaign_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  campaign_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  campaign_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  campaign_start_date: {
    type: DataTypes.DATE,  // Sequelize.DATE maps to PostgreSQL TIMESTAMP
    allowNull: true,
  },
  campaign_end_date: {
    type: DataTypes.DATE,  // Sequelize.DATE maps to PostgreSQL TIMESTAMP
    allowNull: true,
  },
  campaign_budget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  campaign_status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['Active', 'Completed', 'Paused', 'Pending']],
    },
  },
  campaign_ad_platform: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  campaign_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  campaign_created_at: {
    type: DataTypes.DATE,  // Sequelize.DATE maps to PostgreSQL TIMESTAMP
    defaultValue: DataTypes.NOW,  // Automatically set to the current timestamp
    allowNull: false,
  },
  campaign_updated_at: {
    type: DataTypes.DATE,  // Sequelize.DATE maps to PostgreSQL TIMESTAMP
    allowNull: true,
  },
  campaign_created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  campaign_last_updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'project_master',  // This refers to the 'project_master' table
      key: 'proj_id',           // This should be the primary key of the project_master table
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',  // You can change this behavior if needed (e.g., CASCADE or RESTRICT)
  },
}, {
  tableName: 'campaign_master',
  timestamps: false,  // We're not using Sequelize's default 'createdAt' and 'updatedAt'
});

module.exports = Campaign;
