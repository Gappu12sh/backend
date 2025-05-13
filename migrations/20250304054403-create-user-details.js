'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_details', {
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_lname: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_mobile: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_alt_mobile: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      user_email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      user_designation: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dob: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      user_address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_state: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_country: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_zipcode: {
        type: Sequelize.INTEGER, 
        allowNull: false,
      },
      organization_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      user_role: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_report_to: {
        type: Sequelize.INTEGER,
        references: {
          model: 'user_details', 
          key: 'user_id',
        },
        onDelete: 'SET NULL',
        allowNull: true, 
      },
      user_password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_isactive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      user_doe: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW, 
      },
      user_createdby: {
        type: Sequelize.INTEGER,
      },
      user_isactive: {
        type: Sequelize.BOOLEAN,
        defaultValue:true,
      },
      
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_details');
  },
};
