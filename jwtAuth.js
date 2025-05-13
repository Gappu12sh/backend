const jwt = require('jsonwebtoken');
const UserDetails = require('./models/UserDetails');
const Role = require('./models/Role');

const jwtAuthMiddleware = (req, res, next) => {

    //first check the request headers authorization or not 
    const authorization = req.headers.authorization
    if(!authorization) return res.status(401).json({error :'Token Not Found'});

    const token = req.headers.authorization.split(' ')[1];
    //verify jwt token
    if(!token) return res.status(401).json({error :'Unauthorised'});
    try{
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.jwtPayload = decoded;
        
        next();


    }catch(err){
        console.error(err);
        res.status(401).json({ error : 'Invalid token'})
    }
}



const restrictTo = (roles = [], requiredPermission = null) => async (req, res, next) => {
  const userRole = req.jwtPayload.role;  
  const organizationName = req.jwtPayload.org; 

  if (roles.includes(userRole)) {
    return next(); 
  }

  try {
   
    const roleFound = await Role.findOne({
      where: {
        role_name: userRole,
        organization_name: organizationName,
        role_isactive: true  
      }
    });

    if (roleFound) {
      if (requiredPermission && Array.isArray(roleFound.role_permission) && roleFound.role_permission.includes(requiredPermission)) {
        return next();  
      }
    }

    return res.status(403).json({ error: "Unauthorized" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while checking role" });
  }
};



//generate jwt token
const generateToken = (user) =>{

    const secretKey = process.env.JWT_SECRET

    if (!secretKey) {
        throw new Error('JWT secret key is not set');
    }
    if (!user) {
        throw new Error('User data is missing or invalid');
    }
    
    //generate new token
    // return jwt.sign(user,secretKey,{expiresIn: 43000}); // Token valid only for 12 hours
    return jwt.sign(user,secretKey); // Token valid only for 12 hours

}




const checkOrganizationAccess = async (req, res, next) => {
  try {
    const authenticatedUser = req.jwtPayload;  // Get the authenticated user from the token
    const userId = req.params.id ? Number(req.params.id) : req.body.user_id || authenticatedUser.id;// Get user ID from the params or body

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required ! ' });
    }

    const user = await UserDetails.findOne({ where: { user_id: userId } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the authenticated user and the target user are from the same organization
    if (user.organization_name !== authenticatedUser.org) {
      return res.status(403).json({ error: 'You do not have access to this user' });
    }

    // If everything is fine, proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while checking organization access' });
  }
};





module.exports = {jwtAuthMiddleware,generateToken,checkOrganizationAccess,restrictTo};