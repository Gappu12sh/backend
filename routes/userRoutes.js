const express = require('express');
const userController = require('../controller/userController');
const { jwtAuthMiddleware, restrictTo,checkOrganizationAccess } = require('./../jwtAuth');

const router = express.Router();

// Routes

// fetch (Report To) dropdown
router.get('/reportTo',jwtAuthMiddleware,restrictTo(["admin"]), userController.reportTo);



// Add user
router.post('/signup', jwtAuthMiddleware,restrictTo(["admin"]), userController.signup);
// Login user
router.post('/login', userController.login);


//get individual user data by id  
router.get('/:id', jwtAuthMiddleware, userController.getUserDetailsById);


router.put('/activeStatus/:id', jwtAuthMiddleware, checkOrganizationAccess,restrictTo(["admin","manager"],'USER-VIEW'), userController.toggleUserStatus);

// fetch all details of individual user
router.get('/', jwtAuthMiddleware, checkOrganizationAccess,restrictTo(["admin","manager"],'USER-VIEW'), userController.getUserById);
// update details of user
router.put('/update/:id', jwtAuthMiddleware, checkOrganizationAccess,restrictTo(["admin","manager"],'USER-UPDATE'), userController.updateUser);
// delete user
// router.delete('/delete/:id', jwtAuthMiddleware, checkOrganizationAccess,restrictTo(["admin"],'USER-DELETE'), userController.deleteUser);
// change password
router.put('/changePassword', jwtAuthMiddleware, userController.changePassword);




router.use((req, res, next) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

module.exports = router;
