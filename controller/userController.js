const UserDetails = require('../models/UserDetails');
const Lead = require('../models/Lead');
const Role = require('../models/Role');
const { generateToken } = require('./../jwtAuth');
const { Op } = require('sequelize');









//add users
exports.signup = async (req, res) => {
  try {
    const data = req.body;

    const existingUser = await UserDetails.findOne({ where: { user_email: data.user_email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const roleData = await Role.findOne({
      where: {
        role_name: data.user_role,
        [Op.or]: [
          { organization_name: data.organization_name },
          { organization_name: "Global" }
        ]
      },
    });

    if (!roleData) {
      return res.status(400).json({ message: 'Role not found for the given organization' });
    }
    
    data.role_id = roleData.role_id;


    const newUser = new UserDetails(data);
    const response = await newUser.save();
    console.log("Data saved");

    const payload = {
      name: response.user_name,
      email: response.user_email,
      id: response.user_id,
      role: response.user_role,
      org: response.organization_name,
    };
    const token = generateToken(payload);
    // console.log("Token is: ", token);

    res.status(201).json({
      message: 'New user created successfully!',
      user: newUser,
      token: token,
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};


// // Login Route
// exports.login = async (req, res) => {
//   try {
//     const { user_email, user_password } = req.body;
//     const user = await UserDetails.findOne({ where: { user_email: user_email } });

//     if (!user) {
//       return res.status(401).json({ error: "Invalid user email" });
//     }
//     const isMatch = await user.comparePassword(user_password);

//     if (!isMatch) {
//       return res.status(401).json({ error: "Invalid user password" });
//     }

//     const payload = {
//       name: response.user_name,
//       email: user.user_email,
//       id: user.user_id,
//       role: user.user_role,
//       org: user.organization_name,
//     };
//     const token = generateToken(payload);

//     res.json({ token });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// Login Route
exports.login = async (req, res) => {
  try {
    const { user_email, user_password } = req.body;
    const user = await UserDetails.findOne({ where: { user_email: user_email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid user email" });
    }
    const isMatch = await user.comparePassword(user_password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid user password" });
    }

    // Fetch role permissions based on the user's role and organization
    const role = await Role.findOne({ 
      where: { 
        role_name: user.user_role, 
        [Op.or]: [
          { organization_name: user.organization_name },
          { organization_name: 'Global' }
        ]
      }
    });
   

    if (!role) {
      return res.status(404).json({ error: "Role not found for this user" });
    }

    const permissions = role.role_permission;  // Assuming role_permission is an array or string of permissions

    // Construct the payload
    const payload = {
      name: user.user_name,
      email: user.user_email,
      id: user.user_id,
      role: user.user_role,
      org: user.organization_name,
      permissions: permissions,  // Adding permissions to the payload
    };

    // Generate the token with the payload
    const token = generateToken(payload);

    // Return the token as the response
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



exports.getUserDetailsById = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the request parameters
    const user = await UserDetails.findOne({ where: { user_id: id } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.toJSON()); // Send only the user's details
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};





exports.getUserById = async (req, res) => {
  try {
    const id = req.jwtPayload.id;
    const user = await UserDetails.findOne({ where: { user_id: id } });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const users = await UserDetails.findAll();
    const groupedUsers = users.reduce((acc, u) => {
      acc[u.user_report_to] = acc[u.user_report_to] || [];
      acc[u.user_report_to].push(u);
      return acc;
    }, {});

    const getUserHierarchy = async (user) => {
      const subordinates = groupedUsers[user.user_id] || [];
      const allSubordinates = [];

      // Loop through the subordinates of the user and flatten them one by one
      for (const subordinate of subordinates) {
        // Recursively add subordinates of the subordinate
        const subordinatesOfSubordinate = await getUserHierarchy(subordinate);
        allSubordinates.push({
          ...subordinate.toJSON(),
        });
        allSubordinates.push(...subordinatesOfSubordinate);
      }

      return allSubordinates;
    };

    const subordinates = await getUserHierarchy(user);

    // Get the total count of subordinates including the user himself
    const totalUsers = subordinates.length + 1; // +1 to include the user himself

    // Count active and inactive users
    let activeCount = 0;
    let inactiveCount = 0;

    // Check if the user himself is active
    if (user.user_isactive) {
      activeCount += 1;
    } else {
      inactiveCount += 1;
    }

    // Count active and inactive subordinates
    subordinates.forEach((subordinate) => {
      if (subordinate.user_isactive) {
        activeCount += 1;
      } else {
        inactiveCount += 1;
      }
    });

    res.json({
      ...user.toJSON(),
      subordinates, // Here all subordinates are flattened, one by one.
      totalUsers, // Total count of subordinates including the user
      totalActiveUsers: activeCount, // Count of active users (including the user himself)
      totalInactiveUsers: inactiveCount // Count of inactive users (including the user himself)
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};







exports.toggleUserStatus = async (req, res) => {
  const { id } = req.params; // Get the user ID from the request params

  try {
    const user = await UserDetails.findOne({ where: { user_id: id } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle the user_isactive status
    user.user_isactive = user.user_isactive === true ? false : true;

    // Save the updated user
    await user.save();

    res.status(200).json({
      message: `User status updated to ${user.user_isactive === true ? 'active' : 'inactive'}`,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating user status' });
  }
};




// exports.getUserById = async (req, res) => {

//   try {
//     // const id = Number(req.params.id);
//     const id = req.jwtPayload.id
//     const user = await UserDetails.findOne({ where: { user_id: id } });

//     if (!user) return res.status(404).json({ error: 'User not found' });

//     const users = await UserDetails.findAll();
//     const groupedUsers = users.reduce((acc, u) => {
//       acc[u.user_report_to] = acc[u.user_report_to] || [];
//       acc[u.user_report_to].push(u);
//       return acc;
//     }, {});

//     const getUserHierarchy = async (user) => {
//       const subordinates = groupedUsers[user.user_id] || [];

//       const allSubordinates = [];

//       // Loop through the subordinates of the user and flatten them one by one
//       for (const subordinate of subordinates) {
//         const leadsCount = await Lead.count({ where: { lead_assign_to: subordinate.user_id } });
//         const leads = await Lead.findAll({ where: { lead_assign_to: subordinate.user_id } });

//         allSubordinates.push({
//           ...subordinate.toJSON(),
//           assigned_Leads: leadsCount,
//           leads
//         });

//         // Recursively add subordinates of the subordinate
//         const subordinatesOfSubordinate = await getUserHierarchy(subordinate);
//         allSubordinates.push(...subordinatesOfSubordinate);
//       }

//       return allSubordinates;
//     };

//     const leadsCount = await Lead.count({ where: { lead_assign_to: user.user_id } });
//     const leads = await Lead.findAll({ where: { lead_assign_to: user.user_id } });
//     const subordinates = await getUserHierarchy(user);

//     res.json({
//       ...user.toJSON(),
//       assigned_Leads: leadsCount,
//       leads,
//       subordinates // Here all subordinates are flattened, one by one.
//     });
//   } catch (error) {
//     console.error('Error fetching user:', error);
//     res.status(500).json({ error: 'Something went wrong' });
//   }
// };



// Update a user by ID
exports.updateUser = async (req, res) => {
  try {
    const id = Number(req.params.id);  // Get the user ID from URL params
    const {
      user_name, 
      user_lname, 
      user_mobile, 
      user_alt_mobile, 
      user_email, 
      user_designation, 
      dob, 
      user_address, 
      user_state, 
      user_country, 
      user_zipcode, 
      user_report_to, 
      user_password  // Removed user_isactive here
    } = req.body;  // Destructure the fields from the request body

    const user = await UserDetails.findOne({ where: { user_id: id } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the email is being updated and is already in use by another user
    if (user_email && user_email !== user.user_email) {
      const existingUser = await UserDetails.findOne({ where: { user_email: user_email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Prepare the fields to be updated
    const updatedFields = {};
    if (user_name) updatedFields.user_name = user_name;
    if (user_lname) updatedFields.user_lname = user_lname;
    if (user_mobile) updatedFields.user_mobile = user_mobile;
    if (user_alt_mobile) updatedFields.user_alt_mobile = user_alt_mobile;
    if (user_email) updatedFields.user_email = user_email;
    if (user_designation) updatedFields.user_designation = user_designation;
    if (dob) updatedFields.dob = dob;
    if (user_address) updatedFields.user_address = user_address;
    if (user_state) updatedFields.user_state = user_state;
    if (user_country) updatedFields.user_country = user_country;
    if (user_zipcode) updatedFields.user_zipcode = user_zipcode;
    if (user_report_to !== undefined) updatedFields.user_report_to = user_report_to;
    if (user_password) updatedFields.user_password = user_password;  // Assuming you are handling password hashing elsewhere

    // Update the user
    await user.update(updatedFields);

    res.json({
      message: 'User updated successfully!',
      user: { ...user.toJSON(), ...updatedFields }  // Include updated fields in the response
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};


// Delete a user by ID
exports.deleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await UserDetails.findOne({ where: { user_id: id } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await UserDetails.destroy({ where: { user_id: id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// // Change Password Route
// exports.changePassword = async (req, res) => {
//   const userId = req.jwtPayload.id;
//   const { old_password, new_password } = req.body;

//   try {
//     const user = await UserDetails.findByPk(userId);

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }
//     const isMatch = await user.comparePassword(old_password);
//     if (!isMatch) {
//       return res.status(400).json({ error: 'Old password is incorrect' });
//     }
//     user.user_password = new_password;
//     await user.save();

//     return res.status(200).json({ message: 'Password changed successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(406).json({ error: 'Something went wrong' });
//   }
// };


// Change Password Route
exports.changePassword = async (req, res) => {
  const userId = req.jwtPayload.id;
  const { old_password, new_password } = req.body;

  // Check if old_password or new_password is empty or null
  if (!new_password) {
    return res.status(400).json({ error: 'New password cannot be empty' });
  }

  try {
    const user = await UserDetails.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isMatch = await user.comparePassword(old_password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Old password is incorrect' });
    }
    
    user.user_password = new_password;
    await user.save();

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(406).json({ error: 'Something went wrong' });
  }
};



















exports.reportTo = async (req, res) => {
  try {
      const authenticatedUser = req.jwtPayload;

      const users = await UserDetails.findAll({
          where: { 
              organization_name: authenticatedUser.org 
          },
          attributes: ['user_id', 'user_name', 'user_role'],  
      });

      if (!users.length) {
          return res.status(404).json({ message: 'No users found in the same organization.' });
      }

      const allRoles = await Role.findAll({
          where: {
              organization_name: {
                  [Op.or]: ['Global', authenticatedUser.org]
              }
          },
          attributes: ['role_name', 'role_level'],
      });

      const roles = await Role.findAll({
        where: {
            role_name: users.map(user => user.user_role),
            organization_name: {
                [Op.or]: ['Global', authenticatedUser.org] 
            }
        },
        attributes: ['role_name', 'role_level'],
    });


      const rolesMap = roles.reduce((acc, role) => {
          acc[role.role_name] = role.role_level;
          return acc;
      }, {});

      const groupedUsers = users.reduce((acc, user) => {
          if (!acc[user.user_role]) {
              acc[user.user_role] = [];
          }
          acc[user.user_role].push({
              user_id: user.user_id,
              user_name: user.user_name
          });
          return acc;
      }, {});

      const response = {
          allRoles: allRoles.map(role => ({
              role_name: role.role_name,
              role_level: role.role_level
          })),
          roles: roles.map(role => ({
              role_name: role.role_name,
              role_level: role.role_level
          })),
          users: groupedUsers
      };

      res.json(response);
  } catch (error) {
      console.error('Error fetching users and roles:', error);
      res.status(500).json({ error: 'Something went wrong' });
  }
};















// exports.reportTo = async (req, res) => {
//   try {
//       const authenticatedUser = req.jwtPayload;

//       const users = await UserDetails.findAll({
//           where: { 
//               organization_name: authenticatedUser.org 
//           },
//           attributes: ['user_id', 'user_name', 'user_role'],  
//       });

//       if (!users.length) {
//           return res.status(404).json({ message: 'No users found in the same organization.' });
//       }

//       const usersWithRoles = await Promise.all(users.map(async (user) => {
//           const role = await Role.findOne({
//               where: { role_name: user.user_role },
//               attributes: ['role_level'],
//           });

//           return {
//               user_id: user.user_id,
//               user_name: user.user_name,
//               user_role: user.user_role,
//               role_level: role ? role.role_level : null, 
//           };
//       }));

//       const groupedUsers = usersWithRoles.reduce((acc, user) => {
//           if (!acc[user.user_role]) {
//               acc[user.user_role] = [];
//           }
//           acc[user.user_role].push({
//               user_id: user.user_id,
//               user_name: user.user_name,
//               role_level: user.role_level, 
//           });
//           return acc;
//       }, {});

//       res.json({
//           users: groupedUsers,
//       });
//   } catch (error) {
//       console.error('Error fetching users:', error);
//       res.status(500).json({ error: 'Something went wrong' });
//   }
// };


// exports.selectRole = async (req, res) => {
//     try {
//       const authenticatedUser = req.jwtPayload;
//       const userRole = authenticatedUser.role; 
  
//       const userRoleDetails = await Role.findOne({ where: { role_name: userRole } });
  
//       if (!userRoleDetails) {
//         return res.status(404).json({ message: 'Role not found for the authenticated user' });
//       }
  
//       const userRoleLevel = userRoleDetails.role_level;
  
//       const roles = await Role.findAll();
  
//       const allowedRoles = roles.filter(role => role.role_level >= userRoleLevel);
  
//       if (allowedRoles.length === 0) {
//         return res.status(404).json({ message: 'No accessible roles found based on your level' });
//       }
  
//       const roleNames = allowedRoles.map(role => role.role_name);
  
//       res.json({
//         roles: roleNames,
//       });
//     } catch (error) {
//       console.error('Error selecting role:', error);
//       res.status(500).json({ error: 'Something went wrong while selecting roles' });
//     }
//   };