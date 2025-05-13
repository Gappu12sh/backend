const Lead = require('../models/Lead');
const UserDetails = require('../models/UserDetails');
const LeadLifecycle = require('../models/LeadLifecycle');

const { Op, Sequelize } = require('sequelize');







// // Facebook API details
// const ACCESS_TOKEN = 'YOUR_FACEBOOK_ACCESS_TOKEN'; // Facebook access token
// const AD_ACCOUNT_ID = 'YOUR_AD_ACCOUNT_ID'; // Facebook Ads account ID

// // Function to fetch and save Facebook leads
// const createFacebookLead = async () => {
//   try {
//     const response = await axios.get(`https://graph.facebook.com/v16.0/act_${AD_ACCOUNT_ID}/leads`, {
//       params: {
//         access_token: ACCESS_TOKEN,
//         fields: 'id,ad_id,created_time,field_data',
//       }
//     });

//     // Iterate through the fetched leads
//     const leads = response.data.data;
//     leads.forEach(async (lead) => {
//       const newLeadData = {
//         lead_name: lead.field_data.find(field => field.name === 'full_name')?.values[0] || '',
//         lead_email: lead.field_data.find(field => field.name === 'email')?.values[0] || '',
//         lead_mobile: lead.field_data.find(field => field.name === 'phone')?.values[0] || '',
//         lead_status: 'New', // Default status for new leads
//         organization_name: 'Facebook Ads', // This can be dynamic or passed based on your needs
//         lead_source: 'Facebook Ads',
//         lead_campaign_type: 'Lead Generation',
//         lead_type: 'Potential',
//         lead_budget: 0, 
//         lead_remark: '',
//         lead_created_by: 1, // Adjust based on your system/user info
//         lead_date: new Date(lead.created_time * 1000), // Convert to Date
//       };

//       // Check for existing lead based on email or mobile
//       const existingLead = await Lead.findOne({
//         where: {
//           [Op.or]: [
//             { lead_email: newLeadData.lead_email },
//             { lead_mobile: newLeadData.lead_mobile }
//           ],
//           organization_name: 'Facebook Ads'
//         }
//       });

//       if (existingLead) {
//         newLeadData.lead_status = 'Duplicate'; // Mark as duplicate if found
//       }

//       // Save the new or duplicate lead to the database
//       await Lead.create(newLeadData);

//       console.log('Facebook lead has been successfully added to the database.');
//     });

//   } catch (error) {
//     console.error('Error fetching leads from Facebook Ads:', error);
//   }
// };










// // Create a new lead
// exports.createLead = async (req, res) => {
//   try {
//     const newLeadData = {...req.body, 
//       organization_name: req.jwtPayload.org, 
//       lead_created_by: req.jwtPayload.id,
//       lead_source : "local"
//     };

//     let existingLead;
//     if (newLeadData.lead_email || newLeadData.lead_mobile) {
//       existingLead = await Lead.findOne({
//         where: {
//           [Op.or]: [
//             { lead_email: newLeadData.lead_email },
//             { lead_mobile: newLeadData.lead_mobile }
//           ],
//           organization_name: req.jwtPayload.org
//         }
//       });
//     }

//     if (existingLead) {
//       newLeadData.lead_status = "Duplicate";
//     }

//     const newLead = await Lead.create(newLeadData);
//     res.status(201).json({
//       message: existingLead ? 'Lead is a duplicate , Saved successfully! ' : 'New lead created successfully!',
//       lead: newLead
//     });
    
//   } catch (error) {
//     console.error('Error creating lead:', error);
//     res.status(400).json({ message: 'Error creating lead', error: error.message });
//   }
// };


