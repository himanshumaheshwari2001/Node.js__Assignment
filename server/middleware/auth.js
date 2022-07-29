const User = require('../models/User')
const jwt = require('jsonwebtoken');
const catchAsync = require('./catchAsync');
const ErrorHandler = require('../utils/errorHandler')

exports.isAuthenticateUser= catchAsync(async(req,res,next)=>{

    const {token} = req.cookies;
    if(!token){
        res.status(401).json({
            success:false,
            message:"please login first",
        })
    }

    const decoded = await jwt.verify(token,process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id);
    next();
})


exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
       return next( new ErrorHandler(
          `Role : ${req.user.role} is not allowed to access this resource`,403
        ));
      }
      next();
    };
  };