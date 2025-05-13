const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LeadLifecycle = sequelize.define('LeadLifecycle', {
    lifecycle_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    lead_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    lead_status: { 
        type: DataTypes.STRING,
        allowNull: false,
    },
    action_taken: {  
        type: DataTypes.STRING,
        allowNull: true,
    },
    call_type: {  
        type: DataTypes.STRING,
        allowNull: true,
    },
    call_duration: {  
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    lead_response_type: {  
        type: DataTypes.STRING,
        allowNull: true,
    },
    action_taken_by: {  
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    follow_up_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    lead_cycle_remark: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    created_at: { 
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,  // Automatically uses current timestamp
    },
}, {
    tableName: 'lead_lifecycle',
    timestamps: false,  
});

module.exports = LeadLifecycle;
