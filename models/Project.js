const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
    proj_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    proj_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    organization_name : {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    proj_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['Residential', 'Commercial']],
      },
    },
    proj_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['Active', 'Completed']],
      },
    },
    proj_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    proj_highlights: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    proj_launch_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    proj_expected_completion_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    proj_city: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    proj_locality: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    proj_address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    proj_created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    proj_is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, {
    tableName: 'project_master',
    timestamps: false,  // If you don't want Sequelize to automatically manage createdAt and updatedAt
  });

module.exports = Project;
