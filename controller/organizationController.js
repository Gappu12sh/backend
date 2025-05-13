const UserDetails = require('../models/UserDetails');
const Organization = require('../models/Organization');
const Role = require('../models/Role');
const { generateToken } = require('./../jwtAuth');







exports.adminSignup = async (req, res) => {
  try {
    const data = { ...req.body, user_role: 'admin' };

    if (!data.user_email || !data.organization_name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const existingUser = await UserDetails.findOne({ where: { user_email: data.user_email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const existingOrganization = await Organization.findOne({ where: { organization_name: data.organization_name } });
    if (existingOrganization) {
      return res.status(400).json({ message: 'Organization name already exists' });
    }

    // const adminRole = await Role.findOne({ where: { role_name: 'admin' } });
    // if (!adminRole) {
    //   return res.status(400).json({ message: 'Admin role not found' });
    // }

    data.role_id = 1;

    const newUser = new UserDetails(data);
    const savedUser = await newUser.save();  

    let organization = await Organization.create({
      organization_name: data.organization_name,
      organization_website: data.organization_website,
      employee_plan_size: data.employee_plan_size,
      subscription_plan: data.subscription_plan,
      purchased_by: savedUser.user_id,  
    });

    savedUser.organization_id = organization.organization_id;
    await savedUser.save(); 

    const payload = {
      email: savedUser.user_email,
      id: savedUser.user_id,
      role: savedUser.user_role,  
      org: data.organization_name,
    };
    const token = generateToken(payload);

    res.status(201).json({
      message: 'New user and organization created successfully!',
      user: savedUser,
      token: token,
      organization: organization,  
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};
