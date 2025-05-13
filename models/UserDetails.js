const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 
const brcrpt = require("bcrypt")

const UserDetails = sequelize.define('UserDetails', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_lname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_mobile: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_alt_mobile: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  user_email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique:true,
  },
  user_designation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  user_address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_state: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_zipcode: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  organization_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role_id:{
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_report_to: {
    type: DataTypes.INTEGER,
    // allowNull: false,
    references: {
      model: 'user_details', // self-referencing the same table
      key: 'user_id',
    },
    onDelete: 'SET NULL',
    validate: {
      // Custom validation to check that the user exists
      async isValidUser(value) {
        if (value) {
          const user = await UserDetails.findByPk(value);
          if (!user) {
            throw new Error('user_Report_to must reference an existing user_id');
          }
        }
      },
    },
  },
  user_password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_isactive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  user_doe: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, // This will set the default value to the current date and time
  },
  user_createdby: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'user_details',
  timestamps: false, 
});



UserDetails.beforeCreate(async (user) => {
  if (user.user_password) {
    const salt = await brcrpt.genSalt(10);
    user.user_password = await brcrpt.hash(user.user_password, salt);
  }
});

UserDetails.beforeUpdate(async (user) => {
  if (user.user_password && user.changed('user_password')) {
    const salt = await brcrpt.genSalt(10);
    user.user_password = await brcrpt.hash(user.user_password, salt);
  }
});


UserDetails.prototype.comparePassword = async function (password) {
  try {
    const isMatch = await brcrpt.compare(password, this.user_password);
    return isMatch;
  } catch (error) {
    throw new Error('Error comparing password');
  }
};


module.exports = UserDetails;
