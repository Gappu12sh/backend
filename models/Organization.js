const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Organization = sequelize.define('Organization', {
    org_id: {
        type: DataTypes.INTEGER,
    },
    organization_name: {
        type: DataTypes.STRING,
        primaryKey: true, 
      },
    organization_website:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    purchased_by: {
        type: DataTypes.INTEGER,  
        allowNull: false, 
    },
    employee_registered: {
         type: DataTypes.INTEGER,
    },
    employee_plan_size: {
        type: DataTypes.INTEGER,  
        allowNull: false, 
    },
    subscription_plan: {
        type: DataTypes.INTEGER,  
        allowNull: false, 
    },
    subscription_end_date: {
        type: DataTypes.DATE,  
        allowNull: true, 
    },
    purchased_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, 
    },
    org_isactive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
  }, {
    tableName: 'organization_master',
    timestamps: false,
  });

module.exports = Organization;