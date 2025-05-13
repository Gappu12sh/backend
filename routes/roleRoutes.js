const express = require('express');
const roleController = require('../controller/roleController');
const { jwtAuthMiddleware, restrictTo,checkOrganizationAccess } = require('./../jwtAuth');


const router = express.Router();


// POST route to add a new role
router.post('/add',jwtAuthMiddleware, roleController.createRole);

module.exports = router;
