'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('role_master', {
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      role_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role_level: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      role_permission: {
        type: Sequelize.ARRAY(Sequelize.STRING), // Array of strings
        allowNull: false,
      },
      organization_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role_created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW, // Default value for creation time
      },
      role_isactive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true, // Default value for active status
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('role_master');
  },
};
