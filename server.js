const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors=require("cors")
const app = express();
const port = process.env.PORT || 5000;


app.use(cors())
 
// Middleware to parse JSON request body
app.use(bodyParser.json());

app.get("/",(req,res)=>{
  res.json({message:"working"})
})
// In your server.js or routes file


const organizationRoutes = require('./routes/organizationRoutes'); // Import organization routes
const userRoutes = require('./routes/userRoutes'); // Import user routes
const leadRoutes = require('./routes/leadRoutes'); // Import lead routes
const roleRoutes = require('./routes/roleRoutes'); // Import Role routes
// Use the user routes and lead routes
app.use('/api/organization', organizationRoutes);  // organization routes
app.use('/api/user', userRoutes);  // User routes
app.use('/api/lead', leadRoutes);  // Lead routes
app.use('/api/Role', roleRoutes);  // Lead routes



// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});