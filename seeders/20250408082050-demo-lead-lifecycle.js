'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('lead_lifecycle', [
      
      {
        lead_id: 1, 
        lead_status: 'New',
        action_taken: 'New',
        created_at: "2025-03-08 16:04:57.078547+05:30"
      },
      {
        lead_id: 1,
        lead_status: 'Pending',
        action_taken: 'assign',
        action_taken_by: 1,
        created_at: "2025-03-08 17:04:57.078547+05:30"
      },
      {
        lead_id: 1, 
        lead_status: 'FollowUp',
        action_taken: 'call',
        call_type: 'Outgoing',
        call_duration: 420, 
        lead_response_type: 'Positive',
        action_taken_by: 2,
        follow_up_date: '2025-03-12T12:00:00.000Z',
        lead_cycle_remark: 'Lead is interested in seeing the property.',
        created_at: "2025-03-09 17:04:57.078547+05:30"
      },
      {
        lead_id: 1, 
        lead_status: 'SiteVisit',
        action_taken: 'email',
        lead_response_type: 'Neutral',
        action_taken_by: 2,
        lead_cycle_remark: 'Client needs more information.',
        created_at: "2025-03-12 17:04:57.078547+05:30"
      },
      {
        lead_id: 1, 
        lead_status: 'Won',
        action_taken: 'call',
        call_type: 'Incoming',
        call_duration: 180, 
        lead_response_type: 'Positive',
        action_taken_by: 2,
        lead_cycle_remark: 'Lead was initially positive.',
        created_at: "2025-03-12 19:04:57.078547+05:30"
      },

      



      {
        lead_id: 2, 
        lead_status: 'New',
        action_taken: 'New',
        created_at: "2025-03-09 17:04:57.078547+05:30"
      },





      {
        lead_id: 3, 
        lead_status: 'New',
        action_taken: 'New',
        created_at: "2025-03-09 17:02:57.078547+05:30"
      },
      {
        lead_id: 3,
        lead_status: 'Pending',
        action_taken_by: 1,
        action_taken: 'assign',
        created_at: "2025-03-09 17:04:57.078547+05:30"
      },
      {
        lead_id: 3, 
        lead_status: 'FollowUp',
        action_taken: 'message',
        lead_response_type: 'Positive',
        action_taken_by: 2,
        follow_up_date: '2025-03-18T15:00:00.000Z',
        lead_cycle_remark: 'Client is interested.',
        created_at: "2025-03-10 17:04:57.078547+05:30"
      },
      {
        lead_id: 3, 
        lead_status: 'SiteVisit',
        action_taken: 'call',
        call_type: 'Not Connected',
        call_duration: 5,
        lead_response_type: 'Neutral',
        action_taken_by: 2,
        follow_up_date: '2025-03-20T15:00:00.000Z',
        lead_cycle_remark: 'Client needs follow-up next month.',
        created_at: "2025-03-20 17:04:57.078547+05:30"
      },









      {
        lead_id: 6, 
        lead_status: 'New',
        action_taken: 'New',
        created_at: "2025-03-08 15:04:57.078547+05:30"
      },
      {
        lead_id: 6,
        lead_status: 'Pending',
        action_taken_by: 1,
        action_taken: 'assign',
        created_at: "2025-03-08 17:05:57.078547+05:30"
      },
      {
        lead_id: 6,
        lead_status: 'FollowUp',
        action_taken: 'whatsapp',
        lead_response_type: 'Positive',
        action_taken_by: 2,
        follow_up_date: '2025-03-11T15:00:00.000Z',
        lead_cycle_remark: 'Lead is interested.',
        created_at: "2025-03-08 22:04:57.078547+05:30"
      },
      {
        lead_id: 6,
        lead_status: 'FollowUp',
        action_taken: 'whatsapp',
        lead_response_type: 'Neutral',
        action_taken_by: 2,
        follow_up_date: '2025-03-17T15:00:00.000Z',
        lead_cycle_remark: 'Lead is interested.',
        created_at: "2025-03-11 17:04:57.078547+05:30"
      },









      {
        lead_id: 7, 
        lead_status: 'New',
        action_taken: 'New',
        created_at: "2025-03-10 17:04:57.078547+05:30"
      },
      {
        lead_id: 7,
        lead_status: 'Pending',
        action_taken_by: 1,
        action_taken: 'assign',
        created_at: "2025-03-11 19:04:57.078547+05:30"
      },
      {
        lead_id: 7, // Suresh Kumar
        lead_status: 'FollowUp',
        action_taken: 'whatsapp',
        lead_response_type: 'Negative',
        action_taken_by: 1,
        follow_up_date: '2025-03-14T15:00:00.000Z',
        lead_cycle_remark: 'Lead is not interested.',
        created_at: "2025-03-08 17:04:57.078547+05:30"
      },
      {
        lead_id: 7, 
        lead_status: 'SiteVisit',
        action_taken: 'call',
        call_type: 'Not Connected',
        call_duration: 5,
        lead_response_type: 'Neutral',
        action_taken_by: 2,
        follow_up_date: '2025-03-15T15:00:00.000Z',
        lead_cycle_remark: 'Client needs follow-up next month.',
        created_at: "2025-03-14 17:04:57.078547+05:30"
      },
      {
        lead_id: 7, // Suresh Kumar
        lead_status: 'FollowUp',
        action_taken: 'whatsapp',
        lead_response_type: 'Negative',
        action_taken_by: 2,
        follow_up_date: '2025-03-17T15:00:00.000Z',
        lead_cycle_remark: 'Lead is not interested.',
        created_at: "2025-03-15 17:04:57.078547+05:30"
      },
      {
        lead_id: 7, // Deepak Yadav
        lead_status: 'Lost',
        action_taken: 'message',
        lead_response_type: 'Negative',
        action_taken_by: 2,
        lead_cycle_remark: 'Client decided not to pursue further.',
        created_at: "2025-03-17 17:04:57.078547+05:30"
      },







      {
        lead_id: 8, 
        lead_status: 'New',
        action_taken: 'New',
        created_at: "2025-03-17 17:04:57.078547+05:30"
      },
      {
        lead_id: 8,
        lead_status: 'Pending',
        action_taken_by: 1,
        action_taken: 'assign',
        created_at: "2025-03-17 17:14:57.078547+05:30"
      },
      








      {
        lead_id: 9, 
        lead_status: 'New',
        action_taken: 'New',
        created_at: "2025-03-17 17:04:57.078547+05:30"
      },
      {
        lead_id: 9,
        lead_status: 'Pending',
        action_taken_by: 1,
        action_taken: 'assign',
        created_at: "2025-03-17 18:04:57.078547+05:30"
      },
      {
        lead_id: 9, 
        lead_status: 'FollowUp',
        action_taken: 'whatsapp',
        lead_response_type: 'Negative',
        action_taken_by: 2,
        follow_up_date: '2025-03-24T15:00:00.000Z',
        lead_cycle_remark: 'Lead is not interested.',
        created_at: "2025-03-18 17:04:57.078547+05:30"
      },
      {
        lead_id: 9, // Rina Sharma
        lead_status: 'Won',
        action_taken: 'call',
        call_type: 'Incoming',
        call_duration: 600, // 10 minutes
        lead_response_type: 'Positive',
        action_taken_by: 2,
        lead_cycle_remark: 'Lead successfully converted.',
        created_at: "2025-03-24 17:04:57.078547+05:30"
      },






      {
        lead_id: 10, 
        lead_status: 'New',
        action_taken: 'New',
        created_at: "2025-03-17 17:04:57.078547+05:30"
      },



    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('lead_lifecycle', null, {});
  }
};