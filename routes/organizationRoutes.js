const express = require('express');
const organizationController = require('../controller/organizationController');

const router = express.Router();

// Create a new lead
router.post('/adminSignup', organizationController.adminSignup);





module.exports = router;