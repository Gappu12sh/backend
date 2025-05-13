const { Sequelize } = require('sequelize');
const config = require('./config.json');  // Import the config.json
const env = process.env.NODE_ENV || 'development';  // Get environment (default to 'development')
const dbConfig = config[env];  // Use the correct environment config

// Create a new Sequelize instance using the config
const sequelize = new Sequelize(
  dbConfig.database, 
  dbConfig.username, 
  dbConfig.password, {

        host: dbConfig.host,
        dialect: dbConfig.dialect,
        logging: false,  // Optional: Set to false to disable SQL query logging
});

sequelize.authenticate()  // Optionally check connection
  .then(() => console.log('Database connection successful'))
  .catch((err) => console.log('Error: Unable to connect to the database:', err));

module.exports = sequelize;  // Export sequelize instance for use in models