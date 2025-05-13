const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lead = sequelize.define('Lead', {
    lead_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    lead_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lead_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lead_mobile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lead_occupation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lead_status: {
      type: DataTypes.STRING,
      defaultValue: 'New',  
      allowNull: false,
      validate: {
        isIn: {
          args: [['Won', 'SiteVisit', 'New', 'Duplicate', 'Junk', 'Lost', 'FollowUp', 'Pending']],
          msg: 'Invalid lead status.'
        }
      }
    },    
    lead_assign_to: {
      type: DataTypes.INTEGER,
    },
    organization_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lead_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lead_city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lead_country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    
    lead_source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lead_campaign_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lead_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lead_budget: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    lead_remark: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lead_created_by:{
      type: DataTypes.INTEGER,
    },
    lead_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW, 
    },
    lead_last_updated:{
      type: DataTypes.DATE,
      // defaultValue: DataTypes.NOW, // This will set the default value to the current date and time
    }
  
  }, {
    tableName: 'lead_master',
    timestamps: false,
  });

module.exports = Lead;