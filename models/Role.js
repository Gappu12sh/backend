const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('Role', {
    role_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    role_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role_level:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    role_permission: {
      type: DataTypes.ARRAY(DataTypes.STRING),  
      allowNull: false, 
    },
    organization_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role_created_at: {
      type : DataTypes.DATE,
      defaultValue: DataTypes.NOW, 
    },
    role_isactive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }

  }, {
    tableName: 'role_master',
    timestamps: false,
  });

module.exports = Role;