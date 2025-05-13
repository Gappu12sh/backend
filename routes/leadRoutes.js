const express = require('express');
const leadController = require('../controller/leadController');
const { jwtAuthMiddleware, restrictTo } = require('./../jwtAuth');

const router = express.Router();



// Create a new lead
router.post('/', jwtAuthMiddleware,restrictTo(["admin","manager"],'LEAD-CREATE'), leadController.createLead);

// upload a new lead
router.post('/uploadBulk', jwtAuthMiddleware,restrictTo(["admin","manager"],'LEAD-CREATE'), leadController.uploadLeadsFromFile);


// Fetch all leads
router.get('/', jwtAuthMiddleware, leadController.getAllLeads);

// Fetch all lead of perticular user (id here is user_id)
router.get('/:id', jwtAuthMiddleware, leadController.getLeadByUserId);

router.get('/detail/:id', jwtAuthMiddleware, leadController.getLeadById);


// Assign a lead to an agent or supervisor
router.put('/assign', jwtAuthMiddleware,restrictTo(["admin","manager"],'LEAD-ASSIGN'), leadController.assignLead);

// Re-assign a lead to another agent
router.put('/reassign', jwtAuthMiddleware,restrictTo(["admin","manager"],'LEAD-ASSIGN'), leadController.reassignLead);

// Update lead status
router.put('/status/:id', jwtAuthMiddleware, leadController.updateLeadStatus);

// Delete a lead
router.delete('/delete/:id', jwtAuthMiddleware,restrictTo(["admin","manager"],'LEAD-DELETE'),leadController.deleteLead);

// Route to find fuzzy duplicates by email
router.get('/findDuplicateLeads',jwtAuthMiddleware, leadController.findDuplicateLeads);







// Create Log
router.post('/addleadlog', jwtAuthMiddleware, leadController.addLeadResponse )

// CALL DETAILS
router.get('/calldata/:id', jwtAuthMiddleware, leadController.getCallLogsByUser );

// follow Up timeing
router.get('/today/followUp/:id', jwtAuthMiddleware, leadController.getMyFollowUpsWithStatus );

// create call log record in lifecycle
router.post('/call-log', jwtAuthMiddleware, leadController.createCallLog);

// lifeCycle of lead
router.get('/leadlife/:id', jwtAuthMiddleware, leadController.getLeadLifecycle);

// Update lead lifecycle record
router.patch('/leadlife/:lifecycle_id', jwtAuthMiddleware, leadController.updateLifecycleRecord);


module.exports = router;
