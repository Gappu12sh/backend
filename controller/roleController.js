const Role = require('../models/Role'); // Import the Role model
// Controller for adding a new role
exports.createRole = async (req, res) => {
    try {
        const { role_name, role_level, role_permission } = req.body;

        if (!role_name || !role_level || !role_permission) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }

        const organization_name = req.jwtPayload.org;

        if (!organization_name) {
            return res.status(400).json({ message: 'Organization name is required in JWT.' });
        }

        const existingGlobalRole = await Role.findOne({
            where: {
                role_name: role_name,
                organization_name: "Global"
            }
        });

        if (existingGlobalRole) {
            return res.status(400).json({ message: 'Cannot create role with this name, it’s a global role.' });
        }

        const existingRole = await Role.findOne({
            where: {
                role_name: role_name,
                organization_name: organization_name
            }
        });

        if (existingRole) {
            return res.status(400).json({ message: 'Role name already exists for the organization.' });
        }

        const newRole = await Role.create({
            role_name,
            role_level,
            role_permission,
            organization_name,
        });

        return res.status(201).json({
            message: 'Role created successfully.',
            role: newRole,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
};