exports.createLead = async (req, res) => {
  try {

    // Validate required fields with specific error messages
    const missingFields = [];
    if (!req.body.lead_name) missingFields.push('lead_name');
    if (!req.body.lead_mobile) missingFields.push('lead_mobile');

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `${missingFields.join(' and ')} ${missingFields.length > 1 ? 'are' : 'is'} required`,
      });
    }

    const newLeadData = {
      ...req.body,
      lead_email: req.body.lead_email || null,
      lead_mobile: req.body.lead_mobile || null,
      organization_name: req.jwtPayload.org,
      lead_created_by: req.jwtPayload.id,
      lead_source: "local"
    };

    let existingLead;
    let isDuplicate = false;

    // Check for existing lead
    if (newLeadData.lead_email || newLeadData.lead_mobile) {
      existingLead = await Lead.findOne({
        where: {
          [Op.or]: [
            { lead_email: newLeadData.lead_email },
            { lead_mobile: newLeadData.lead_mobile }
          ],
          organization_name: req.jwtPayload.org
        }
      });

      if (existingLead) {
        isDuplicate = true;
        newLeadData.lead_status = "Duplicate";
      }
    }

    // Create the lead
    const newLead = await Lead.create(newLeadData);

    // Only create lifecycle entry for NEW leads (not duplicates)
    if (!isDuplicate) {
      await LeadLifecycle.create({
        lead_id: newLead.lead_id,
        lead_status: newLead.lead_status || 'New',
        action_taken: 'New',
        action_taken_by: req.jwtPayload.id, // Added creator info
        created_at: new Date() // Explicit timestamp
      });
    }

    res.status(201).json({
      message: isDuplicate ? 
        'Duplicate lead identified and recorded' : 
        'New lead created successfully!',
      lead: newLead,
      is_duplicate: isDuplicate
    });

  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(400).json({ 
      message: 'Error creating lead', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};







// // Upload new leads
// exports.uploadLeadsFromFile = async (req, res) => {
//   try {
//     const leadsData = req.body;
//     const organizationName = req.jwtPayload.org;
//     const leadCreatedByUser = req.jwtPayload.id;

//     let savedLeads = [];
//     let duplicateLeads = [];
//     let failedLeads = [];

//     for (let leadData of leadsData) {
//       // Check if lead name is missing
//       if (!leadData.lead_name) {
//         failedLeads.push(leadData);
//         continue;
//       }

//       const newLeadData = { ...leadData, organization_name: organizationName, lead_created_by: leadCreatedByUser };

//       let existingLead = null;
//       if ((newLeadData.lead_email || newLeadData.lead_mobile) && (newLeadData.lead_email !== undefined && newLeadData.lead_mobile !== undefined)) {
//         existingLead = await Lead.findOne({
//           where: {
//             [Op.or]: [
//               { lead_email: newLeadData.lead_email },
//               { lead_mobile: newLeadData.lead_mobile }
//             ],
//             organization_name: req.jwtPayload.org,
//           },
//         });
//       }

//       if (existingLead) {
//         newLeadData.lead_status = 'Duplicate';
//         const createdDuplicateLead = await Lead.create(newLeadData);
//         duplicateLeads.push(createdDuplicateLead);  
//       } else {
//         const newLead = await Lead.create(newLeadData);
//         savedLeads.push(newLead);
//       }
//     }

//     let message = '';
//     if (savedLeads.length > 0) {
//       message += `${savedLeads.length} new lead${savedLeads.length > 1 ? 's' : ''} created`;
//     }
//     if (duplicateLeads.length > 0) {
//       if (message) message += ', ';
//       message += `${duplicateLeads.length} duplicate lead${duplicateLeads.length > 1 ? 's' : ''} uploaded`;
//     }
//     if (failedLeads.length > 0) {
//       if (message) message += ', ';
//       message += `${failedLeads.length} lead${failedLeads.length > 1 ? 's' : ''} had no name and were not uploaded`;
//     }

//     res.status(201).json({
//       message: message,
//       savedLeads,
//       duplicateLeads,
//       failedLeads,
//       summary: {
//         newLeadsCount: savedLeads.length,
//         duplicateLeadsCount: duplicateLeads.length,
//         failedLeadsCount: failedLeads.length
//       }
//     });
//   } catch (error) {
//     console.error('Error uploading leads:', error);
//     res.status(400).json({ message: 'Error processing leads', error: error.message });
//   }
// };

exports.uploadLeadsFromFile = async (req, res) => {
  try {
    const leadsData = req.body;
    const organizationName = req.jwtPayload.org;
    const leadCreatedByUser = req.jwtPayload.id;

    let savedLeads = [];
    let duplicateLeads = [];
    let failedLeads = [];

    for (let leadData of leadsData) {
      try {
        // Check if lead name is missing
        if (!leadData.lead_name) {
          failedLeads.push({...leadData, error: 'Missing lead name'});
          continue;
        }

        const newLeadData = { 
          ...leadData, 
          organization_name: organizationName, 
          lead_created_by: leadCreatedByUser,
          lead_source: leadData.lead_source || "local"
        };

        let existingLead = null;
        if (newLeadData.lead_email || newLeadData.lead_mobile) {
          existingLead = await Lead.findOne({
            where: {
              [Op.or]: [
                { lead_email: newLeadData.lead_email },
                { lead_mobile: newLeadData.lead_mobile }
              ],
              organization_name: organizationName,
            },
          });
        }

        if (existingLead) {
          newLeadData.lead_status = 'Duplicate';
          const createdDuplicateLead = await Lead.create(newLeadData);
          
          duplicateLeads.push(createdDuplicateLead);
        } else {
          const newLead = await Lead.create(newLeadData);
          
          // Create lifecycle entry for new lead
          await LeadLifecycle.create({
            lead_id: newLead.lead_id,
            lead_status: newLead.lead_status || 'New',
            action_taken: 'New',
            action_taken_by: leadCreatedByUser,
          });
          
          savedLeads.push(newLead);
        }
      } catch (leadError) {
        failedLeads.push({
          ...leadData,
          error: leadError.message
        });
        console.error(`Error processing lead ${leadData.lead_name || 'unnamed'}:`, leadError);
      }
    }

    let message = '';
    if (savedLeads.length > 0) {
      message += `${savedLeads.length} new lead${savedLeads.length > 1 ? 's' : ''} created`;
    }
    if (duplicateLeads.length > 0) {
      if (message) message += ', ';
      message += `${duplicateLeads.length} duplicate lead${duplicateLeads.length > 1 ? 's' : ''} uploaded`;
    }
    if (failedLeads.length > 0) {
      if (message) message += ', ';
      message += `${failedLeads.length} lead${failedLeads.length > 1 ? 's' : ''} failed to upload`;
    }

    res.status(201).json({
      message: message,
      savedLeads: savedLeads.map(lead => lead.lead_id),
      duplicateLeads: duplicateLeads.map(lead => lead.lead_id),
      failedLeads,
      summary: {
        newLeadsCount: savedLeads.length,
        duplicateLeadsCount: duplicateLeads.length,
        failedLeadsCount: failedLeads.length
      }
    });
  } catch (error) {
    console.error('Error uploading leads:', error);
    res.status(400).json({ 
      message: 'Error processing leads', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

































// exports.getAllLeads = async (req, res) => {
//   try {
//     const { org, id, role } = req.jwtPayload;

//     const groupLeadsByStatus = (leads) => {
//       return leads.reduce((acc, lead) => {
//         const status = lead.lead_status || 'Unknown'; 
//         if (!acc[status]) {
//           acc[status] = { count: 0, leads: [] };
//         }
//         acc[status].count += 1;
//         acc[status].leads.push(lead);
//         return acc;
//       }, {});
//     };

//     const calculateWeekPercentageDifference = (thisWeekLeads, lastWeekLeads) => {
//       const percentageDifference = {};
//       const allStatuses = new Set([...Object.keys(thisWeekLeads), ...Object.keys(lastWeekLeads)]);
//       allStatuses.forEach(status => {
//         const thisWeekCount = thisWeekLeads[status]?.count || 0;
//         const lastWeekCount = lastWeekLeads[status]?.count || 0;
//         const difference = thisWeekCount - lastWeekCount;
//         const percentageDiff = lastWeekCount === 0 ? (thisWeekCount > 0 ? 100 : 0) : (difference / lastWeekCount) * 100;
//         percentageDifference[status] = difference === 0 && lastWeekCount === 0 ? 0 : percentageDiff.toFixed(2); 
//       });
//       return percentageDifference;
//     };

//     const getLeadsForUserAndSubordinates = async (userId, org) => {
//       let allLeads = [];
//       const leads = await Lead.findAll({ where: { organization_name: org, lead_assign_to: userId } });
//       allLeads.push(...leads);
      
//       const subordinates = await UserDetails.findAll({ where: { user_report_to: userId } });
//       for (const subordinate of subordinates) {
//         const subordinateLeads = await Lead.findAll({ where: { organization_name: org, lead_assign_to: subordinate.user_id } });
//         allLeads.push(...subordinateLeads);
//       }
      
//       return allLeads;
//     };

//     // Fetching user name from the User model based on lead_assign_to
//     const getUserNameById = async (userId) => {
//       const user = await UserDetails.findOne({ where: { user_id: userId } });
//       return user ? user.user_name : 'Unknown';
//     };

//     if (role === 'admin') {
//       const leads = await Lead.findAll({ where: { organization_name: org } });
//       const groupedLeads = groupLeadsByStatus(leads);

//       const today = new Date();
//       const thisWeekStart = new Date(today);
//       thisWeekStart.setDate(today.getDate() - 7); 
//       const lastWeekStart = new Date(thisWeekStart);
//       lastWeekStart.setDate(thisWeekStart.getDate() - 7);

//       const thisWeekLeads = await Lead.findAll({
//         where: {
//           organization_name: org,
//           lead_date: { [Op.gte]: thisWeekStart, [Op.lt]: today }
//         }
//       });
//       const lastWeekLeads = await Lead.findAll({
//         where: {
//           organization_name: org,
//           lead_date: { [Op.gte]: lastWeekStart, [Op.lt]: thisWeekStart }
//         }
//       });

//       const percentageDifference = calculateWeekPercentageDifference(groupLeadsByStatus(thisWeekLeads), groupLeadsByStatus(lastWeekLeads));
//       const totalLeadDifference = lastWeekLeads.length === 0 ? (thisWeekLeads.length > 0 ? 100 : 0) : ((thisWeekLeads.length - lastWeekLeads.length) / lastWeekLeads.length) * 100;

//       const newLeads = await Lead.findAll({
//         where: {
//           organization_name: org,
//           lead_status: 'New'
//         }
//       });
      
//       // Adding user_name to the leads based on lead_assign_to
//       const leadsWithUserNames = await Promise.all(
//         leads.map(async (lead) => {
//           const userName = await getUserNameById(lead.lead_assign_to);
//           return { ...lead.toJSON(), user_name: userName };
//         })
//       );

//       res.json({
//         totalLeadsCount: leads.length,
//         totalLeadDifference: totalLeadDifference.toFixed(2),
//         ...groupLeadsByStatus(leadsWithUserNames),
//         percentageDifference,
//       });

//     } else {
//       const leads = await getLeadsForUserAndSubordinates(id, org);
//       const groupedLeads = groupLeadsByStatus(leads);
    
//       const today = new Date();
//       const thisWeekStart = new Date(today);
//       thisWeekStart.setDate(today.getDate() - 7); 
//       const lastWeekStart = new Date(thisWeekStart);
//       lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    
//       const assignedUserIds = Object.values(groupedLeads)
//         .flatMap(status => status.leads.map(lead => lead.lead_assign_to));
    
//       const thisWeekLeads = await Lead.findAll({
//         where: {
//           organization_name: org,
//           lead_date: { [Op.gte]: thisWeekStart, [Op.lt]: today },
//           lead_assign_to: { [Op.in]: [id, ...assignedUserIds] }
//         }
//       });
//       const lastWeekLeads = await Lead.findAll({
//         where: {
//           organization_name: org,
//           lead_date: { [Op.gte]: lastWeekStart, [Op.lt]: thisWeekStart },
//           lead_assign_to: { [Op.in]: [id, ...assignedUserIds] }
//         }
//       });
    
//       const percentageDifference = calculateWeekPercentageDifference(groupLeadsByStatus(thisWeekLeads), groupLeadsByStatus(lastWeekLeads));
//       const totalLeadDifference = lastWeekLeads.length === 0 ? (thisWeekLeads.length > 0 ? 100 : 0) : ((thisWeekLeads.length - lastWeekLeads.length) / lastWeekLeads.length) * 100;
//       let newLeadsCount = 0;
//       if (role === 'manager') {
//         const newLeads = await Lead.findAll({
//           where: {
//             organization_name: org,
//             lead_status: 'New'
//           }
//         });
//         const newGroupedLeads = groupLeadsByStatus(newLeads);
//         groupedLeads['New'] = newGroupedLeads['New'] || { count: 0, leads: [] };
//         newLeadsCount = newLeads.length;
    
//         const thisWeekNewLeads = newLeads.filter(lead => lead.lead_date >= thisWeekStart && lead.lead_date < today);
//         const lastWeekNewLeads = newLeads.filter(lead => lead.lead_date >= lastWeekStart && lead.lead_date < thisWeekStart);
    
//         const newPercentageDifference = calculateWeekPercentageDifference(groupLeadsByStatus(thisWeekNewLeads), groupLeadsByStatus(lastWeekNewLeads));
//         percentageDifference.New = newPercentageDifference.New || 0;
//       }
      
//       const totalLeadsCount = leads.length + newLeadsCount;

//       // Adding user_name to the leads based on lead_assign_to
//       const leadsWithUserNames = await Promise.all(
//         leads.map(async (lead) => {
//           const userName = await getUserNameById(lead.lead_assign_to);
//           return { ...lead.toJSON(), user_name: userName };
//         })
//       );
//       res.json({
//         totalLeadsCount: totalLeadsCount,
//         totalLeadDifference: totalLeadDifference.toFixed(2),
//         ...groupLeadsByStatus(leadsWithUserNames),
//         percentageDifference
//       });
//     }
    
    
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(400).json({ error: 'Something went wrong' });
//   }
// };





// exports.getAllLeads = async (req, res) => {
//   try {
//     const { org, id, role } = req.jwtPayload;

//     const groupLeadsByStatus = (leads) => {
//       return leads.reduce((acc, lead) => {
//         const status = lead.lead_status || 'Unknown'; 
//         if (!acc[status]) {
//           acc[status] = { count: 0, leads: [] };
//         }
//         acc[status].count += 1;
//         acc[status].leads.push(lead);
//         return acc;
//       }, {});
//     };

//     const calculateWeekPercentageDifference = (thisWeekLeads, lastWeekLeads) => {
//       const percentageDifference = {};
//       const allStatuses = new Set([...Object.keys(thisWeekLeads), ...Object.keys(lastWeekLeads)]);
//       allStatuses.forEach(status => {
//         const thisWeekCount = thisWeekLeads[status]?.count || 0;
//         const lastWeekCount = lastWeekLeads[status]?.count || 0;
//         const difference = thisWeekCount - lastWeekCount;
//         const percentageDiff = lastWeekCount === 0 ? (thisWeekCount > 0 ? 100 : 0) : (difference / lastWeekCount) * 100;
//         percentageDifference[status] = difference === 0 && lastWeekCount === 0 ? 0 : percentageDiff.toFixed(2); 
//       });
//       return percentageDifference;
//     };

//     const getLeadsForUserAndSubordinates = async (userId, org) => {
//       let allLeads = [];
//       const leads = await Lead.findAll({ where: { organization_name: org, lead_assign_to: userId } });
//       allLeads.push(...leads);
      
//       const subordinates = await UserDetails.findAll({ where: { user_report_to: userId } });
//       for (const subordinate of subordinates) {
//         const subordinateLeads = await Lead.findAll({ where: { organization_name: org, lead_assign_to: subordinate.user_id } });
//         allLeads.push(...subordinateLeads);
//       }
      
//       return allLeads;
//     };

//     // Fetching user name from the User model based on lead_assign_to
//     const getUserNameById = async (userId) => {
//       const user = await UserDetails.findOne({ where: { user_id: userId } });
//       return user ? user.user_name : 'Unknown';
//     };

//     if (role === 'admin') {
//       const leads = await Lead.findAll({ where: { organization_name: org } });

//       // Group the existing leads
//       const groupedLeads = groupLeadsByStatus(leads);

//       const today = new Date();
//       const thisWeekStart = new Date(today);
//       thisWeekStart.setDate(today.getDate() - 7); 
//       const lastWeekStart = new Date(thisWeekStart);
//       lastWeekStart.setDate(thisWeekStart.getDate() - 7);

//       const thisWeekLeads = await Lead.findAll({
//         where: {
//           organization_name: org,
//           lead_date: { [Op.gte]: thisWeekStart, [Op.lt]: today }
//         }
//       });
//       const lastWeekLeads = await Lead.findAll({
//         where: {
//           organization_name: org,
//           lead_date: { [Op.gte]: lastWeekStart, [Op.lt]: thisWeekStart }
//         }
//       });

//       const percentageDifference = calculateWeekPercentageDifference(groupLeadsByStatus(thisWeekLeads), groupLeadsByStatus(lastWeekLeads));
//       const totalLeadDifference = lastWeekLeads.length === 0 ? (thisWeekLeads.length > 0 ? 100 : 0) : ((thisWeekLeads.length - lastWeekLeads.length) / lastWeekLeads.length) * 100;


//       // Adding user_name to the leads based on lead_assign_to
//       const leadsWithUserNames = await Promise.all(
//         leads.map(async (lead) => {
//           const userName = await getUserNameById(lead.lead_assign_to);
//           return { ...lead.toJSON(), assigned_user_name: userName };
//         })
//       );

//       // Ensure the 'New' status is added even if no new leads exist
//       if (!groupedLeads['New']) {
//         groupedLeads['New'] = { count: 0, leads: [] };
//       }

//       res.json({
//         totalLeadsCount: leadsWithUserNames.length,
//         totalLeadDifference: totalLeadDifference.toFixed(2),
//         percentageDifference,
//         ...groupLeadsByStatus(leadsWithUserNames), // This ensures that both old and new leads are grouped together
//       });

//     } else {
//       // Similar process for non-admin roles...
//       const leads = await getLeadsForUserAndSubordinates(id, org);
//       const groupedLeads = groupLeadsByStatus(leads);
    
//       const today = new Date();
//       const thisWeekStart = new Date(today);
//       thisWeekStart.setDate(today.getDate() - 7);
//       const lastWeekStart = new Date(thisWeekStart);
//       lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    
//       const assignedUserIds = Object.values(groupedLeads)
//         .flatMap(status => status.leads.map(lead => lead.lead_assign_to));
    
//       const thisWeekLeads = await Lead.findAll({
//         where: {
//           organization_name: org,
//           lead_date: { [Op.gte]: thisWeekStart, [Op.lt]: today },
//           lead_assign_to: { [Op.in]: [id, ...assignedUserIds] }
//         }
//       });
//       const lastWeekLeads = await Lead.findAll({
//         where: {
//           organization_name: org,
//           lead_date: { [Op.gte]: lastWeekStart, [Op.lt]: thisWeekStart },
//           lead_assign_to: { [Op.in]: [id, ...assignedUserIds] }
//         }
//       });
    
//       const percentageDifference = calculateWeekPercentageDifference(groupLeadsByStatus(thisWeekLeads), groupLeadsByStatus(lastWeekLeads));
//       const totalLeadDifference = lastWeekLeads.length === 0 ? (thisWeekLeads.length > 0 ? 100 : 0) : ((thisWeekLeads.length - lastWeekLeads.length) / lastWeekLeads.length) * 100;
    
//       let newLeadsCount = 0;
//       let newLeadsWithUserNames = []; // Initialize newLeadsWithUserNames
    
//       // Only fetch New leads if the role is manager
//       if (role === 'manager') {
//         // Fetch New Leads and Group them
//         const newLeads = await Lead.findAll({
//           where: {
//             organization_name: org,
//             lead_status: 'New'
//           }
//         });
    
//         newLeadsWithUserNames = await Promise.all(
//           newLeads.map(async (lead) => {
//             const userName = await getUserNameById(lead.lead_assign_to);
//             return { ...lead.toJSON(), user_name: userName };
//           })
//         );
    
//         const groupedNewLeads = groupLeadsByStatus(newLeadsWithUserNames);
    
//         // Add to existing grouped leads if New leads exist
//         if (groupedNewLeads['New']) {
//           groupedLeads['New'] = groupedNewLeads['New'];
//         }
    
//         newLeadsCount = newLeads.length;
    
//         // Calculate percentage for New Leads
//         const thisWeekNewLeads = newLeads.filter(lead => lead.lead_date >= thisWeekStart && lead.lead_date < today);
//         const lastWeekNewLeads = newLeads.filter(lead => lead.lead_date >= lastWeekStart && lead.lead_date < thisWeekStart);
    
//         const newPercentageDifference = calculateWeekPercentageDifference(groupLeadsByStatus(thisWeekNewLeads), groupLeadsByStatus(lastWeekNewLeads));
//         percentageDifference.New = newPercentageDifference.New || 0;
//       }
    
//       const totalLeadsCount = leads.length + newLeadsCount;
    
//       // Adding user_name to the existing leads based on lead_assign_to
//       const leadsWithUserNames = await Promise.all(
//         leads.map(async (lead) => {
//           const userName = await getUserNameById(lead.lead_assign_to);
//           return { ...lead.toJSON(), assigned_user_name: userName };
//         })
//       );
    
//       // Combine the existing leads and the new leads (only if role is 'manager')
//       const combinedLeads = role === 'manager' ? [...leadsWithUserNames, ...newLeadsWithUserNames] : leadsWithUserNames;
    
//       // Return the response
//       res.json({
//         totalLeadsCount: totalLeadsCount,
//         totalLeadDifference: totalLeadDifference.toFixed(2),
//         percentageDifference,
//         ...groupLeadsByStatus(combinedLeads), // Combine the grouped leads (existing + new if manager)
//       });
      
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(400).json({ error: 'Something went wrong' });
//   }
// };







// exports.getAllLeads = async (req, res) => {
//   try {
//     const { org, id, role } = req.jwtPayload;

//     const groupLeadsByStatus = (leads) => {
//       return leads.reduce((acc, lead) => {
//         const status = lead.lead_status || 'Unknown'; 
//         if (!acc[status]) {
//           acc[status] = { count: 0, leads: [] };
//         }
//         acc[status].count += 1;
//         acc[status].leads.push(lead);
//         return acc;
//       }, {});
//     };

//     const calculateWeekPercentageDifference = (thisWeekLeads, lastWeekLeads) => {
//       const percentageDifference = {};
//       const allStatuses = new Set([...Object.keys(thisWeekLeads), ...Object.keys(lastWeekLeads)]);
//       allStatuses.forEach(status => {
//         const thisWeekCount = thisWeekLeads[status]?.count || 0;
//         const lastWeekCount = lastWeekLeads[status]?.count || 0;
//         const difference = thisWeekCount - lastWeekCount;
//         const percentageDiff = lastWeekCount === 0 ? (thisWeekCount > 0 ? 100 : 0) : (difference / lastWeekCount) * 100;
//         percentageDifference[status] = difference === 0 && lastWeekCount === 0 ? 0 : percentageDiff.toFixed(2); 
//       });
//       return percentageDifference;
//     };

//     const getLeadsForUserAndSubordinates = async (userId, org) => {
//       let allLeads = [];
//       const leads = await Lead.findAll({ where: { organization_name: org, lead_assign_to: userId } });
//       allLeads.push(...leads);
      
//       const subordinates = await UserDetails.findAll({ where: { user_report_to: userId } });
//       for (const subordinate of subordinates) {
//         const subordinateLeads = await Lead.findAll({ where: { organization_name: org, lead_assign_to: subordinate.user_id } });
//         allLeads.push(...subordinateLeads);
//       }
      
//       return allLeads;
//     };

//     // Fetching user name from the User model based on lead_assign_to
//     const getUserNameById = async (userId) => {
//       const user = await UserDetails.findOne({ where: { user_id: userId } });
//       return user ? user.user_name : 'Unknown';
//     };

//     if (role === 'admin') {
//       const leads = await Lead.findAll({ where: { organization_name: org } });

//       // Group the existing leads
//       const groupedLeads = groupLeadsByStatus(leads);

//       const today = new Date();
//       const thisWeekStart = new Date(today);
//       thisWeekStart.setDate(today.getDate() - 7); 
//       const lastWeekStart = new Date(thisWeekStart);
//       lastWeekStart.setDate(thisWeekStart.getDate() - 7);

//       const thisWeekLeads = await Lead.findAll({
//         where: {
//           organization_name: org,
//           lead_date: { [Op.gte]: thisWeekStart, [Op.lt]: today }
//         }
//       });
//       const lastWeekLeads = await Lead.findAll({
//         where: {
//           organization_name: org,
//           lead_date: { [Op.gte]: lastWeekStart, [Op.lt]: thisWeekStart }
//         }
//       });

//       const percentageDifference = calculateWeekPercentageDifference(groupLeadsByStatus(thisWeekLeads), groupLeadsByStatus(lastWeekLeads));
//       const totalLeadDifference = lastWeekLeads.length === 0 ? (thisWeekLeads.length > 0 ? 100 : 0) : ((thisWeekLeads.length - lastWeekLeads.length) / lastWeekLeads.length) * 100;

//       // Adding user_name and createdBy_user_name to the leads based on lead_assign_to and lead_created_by
//       const leadsWithUserNamesAndCreatedBy = await Promise.all(
//         leads.map(async (lead) => {
//           const assignedUserName = await getUserNameById(lead.lead_assign_to);
//           const createdByUserName = await getUserNameById(lead.lead_created_by);
//           return { 
//             ...lead.toJSON(), 
//             assigned_user_name: assignedUserName,
//             createdBy_user_name: createdByUserName
//           };
//         })
//       );

//       // Ensure the 'New' status is added even if no new leads exist
//       if (!groupedLeads['New']) {
//         groupedLeads['New'] = { count: 0, leads: [] };
//       }

//       res.json({
//         totalLeadsCount: leadsWithUserNamesAndCreatedBy.length,
//         totalLeadDifference: totalLeadDifference.toFixed(2),
//         percentageDifference,
//         ...groupLeadsByStatus(leadsWithUserNamesAndCreatedBy), // This ensures that both old and new leads are grouped together
//       });

//     } else {
//       // Similar process for non-admin roles...
//       const leads = await getLeadsForUserAndSubordinates(id, org);
//       const groupedLeads = groupLeadsByStatus(leads);
    
//       const today = new Date();
//       const thisWeekStart = new Date(today);
//       thisWeekStart.setDate(today.getDate() - 7);
//       const lastWeekStart = new Date(thisWeekStart);
//       lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    
//       const assignedUserIds = Object.values(groupedLeads)
//         .flatMap(status => status.leads.map(lead => lead.lead_assign_to));
    
//       const thisWeekLeads = await Lead.findAll({
//         where: {
//           organization_name: org,
//           lead_date: { [Op.gte]: thisWeekStart, [Op.lt]: today },
//           lead_assign_to: { [Op.in]: [id, ...assignedUserIds] }
//         }
//       });
//       const lastWeekLeads = await Lead.findAll({
//         where: {
//           organization_name: org,
//           lead_date: { [Op.gte]: lastWeekStart, [Op.lt]: thisWeekStart },
//           lead_assign_to: { [Op.in]: [id, ...assignedUserIds] }
//         }
//       });
    
//       const percentageDifference = calculateWeekPercentageDifference(groupLeadsByStatus(thisWeekLeads), groupLeadsByStatus(lastWeekLeads));
//       const totalLeadDifference = lastWeekLeads.length === 0 ? (thisWeekLeads.length > 0 ? 100 : 0) : ((thisWeekLeads.length - lastWeekLeads.length) / lastWeekLeads.length) * 100;
    
//       let newLeadsCount = 0;
//       let newLeadsWithUserNames = []; // Initialize newLeadsWithUserNames
    
//       // Only fetch New leads if the role is manager
//       if (role === 'manager') {
//         // Fetch New Leads and Group them
//         const newLeads = await Lead.findAll({
//           where: {
//             organization_name: org,
//             lead_status: 'New'
//           }
//         });
    
//         newLeadsWithUserNames = await Promise.all(
//           newLeads.map(async (lead) => {
//             const userName = await getUserNameById(lead.lead_assign_to);
//             const createdByUserName = await getUserNameById(lead.lead_created_by);
//             return { 
//               ...lead.toJSON(), 
//               user_name: userName, 
//               createdBy_user_name: createdByUserName 
//             };
//           })
//         );
    
//         const groupedNewLeads = groupLeadsByStatus(newLeadsWithUserNames);
    
//         // Add to existing grouped leads if New leads exist
//         if (groupedNewLeads['New']) {
//           groupedLeads['New'] = groupedNewLeads['New'];
//         }
    
//         newLeadsCount = newLeads.length;
    
//         // Calculate percentage for New Leads
//         const thisWeekNewLeads = newLeads.filter(lead => lead.lead_date >= thisWeekStart && lead.lead_date < today);
//         const lastWeekNewLeads = newLeads.filter(lead => lead.lead_date >= lastWeekStart && lead.lead_date < thisWeekStart);
    
//         const newPercentageDifference = calculateWeekPercentageDifference(groupLeadsByStatus(thisWeekNewLeads), groupLeadsByStatus(lastWeekNewLeads));
//         percentageDifference.New = newPercentageDifference.New || 0;
//       }
    
//       const totalLeadsCount = leads.length + newLeadsCount;
    
//       // Adding user_name and createdBy_user_name to the existing leads based on lead_assign_to and lead_created_by
//       const leadsWithUserNamesAndCreatedBy = await Promise.all(
//         leads.map(async (lead) => {
//           const assignedUserName = await getUserNameById(lead.lead_assign_to);
//           const createdByUserName = await getUserNameById(lead.lead_created_by);
//           return { 
//             ...lead.toJSON(), 
//             assigned_user_name: assignedUserName, 
//             createdBy_user_name: createdByUserName 
//           };
//         })
//       );
    
//       // Combine the existing leads and the new leads (only if role is 'manager')
//       const combinedLeads = role === 'manager' ? [...leadsWithUserNamesAndCreatedBy, ...newLeadsWithUserNames] : leadsWithUserNamesAndCreatedBy;
    
//       // Return the response
//       res.json({
//         totalLeadsCount: totalLeadsCount,
//         totalLeadDifference: totalLeadDifference.toFixed(2),
//         percentageDifference,
//         ...groupLeadsByStatus(combinedLeads), // Combine the grouped leads (existing + new if manager)
//       });
      
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(400).json({ error: 'Something went wrong' });
//   }
// };






exports.getAllLeads = async (req, res) => {
  try {
    const { org, id, role } = req.jwtPayload;

    // Define all possible lead statuses to ensure consistent reporting
    const ALL_POSSIBLE_STATUSES = ['New', 'FollowUp', 'Pending', 'Won', 'SiteVisit', 'Duplicate','Lost','Junk'];

    const groupLeadsByStatus = (leads) => {
      return leads.reduce((acc, lead) => {
        const status = lead.lead_status || 'Unknown'; 
        if (!acc[status]) {
          acc[status] = { count: 0, leads: [] };
        }
        acc[status].count += 1;
        acc[status].leads.push(lead);
        return acc;
      }, {});
    };

    const calculateWeekPercentageDifference = (thisWeekLeads, lastWeekLeads) => {
      const percentageDifference = {};
      
      // Use ALL_POSSIBLE_STATUSES instead of dynamically determined statuses
      ALL_POSSIBLE_STATUSES.forEach(status => {
        const thisWeekCount = thisWeekLeads[status]?.count || 0;
        const lastWeekCount = lastWeekLeads[status]?.count || 0;
        const difference = thisWeekCount - lastWeekCount;
        
        let percentageDiff;
        if (lastWeekCount === 0) {
          percentageDiff = thisWeekCount > 0 ? 100 : 0;
        } else {
          percentageDiff = (difference / lastWeekCount) * 100;
        }
        
        percentageDifference[status] = difference === 0 && lastWeekCount === 0 
          ? "0.00"
          : percentageDiff.toFixed(2);
      });
      
      return percentageDifference;
    };

    const getLeadsForUserAndSubordinates = async (userId, org) => {
      let allLeads = [];
      const leads = await Lead.findAll({ where: { organization_name: org, lead_assign_to: userId } });
      allLeads.push(...leads);
      
      const subordinates = await UserDetails.findAll({ where: { user_report_to: userId } });
      for (const subordinate of subordinates) {
        const subordinateLeads = await Lead.findAll({ 
          where: { organization_name: org, lead_assign_to: subordinate.user_id } 
        });
        allLeads.push(...subordinateLeads);
      }
      
      return allLeads;
    };

    const getUserNameById = async (userId) => {
      const user = await UserDetails.findOne({ where: { user_id: userId } });
      return user ? user.user_name : 'Unknown';
    };

    if (role === 'admin') {
      const leads = await Lead.findAll({ where: { organization_name: org } });
      const groupedLeads = groupLeadsByStatus(leads);

      const today = new Date();
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - 7); 
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(thisWeekStart.getDate() - 7);

      const thisWeekLeads = await Lead.findAll({
        where: {
          organization_name: org,
          lead_date: { [Op.gte]: thisWeekStart, [Op.lt]: today }
        }
      });
      const lastWeekLeads = await Lead.findAll({
        where: {
          organization_name: org,
          lead_date: { [Op.gte]: lastWeekStart, [Op.lt]: thisWeekStart }
        }
      });

      const percentageDifference = calculateWeekPercentageDifference(
        groupLeadsByStatus(thisWeekLeads), 
        groupLeadsByStatus(lastWeekLeads)
      );
      
      const totalLeadDifference = lastWeekLeads.length === 0 
        ? (thisWeekLeads.length > 0 ? 100 : 0) 
        : ((thisWeekLeads.length - lastWeekLeads.length) / lastWeekLeads.length) * 100;

      const leadsWithUserNamesAndCreatedBy = await Promise.all(
        leads.map(async (lead) => {
          const assignedUserName = await getUserNameById(lead.lead_assign_to);
          const createdByUserName = await getUserNameById(lead.lead_created_by);
          return { 
            ...lead.toJSON(), 
            assigned_user_name: assignedUserName,
            createdBy_user_name: createdByUserName
          };
        })
      );

      // Ensure all statuses are present in the grouped leads
      ALL_POSSIBLE_STATUSES.forEach(status => {
        if (!groupedLeads[status]) {
          groupedLeads[status] = { count: 0, leads: [] };
        }
      });

      res.json({
        totalLeadsCount: leadsWithUserNamesAndCreatedBy.length,
        totalLeadDifference: totalLeadDifference.toFixed(2),
        percentageDifference,
        ...groupLeadsByStatus(leadsWithUserNamesAndCreatedBy),
      });

    } else {
      const leads = await getLeadsForUserAndSubordinates(id, org);
      const groupedLeads = groupLeadsByStatus(leads);
    
      const today = new Date();
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - 7);
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    
      const assignedUserIds = Object.values(groupedLeads)
        .flatMap(status => status.leads.map(lead => lead.lead_assign_to));
    
      const thisWeekLeads = await Lead.findAll({
        where: {
          organization_name: org,
          lead_date: { [Op.gte]: thisWeekStart, [Op.lt]: today },
          lead_assign_to: { [Op.in]: [id, ...assignedUserIds] }
        }
      });
      const lastWeekLeads = await Lead.findAll({
        where: {
          organization_name: org,
          lead_date: { [Op.gte]: lastWeekStart, [Op.lt]: thisWeekStart },
          lead_assign_to: { [Op.in]: [id, ...assignedUserIds] }
        }
      });
    
      const percentageDifference = calculateWeekPercentageDifference(
        groupLeadsByStatus(thisWeekLeads), 
        groupLeadsByStatus(lastWeekLeads)
      );
      
      const totalLeadDifference = lastWeekLeads.length === 0 
        ? (thisWeekLeads.length > 0 ? 100 : 0) 
        : ((thisWeekLeads.length - lastWeekLeads.length) / lastWeekLeads.length) * 100;
    
      let newLeadsCount = 0;
      let newLeadsWithUserNames = [];
    
      if (role === 'manager') {
        const newLeads = await Lead.findAll({
          where: {
            organization_name: org,
            lead_status: 'New'
          }
        });
    
        newLeadsWithUserNames = await Promise.all(
          newLeads.map(async (lead) => {
            const userName = await getUserNameById(lead.lead_assign_to);
            const createdByUserName = await getUserNameById(lead.lead_created_by);
            return { 
              ...lead.toJSON(), 
              user_name: userName, 
              createdBy_user_name: createdByUserName 
            };
          })
        );
    
        const groupedNewLeads = groupLeadsByStatus(newLeadsWithUserNames);
    
        if (groupedNewLeads['New']) {
          groupedLeads['New'] = groupedNewLeads['New'];
        }
    
        newLeadsCount = newLeads.length;
    
        const thisWeekNewLeads = newLeads.filter(lead => lead.lead_date >= thisWeekStart && lead.lead_date < today);
        const lastWeekNewLeads = newLeads.filter(lead => lead.lead_date >= lastWeekStart && lead.lead_date < thisWeekStart);
    
        const newPercentageDifference = calculateWeekPercentageDifference(
          groupLeadsByStatus(thisWeekNewLeads), 
          groupLeadsByStatus(lastWeekNewLeads)
        );
        percentageDifference.New = newPercentageDifference.New || 0;
      }
    
      const totalLeadsCount = leads.length + newLeadsCount;
    
      const leadsWithUserNamesAndCreatedBy = await Promise.all(
        leads.map(async (lead) => {
          const assignedUserName = await getUserNameById(lead.lead_assign_to);
          const createdByUserName = await getUserNameById(lead.lead_created_by);
          return { 
            ...lead.toJSON(), 
            assigned_user_name: assignedUserName, 
            createdBy_user_name: createdByUserName 
          };
        })
      );
    
      // Ensure all statuses are present in the grouped leads
      ALL_POSSIBLE_STATUSES.forEach(status => {
        if (!groupedLeads[status]) {
          groupedLeads[status] = { count: 0, leads: [] };
        }
      });
    
      const combinedLeads = role === 'manager' 
        ? [...leadsWithUserNamesAndCreatedBy, ...newLeadsWithUserNames] 
        : leadsWithUserNamesAndCreatedBy;
    
      res.json({
        totalLeadsCount: totalLeadsCount,
        totalLeadDifference: totalLeadDifference.toFixed(2),
        percentageDifference,
        ...groupLeadsByStatus(combinedLeads),
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: 'Something went wrong' });
  }
};









// Fetch lead by User_ID from URL parameter
exports.getLeadByUserId = async (req, res) => {
  try {
    const { org } = req.jwtPayload;
    const { id } = req.params;

    // Fetch leads for the user
    const leads = await Lead.findAll({
      where: {
        organization_name: org,
        lead_assign_to: id 
      }
    });

    if (!leads || leads.length === 0) {
      return res.status(404).json({ error: 'No leads found for the User' });
    }

    // Function to group leads by their status
    const groupLeadsByStatus = (leads) => {
      return leads.reduce((acc, lead) => {
        const status = lead.lead_status || 'Unknown'; 
        if (!acc[status]) {
          acc[status] = { count: 0, leads: [] };
        }
        acc[status].count += 1;
        acc[status].leads.push(lead);
        return acc;
      }, {});
    };

    const groupedLeads = groupLeadsByStatus(leads);

    const totalLeadsCount = leads.length; 
    const statusCounts = Object.keys(groupedLeads).reduce((acc, status) => {
      acc[status] = groupedLeads[status].count;
      return acc;
    }, {});

 
    res.json({
      totalLeadsCount,
      statusCounts,
      ...groupedLeads,
    });

  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(400).json({ error: 'Something went wrong' });
  }
};













// Fetch perticular lead details
exports.getLeadById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { org } = req.jwtPayload; 
    const leads = await Lead.findAll({
      where: {
        organization_name: org,
        lead_id: id 
      }
    });
    res.json(...leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(400).json({ error: 'Something went wrong' });
  }
};



// // Assign multiple leads to an agent or supervisor
// exports.assignLead = async (req, res) => {
//   try {
//     const { lead_ids, lead_assign_to } = req.body; // lead_ids is an array of lead IDs
//     const { org } = req.jwtPayload;

//     // Check if lead_ids is an array
//     if (!Array.isArray(lead_ids)) {
//       return res.status(400).json({ message: 'lead_ids must be an array.' });
//     }

//     // Loop through each lead_id and assign it
//     for (let id of lead_ids) {
//       const lead = await Lead.findOne({ where: { lead_id: id, organization_name: org } });

//       if (!lead) {
//         return res.status(404).json({ message: `Lead with ID ${id} not found or does not belong to your organization` });
//       }

//       if (lead.lead_assign_to) {
//         return res.status(400).json({ message: `Lead with ID ${id} is already assigned to user ${lead.lead_assign_to}.` });
//       }

//       // Update the lead assignment and status
//       await Lead.update(
//         { lead_assign_to, lead_status: 'Pending', lead_last_updated: new Date() },
//         { where: { lead_id: id } }
//       );
//     }

//     res.json({ message: 'Leads assigned successfully and statuses updated to Pending!' });
//   } catch (error) {
//     console.error('Error assigning leads:', error);
//     res.status(400).json({ message: 'Error assigning leads', error: error.message });
//   }
// };



exports.assignLead = async (req, res) => {
  try {
    const { lead_ids, lead_assign_to } = req.body; // lead_ids is an array of lead IDs
    const { org, id: action_taken_by } = req.jwtPayload; // Get user ID from token

    // Check if lead_ids is an array
    if (!Array.isArray(lead_ids)) {
      return res.status(400).json({ message: 'lead_ids must be an array.' });
    }

    // Validate lead_assign_to exists if needed
    if (!lead_assign_to) {
      return res.status(400).json({ message: 'lead_assign_to is required.' });
    }

    const results = {
      success: [],
      alreadyAssigned: [],
      notFound: []
    };

    // Process each lead assignment
    for (const lead_id of lead_ids) {
      try {
        const lead = await Lead.findOne({ 
          where: { 
            lead_id, 
            organization_name: org 
          } 
        });

        if (!lead) {
          results.notFound.push(lead_id);
          continue;
        }

        if (lead.lead_assign_to) {
          results.alreadyAssigned.push({
            lead_id,
            assigned_to: lead.lead_assign_to
          });
          continue;
        }

        // Update the lead assignment
        await Lead.update(
          { 
            lead_assign_to, 
            lead_status: 'Pending', 
            lead_last_updated: new Date() 
          },
          { where: { lead_id } }
        );

        // Create lifecycle entry
        await LeadLifecycle.create({
          lead_id,
          lead_status: 'Pending',
          action_taken: 'assign',
          action_taken_by,
          created_at: new Date()
        });

        results.success.push(lead_id);
      } catch (error) {
        console.error(`Error processing lead ${lead_id}:`, error);
        results.notFound.push(lead_id); // Or create a separate errors array
      }
    }

    // Prepare response message
    let messageParts = [];
    if (results.success.length) {
      messageParts.push(`${results.success.length} lead(s) assigned successfully`);
    }
    if (results.alreadyAssigned.length) {
      messageParts.push(`${results.alreadyAssigned.length} lead(s) were already assigned`);
    }
    if (results.notFound.length) {
      messageParts.push(`${results.notFound.length} lead(s) not found`);
    }

    res.json({
      message: messageParts.join(', '),
      details: results,
      summary: {
        totalAssigned: results.success.length,
        totalAlreadyAssigned: results.alreadyAssigned.length,
        totalNotFound: results.notFound.length
      }
    });

  } catch (error) {
    console.error('Error assigning leads:', error);
    res.status(400).json({ 
      message: 'Error assigning leads', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};















// // Re-assign multiple leads to another agent
// exports.reassignLead = async (req, res) => {
//   try {
//     const { lead_ids, lead_assign_to } = req.body; // lead_ids is an array of lead IDs
//     const { org } = req.jwtPayload;

//     // Check if lead_ids is an array
//     if (!Array.isArray(lead_ids)) {
//       return res.status(400).json({ message: 'lead_ids must be an array.' });
//     }

//     // Loop through each lead_id and reassign it
//     for (let id of lead_ids) {
//       const lead = await Lead.findOne({ where: { lead_id: id, organization_name: org } });

//       if (!lead) {
//         return res.status(404).json({ message: `Lead with ID ${id} not found or does not belong to your organization` });
//       }

//       // Update the lead assignment and status
//       await Lead.update(
//         { lead_assign_to, lead_status: 'Pending', lead_last_updated: new Date() },
//         { where: { lead_id: id } }
//       );
//     }

//     res.json({ message: 'Leads re-assigned successfully and statuses updated to Pending!' });
//   } catch (error) {
//     console.error('Error re-assigning leads:', error);
//     res.status(400).json({ message: 'Error re-assigning leads', error: error.message });
//   }
// };


exports.reassignLead = async (req, res) => {
  try {
    const { lead_ids, lead_assign_to } = req.body;
    const { org, id: action_taken_by } = req.jwtPayload; // Get user ID from token

    // Input validation
    if (!Array.isArray(lead_ids)) {
      return res.status(400).json({ message: 'lead_ids must be an array' });
    }
    if (!lead_assign_to) {
      return res.status(400).json({ message: 'lead_assign_to is required' });
    }

    const results = {
      reassigned: [],
      notFound: [],
      failed: []
    };

    // Process each lead reassignment
    for (const lead_id of lead_ids) {
      try {
        const lead = await Lead.findOne({ 
          where: { 
            lead_id, 
            organization_name: org 
          } 
        });

        if (!lead) {
          results.notFound.push(lead_id);
          continue;
        }

        // Get previous assignee before updating
        const previous_assignee = lead.lead_assign_to;

        // Update the lead
        await Lead.update(
          { 
            lead_assign_to, 
            lead_status: 'Pending', 
            lead_last_updated: new Date() 
          },
          { where: { lead_id } }
        );

        // Create lifecycle entry
        await LeadLifecycle.create({
          lead_id,
          lead_status: 'Pending',
          action_taken: 'reassign',
          action_taken_by,
          previous_assignee, // Track who it was assigned to before
          new_assignee: lead_assign_to, // Track who it's assigned to now
          created_at: new Date()
        });

        results.reassigned.push({
          lead_id,
          from: previous_assignee,
          to: lead_assign_to
        });

      } catch (error) {
        console.error(`Error reassigning lead ${lead_id}:`, error);
        results.failed.push({
          lead_id,
          error: error.message
        });
      }
    }

    // Prepare response
    let messageParts = [];
    if (results.reassigned.length) {
      messageParts.push(`${results.reassigned.length} lead(s) reassigned`);
    }
    if (results.notFound.length) {
      messageParts.push(`${results.notFound.length} lead(s) not found`);
    }
    if (results.failed.length) {
      messageParts.push(`${results.failed.length} lead(s) failed to reassign`);
    }

    res.json({
      message: messageParts.join(', '),
      details: results,
      summary: {
        totalReassigned: results.reassigned.length,
        totalNotFound: results.notFound.length,
        totalFailed: results.failed.length
      }
    });

  } catch (error) {
    console.error('Error in reassignLead:', error);
    res.status(500).json({ 
      message: 'Error processing reassignment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};















// // Update lead status
// exports.updateLeadStatus = async (req, res) => {
//   try {
//     const id = Number(req.params.id);
//     const { lead_status } = req.body;
//     const { org } = req.jwtPayload;


//     if (!lead_status) {
//       return res.status(400).json({ message: 'Lead status is required' });
//     }
//     const lead = await Lead.findOne({ where: { lead_id: id, organization_name: org } });

//     if (!lead) {
//       return res.status(404).json({ message: 'Lead not found or does not belong to your organization' });
//     }

//     await Lead.update(
//       { lead_status, lead_last_updated: new Date() },
//       { where: { lead_id: id } }
//     );

//     res.json({ message: 'Lead status updated successfully!' });
//   } catch (error) {
//     console.error('Error updating lead status:', error);

//     if (error.name === 'SequelizeValidationError') {
//       const errorMessage = error.errors.map(e => e.message).join(', '); 
//       return res.status(400).json({ message: errorMessage });
//     }

//     return res.status(500).json({ message: 'An unexpected error occurred while updating the lead status.' });
//   }
// };





exports.updateLeadStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { 
      lead_status,
      action_taken,
      call_type,
      call_duration,
      lead_response_type,
      follow_up_date,
      lead_cycle_remark
    } = req.body;
    
    const { org, id: action_taken_by } = req.jwtPayload;

    // Validate required fields
    if (!lead_status) {
      return res.status(400).json({ message: 'Lead status is required' });
    }

    // Find the lead
    const lead = await Lead.findOne({ 
      where: { 
        lead_id: id, 
        organization_name: org 
      } 
    });

    if (!lead) {
      return res.status(404).json({ 
        message: 'Lead not found or does not belong to your organization' 
      });
    }

    // Get previous status before updating
    const previous_status = lead.lead_status;

    // Update the lead
    await Lead.update(
      { 
        lead_status, 
        lead_last_updated: new Date() 
      },
      { where: { lead_id: id } }
    );

    // Create detailed lifecycle entry
    await LeadLifecycle.create({
      lead_id: id,
      lead_status,
      previous_status, // Track what status it changed from
      action_taken: action_taken || 'status_update',
      call_type,
      call_duration,
      lead_response_type,
      action_taken_by: action_taken_by,
      follow_up_date: follow_up_date ? new Date(follow_up_date) : null,
      lead_cycle_remark,
      created_at: new Date()
    });

    res.json({ 
      message: 'Lead status updated successfully!',
      details: {
        lead_id: id,
        previous_status,
        new_status: lead_status,
        updated_at: new Date()
      }
    });

  } catch (error) {
    console.error('Error updating lead status:', error);

    if (error.name === 'SequelizeValidationError') {
      const errorMessage = error.errors.map(e => e.message).join(', '); 
      return res.status(400).json({ 
        message: 'Validation error',
        errors: errorMessage 
      });
    }

    return res.status(500).json({ 
      message: 'An unexpected error occurred',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};






// Delete a lead
exports.deleteLead = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { org } = req.jwtPayload;

    const lead = await Lead.findOne({ where: { lead_id: id, organization_name: org } });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found or does not belong to your organization' });
    }

    await Lead.destroy({ where: { lead_id: id } });
    res.json({ message: 'Lead deleted successfully!' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(400).json({ message: 'Error deleting lead', error: error.message });
  }
};


exports.findDuplicateLeads = async (req, res) => {
  try {
    const { org } = req.jwtPayload;

    const duplicateLeads = await Lead.findAll({
      where: {
        organization_name: org,
        lead_status: 'Duplicate'
      }
    });

    const duplicateIdentifiers = duplicateLeads.map(lead => ({
      lead_email: lead.lead_email,
      lead_mobile: lead.lead_mobile
    }));

    const matchingLeads = await Lead.findAll({
      where: {
        organization_name: org,
        [Op.or]: [
          { lead_email: { [Op.in]: duplicateIdentifiers.map(lead => lead.lead_email) } },
          { lead_mobile: { [Op.in]: duplicateIdentifiers.map(lead => lead.lead_mobile) } }
        ],
        lead_status: { [Op.ne]: 'Duplicate' } 
      }
    });

    const resultMap = {};

    duplicateLeads.forEach(duplicateLead => {
      const matchedLeads = matchingLeads.filter(lead => 
        lead.lead_email === duplicateLead.lead_email || lead.lead_mobile === duplicateLead.lead_mobile
      );

      matchedLeads.forEach(matchedLead => {
        if (!resultMap[matchedLead.lead_id]) {
          resultMap[matchedLead.lead_id] = {
            original: matchedLead, 
            duplicates: [] 
          };
        }

        if (!resultMap[matchedLead.lead_id].duplicates.some(duplicate => duplicate.lead_id === duplicateLead.lead_id)) {
          resultMap[matchedLead.lead_id].duplicates.push(duplicateLead);
        }
      });
    });

    const duplicateOriginalPairs = Object.values(resultMap);

    return res.status(200).json({
      // message: 'Matching leads found!',
        "duplicateLeads": duplicateOriginalPairs 
    });

  } catch (error) {
    console.error('Error finding matching leads:', error);
    res.status(400).json({ message: 'Error finding matching leads', error: error.message });
  }
};
























exports.getLeadLifecycle = async (req, res) => {
  try {
    const leadId = Number(req.params.id);
    const { org } = req.jwtPayload;

    // First verify the lead exists and belongs to the organization
    const lead = await Lead.findOne({
      where: {
        lead_id: leadId,
        organization_name: org
      }
    });

    if (!lead) {
      return res.json({ 
        message: 'Lead not found or does not belong to your organization' 
      });
    }

    // Then fetch the lifecycle entries
    const lifecycleEntries = await LeadLifecycle.findAll({
      where: {
        lead_id: leadId
      },
      order: [
        ['created_at', 'ASC']
      ]
    });

    if (!lifecycleEntries || lifecycleEntries.length === 0) {
      return res.status(404).json({ 
        message: 'No lifecycle entries found for this lead' 
      });
    }

    res.json(lifecycleEntries);
  } catch (error) {
    console.error('Error fetching lead lifecycle:', error);
    res.status(500).json({ 
      error: 'Something went wrong while fetching lead lifecycle' 
    });
  }
};



// exports.createCallLog = async (req, res) => {
//   try {
//     const { lead_mobile, call_type, call_duration } = req.body;
//     const { org, id: action_taken_by } = req.jwtPayload;

//     // Validate required fields
//     if (!lead_mobile || !call_type || !call_duration) {
//       return res.status(400).json({ 
//         message: 'lead_mobile, call_type, and call_duration are required' 
//       });
//     }

//     // Find the lead by mobile number within organization
//     const lead = await Lead.findOne({
//       where: {
//         lead_mobile,
//         organization_name: org
//       }
//     });

//     if (!lead) {
//       return res.status(404).json({
//         message: 'Lead not found with this mobile number in your organization'
//       });
//     }

//     // Create call log entry in lifecycle
//     const callLog = await LeadLifecycle.create({
//       lead_id: lead.lead_id,
//       lead_status: lead.lead_status,
//       action_taken: 'call',
//       call_type,
//       call_duration,
//       action_taken_by,
//       created_at: new Date()
//     });

//     res.status(201).json({
//       message: 'Call log created successfully',
//       call_log: {
//         id: callLog.lifecycle_id,
//         lead_id: callLog.lead_id,
//         lead_status: callLog.lead_status,
//         call_type: callLog.call_type,
//         call_duration: callLog.call_duration,
//         timestamp: callLog.created_at
//       }
//     });

//   } catch (error) {
//     console.error('Error creating call log:', error);

//     if (error.name === 'SequelizeValidationError') {
//       const errors = error.errors.map(err => err.message);
//       return res.status(400).json({
//         message: 'Validation error',
//         errors
//       });
//     }

//     res.status(500).json({
//       message: 'Error creating call log',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };


exports.createCallLog = async (req, res) => {
  try {
    const { lead_mobile, call_type, call_duration } = req.body;
    const { org, id: action_taken_by } = req.jwtPayload;

    // Validate required fields
    if (!lead_mobile || !call_type) {
      return res.status(400).json({ 
        message: 'lead_mobile, call_type' 
      });
    }

    // Find the lead by mobile number within the organization
    const lead = await Lead.findOne({
      where: {
        lead_mobile,
        organization_name: org,
        lead_status: {
          [Op.ne]: "Duplicate" // Only match if lead_status is NOT "Duplicate"
        }
      }
    });

    // If no lead is found, return immediately and stop further processing
    if (!lead) {
      return res.status(204).end(); // 204 No Content
    }
    // Create the call log entry in lifecycle only if lead exists
    const callLog = await LeadLifecycle.create({
      lead_id: lead.lead_id,
      lead_status: lead.lead_status,
      action_taken: 'call',
      call_type,
      call_duration,
      action_taken_by,
      created_at: new Date()
    });

    // Respond with success message and call log details
    res.status(201).json({
      message: 'Call log created successfully',
      call_log: {
        id: callLog.lifecycle_id,
        lead_id: callLog.lead_id,
        lead_status: callLog.lead_status,
        call_type: callLog.call_type,
        call_duration: callLog.call_duration,
        timestamp: callLog.created_at
      }
    });

  } catch (error) {
    console.error('Error creating call log:', error);

    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors
      });
    }

    // Handle unexpected errors
    res.status(500).json({
      message: 'Error creating call log',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateLifecycleRecord = async (req, res) => {
  try {
    const { lifecycle_id } = req.params;
    const {
      lead_status,
      action_taken,
      lead_response_type,
      follow_up_date,
      lead_cycle_remark,
      call_type,
      call_duration
    } = req.body;
    
    const { org, id: action_taken_by } = req.jwtPayload;

    // Validate at least one field is being updated
    const updateFields = [
      'lead_status', 'action_taken', 'lead_response_type', 
      'follow_up_date', 'lead_cycle_remark'
    ];
    
    if (!updateFields.some(field => req.body[field] !== undefined)) {
      return res.status(400).json({
        message: 'At least one update field is required',
        valid_fields: updateFields
      });
    }

    // First find the lifecycle record
    const lifecycle = await LeadLifecycle.findOne({
      where: { lifecycle_id }
    });

    if (!lifecycle) {
      return res.status(404).json({
        message: 'Lifecycle record not found'
      });
    }

    // Then verify the associated lead belongs to the organization
    const lead = await Lead.findOne({
      where: {
        lead_id: lifecycle.lead_id,
        organization_name: org
      }
    });

    if (!lead) {
      return res.status(404).json({
        message: 'Associated lead not found or does not belong to your organization'
      });
    }

    // Prepare update data
    const updateData = {
      ...(lead_status && { lead_status }),
      ...(action_taken && { action_taken }),
      ...(lead_response_type && { lead_response_type }),
      ...(follow_up_date && { follow_up_date: new Date(follow_up_date) }),
      ...(lead_cycle_remark && { lead_cycle_remark }),
      ...(call_type && { call_type }),
      ...(call_duration && { call_duration })
    };

    // Update the lifecycle record
    await LeadLifecycle.update(updateData, {
      where: { lifecycle_id }
    });

    // If lead_status was updated, also update the lead's current status
    if (lead_status) {
      await Lead.update(
        { lead_status, lead_last_updated: new Date() },
        { where: { lead_id: lifecycle.lead_id } }
      );
    }

    // Get the updated record
    const updatedRecord = await LeadLifecycle.findByPk(lifecycle_id);

    res.json({
      message: 'Lifecycle record updated successfully',
      record: {
        id: updatedRecord.lifecycle_id,
        lead_id: updatedRecord.lead_id,
        lead_status: updatedRecord.lead_status,
        action_taken: updatedRecord.action_taken,
        lead_response_type: updatedRecord.lead_response_type,
        follow_up_date: updatedRecord.follow_up_date,
        lead_cycle_remark: updatedRecord.lead_cycle_remark,
        call_type: updatedRecord.call_type,
        call_duration: updatedRecord.call_duration,
        last_updated: new Date()
      }
    });

  } catch (error) {
    console.error('Error updating lifecycle record:', error);

    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      message: 'Error updating lifecycle record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};







// exports.getMyFollowUpsWithStatus = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const { org } = req.jwtPayload;
//     const now = new Date();
//     const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

//     // Step 1: Get all leads assigned to this user
//     const assignedLeads = await Lead.findAll({
//       where: {
//         lead_assign_to: userId,
//         organization_name: org
//       },
//       attributes: ['lead_id', 'lead_name', 'lead_mobile', 'lead_status', 'lead_email', 'lead_assign_to']
//     });

//     if (!assignedLeads.length) {
//       return res.json({
//         message: 'No leads currently assigned to you',
//         upcoming_follow_ups: [],
//         missed_follow_ups: []
//       });
//     }

//     // Step 2: Get latest lifecycle for each lead (including those without follow-up dates)
//     const leadsWithLifecycles = await Promise.all(
//       assignedLeads.map(async (lead) => {
//         const latestLifecycle = await LeadLifecycle.findOne({
//           where: { lead_id: lead.lead_id },
//           order: [['created_at', 'DESC']],
//           limit: 1
//         });

//         return {
//           ...lead.get({ plain: true }),
//           latest_lifecycle: latestLifecycle
//         };
//       })
//     );

//     // Step 3: Categorize follow-ups
//     const upcomingFollowUps = [];
//     const missedFollowUps = [];
//     const noFollowUpLeads = [];

//     leadsWithLifecycles.forEach(lead => {
//       // If no lifecycle exists at all
//       if (!lead.latest_lifecycle) {
//         noFollowUpLeads.push({
//           lead_id: lead.lead_id,
//           lead_name: lead.lead_name,
//           status: 'no_history'
//         });
//         return;
//       }

//       // If no follow-up date exists in the latest lifecycle
//       if (!lead.latest_lifecycle.follow_up_date) {
//         noFollowUpLeads.push({
//           lead_id: lead.lead_id,
//           lead_name: lead.lead_name,
//           status: 'no_followup'
//         });
//         return;
//       }

//       const followUpDate = new Date(lead.latest_lifecycle.follow_up_date);
//       const hoursDiff = Math.round((followUpDate - now) / (60 * 60 * 1000));
      
//       const followUpData = {
//         lead_id: lead.lead_id,
//         lead_name: lead.lead_name,
//         lead_mobile: lead.lead_mobile,
//         lead_email: lead.lead_email,
//         assigned_to: lead.lead_assign_to,
//         current_status: lead.lead_status,
//         follow_up_details: {
//           follow_up_date: lead.latest_lifecycle.follow_up_date,
//           action_taken: lead.latest_lifecycle.action_taken,
//           remarks: lead.latest_lifecycle.lead_cycle_remark,
//           created_at: lead.latest_lifecycle.created_at,
//           lifecycle_id: lead.latest_lifecycle.lifecycle_id
//         },
//         time_analysis: {
//           hours_diff: hoursDiff,
//           status: hoursDiff >= 0 ? 
//             (hoursDiff <= 24 ? 'upcoming' : 'future') : 
//             'missed',
//           overdue_by: hoursDiff < 0 ? Math.abs(hoursDiff) : null
//         }
//       };

//       if (followUpDate > now && followUpDate <= twentyFourHoursLater) {
//         upcomingFollowUps.push(followUpData);
//       } else if (followUpDate < now) {
//         missedFollowUps.push(followUpData);
//       }
//     });

//     // Sort results
//     upcomingFollowUps.sort((a, b) => 
//       new Date(a.follow_up_details.follow_up_date) - new Date(b.follow_up_details.follow_up_date)
//     );
    
//     missedFollowUps.sort((a, b) => 
//       new Date(a.follow_up_details.follow_up_date) - new Date(b.follow_up_details.follow_up_date)
//     );

//     res.json({
//       counts: {
//         upcoming: upcomingFollowUps.length,
//         missed: missedFollowUps.length,
//         no_followup: noFollowUpLeads.length,
//         total_assigned: assignedLeads.length
//       },
//       time_range: {
//         now: now.toISOString(),
//         next_24_hours: twentyFourHoursLater.toISOString()
//       },
//       upcoming_follow_ups: upcomingFollowUps,
//       missed_follow_ups: missedFollowUps,
//       leads_without_followups: noFollowUpLeads,
//       meta: {
//         timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//         server_time: now.toISOString()
//       }
//     });

//   } catch (error) {
//     console.error('Error fetching follow-ups:', error);
//     res.status(500).json({
//       message: 'Error fetching follow-ups',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//       stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//   }
// };







exports.getMyFollowUpsWithStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const { org } = req.jwtPayload;
    const now = new Date();
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Step 1: Get all leads assigned to this user
    const assignedLeads = await Lead.findAll({
      where: {
        lead_assign_to: userId,
        organization_name: org
      },
      attributes: ['lead_id', 'lead_name', 'lead_mobile', 'lead_status', 'lead_email', 'lead_assign_to']
    });

    if (!assignedLeads.length) {
      return res.json({
        message: 'No leads currently assigned to you',
        upcoming_follow_ups: [],
        missed_follow_ups: []
      });
    }

    // Step 2: Get latest lifecycle for each lead
    const leadsWithLifecycles = await Promise.all(
      assignedLeads.map(async (lead) => {
        const latestLifecycle = await LeadLifecycle.findOne({
          where: { lead_id: lead.lead_id },
          order: [['created_at', 'DESC']],
          limit: 1
        });

        return {
          ...lead.get({ plain: true }),
          latest_lifecycle: latestLifecycle
        };
      })
    );

    // Step 3: Categorize follow-ups with second-level precision
    const upcomingFollowUps = [];
    const missedFollowUps = [];
    const noFollowUpLeads = [];

    leadsWithLifecycles.forEach(lead => {
      if (!lead.latest_lifecycle) {
        noFollowUpLeads.push({
          lead_id: lead.lead_id,
          lead_name: lead.lead_name,
          status: 'no_history'
        });
        return;
      }

      if (!lead.latest_lifecycle.follow_up_date) {
        noFollowUpLeads.push({
          lead_id: lead.lead_id,
          lead_name: lead.lead_name,
          status: 'no_followup'
        });
        return;
      }

      const followUpDate = new Date(lead.latest_lifecycle.follow_up_date);
      const secondsDiff = Math.round((followUpDate - now) / 1000); // Difference in seconds
      
      const followUpData = {
        lead_id: lead.lead_id,
        lead_name: lead.lead_name,
        lead_mobile: lead.lead_mobile,
        lead_email: lead.lead_email,
        assigned_to: lead.lead_assign_to,
        current_status: lead.lead_status,
        follow_up_details: {
          follow_up_date: lead.latest_lifecycle.follow_up_date,
          action_taken: lead.latest_lifecycle.action_taken,
          remarks: lead.latest_lifecycle.lead_cycle_remark,
          created_at: lead.latest_lifecycle.created_at,
          lifecycle_id: lead.latest_lifecycle.lifecycle_id
        },
        time_analysis: {
          seconds_diff: secondsDiff,
          minutes_diff: Math.round(secondsDiff / 60),
          hours_diff: Math.round(secondsDiff / 3600),
          days_diff: Math.round(secondsDiff / 86400),
          status: secondsDiff >= 0 ? 
            (secondsDiff <= 86400 ? 'upcoming' : 'future') : 'missed',
          overdue_by: secondsDiff < 0 ? {
            seconds: Math.abs(secondsDiff),
            minutes: Math.abs(Math.round(secondsDiff / 60)),
            hours: Math.abs(Math.round(secondsDiff / 3600)),
            days: Math.abs(Math.round(secondsDiff / 86400))
          } : null
        }
      };

      if (followUpDate > now && followUpDate <= twentyFourHoursLater) {
        upcomingFollowUps.push(followUpData);
      } else if (followUpDate < now) {
        missedFollowUps.push(followUpData);
      }
    });

    // Sort results
    upcomingFollowUps.sort((a, b) => 
      a.time_analysis.seconds_diff - b.time_analysis.seconds_diff
    );
    
    missedFollowUps.sort((a, b) => 
      a.time_analysis.seconds_diff - b.time_analysis.seconds_diff
    );

    // Format dates for display
    const formatDate = (date) => {
      return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };

    res.json({
      counts: {
        upcoming: upcomingFollowUps.length,
        missed: missedFollowUps.length,
        no_followup: noFollowUpLeads.length,
        total_assigned: assignedLeads.length
      },
      time_range: {
        now: formatDate(now),
        next_24_hours: formatDate(twentyFourHoursLater),
        now_utc: now.toISOString(),
        now_ist: formatDate(now)
      },
      upcoming_follow_ups: upcomingFollowUps,
      missed_follow_ups: missedFollowUps,
      leads_without_followups: noFollowUpLeads,
      meta: {
        timezone: 'Asia/Kolkata (IST)',
        timezone_offset: '+05:30',
        note: 'All time differences calculated in seconds precision'
      }
    });

  } catch (error) {
    console.error('Error fetching follow-ups:', error);
    res.status(500).json({
      message: 'Error fetching follow-ups',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};



exports.getCallLogsByUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const callLogs = await LeadLifecycle.findAll({
      where: {
        action_taken_by: userId,
      },
      attributes: ['lifecycle_id', 'lead_id', 'lead_status', 'action_taken', 'call_type', 'call_duration', 'lead_response_type', 'follow_up_date', 'lead_cycle_remark', 'created_at'],
      order: [['created_at', 'DESC']]  
    });

    if (!callLogs.length) {
      return res.json({
        message: `No call logs found for user with ID ${userId}.`,
        call_logs_by_type: {},
      });
    }

    const callLogsGroupedByType = callLogs.reduce((acc, log) => {
      const callType = log.call_type;
      if (!callType) return acc;

      if (!acc[callType]) {
        acc[callType] = {
          count: 0,  
          logs: [],
          
        };
      }

      acc[callType].logs.push(log.get({ plain: true }));
      
      acc[callType].count += 1;

      return acc;
    }, {});

    res.json({
      message: `Call logs for user with ID ${userId} fetched successfully.`,
      call_logs_by_type: callLogsGroupedByType,
    });

  } catch (error) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({
      message: 'Error fetching call logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};



exports.addLeadResponse = async (req, res) => {
  try {
    const { 
      lead_id,
      lead_status,
      action_taken,
      lead_response_type,
      follow_up_date,
      lead_cycle_remark,
      call_type,
      call_duration
    } = req.body;

    const { org, id: action_taken_by } = req.jwtPayload;

    // Validate required fields
    const requiredFields = ['lead_id', 'lead_status', 'action_taken', 'lead_response_type'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        required_fields: requiredFields,
        missing_fields: missingFields,
        optional_fields: [
          'follow_up_date',
          'lead_cycle_remark',
          'call_type',
          'call_duration'
        ]
      });
    }

    // Validate lead exists in organization
    const lead = await Lead.findOne({
      where: {
        lead_id,
        organization_name: org
      }
    });

    if (!lead) {
      return res.status(404).json({
        message: 'Lead not found or does not belong to your organization',
        lead_id,
        organization: org
      });
    }

    // Validate response types
    const validResponseTypes = [
      'Positive',
      'Negative',
      'Neutral',
      'Interested',
      'Not Interested',
      'Callback Requested',
      'Information Requested'
    ];

    if (!validResponseTypes.includes(lead_response_type)) {
      return res.status(400).json({
        message: 'Invalid lead response type',
        valid_response_types: validResponseTypes,
        received: lead_response_type
      });
    }

    // Create the lifecycle entry
    const lifecycleEntry = await LeadLifecycle.create({
      lead_id,
      lead_status,
      action_taken,
      lead_response_type,
      lead_cycle_remark: lead_cycle_remark,
      action_taken_by,
      follow_up_date: follow_up_date ? new Date(follow_up_date) : null,
      call_type,
      call_duration,
      created_at: new Date()
    });

    // Update lead's last updated timestamp
    await Lead.update(
      { lead_last_updated: new Date() },
      { where: { lead_id } }
    );

    // Prepare response
    const response = {
      message: 'Lead response added successfully',
      entry: {
        id: lifecycleEntry.lifecycle_id,
        lead_id: lifecycleEntry.lead_id,
        status: lifecycleEntry.lead_status,
        action: lifecycleEntry.action_taken,
        response_type: lifecycleEntry.lead_response_type,
        recorded_by: lifecycleEntry.action_taken_by,
        timestamp: lifecycleEntry.created_at
      }
    };

    // Add optional fields to response if they exist
    if (lifecycleEntry.lead_cycle_remark) {
      response.entry.notes = lifecycleEntry.lead_cycle_remark;
    }
    if (lifecycleEntry.follow_up_date) {
      response.entry.follow_up_date = lifecycleEntry.follow_up_date;
    }
    if (lifecycleEntry.call_type) {
      response.entry.call_details = {
        type: lifecycleEntry.call_type,
        duration: lifecycleEntry.call_duration
      };
    }

    return res.status(201).json(response);

  } catch (error) {
    console.error('Error adding lead response:', error);

    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message,
        type: err.type
      }));

      return res.status(400).json({
        message: 'Validation error',
        errors
      });
    }

    // Handle database errors
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({
        message: 'Database error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Generic error handler
    return res.status(500).json({
      message: 'Failed to add lead response',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};