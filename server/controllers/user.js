const User = require("../models/User");
const catchAsync = require("../middleware/catchAsync");
const response = require("../utils/response.js");
const sendEmail = require("../middleware/sendEmail.js");
const crypto = require("crypto");

exports.registerUser = catchAsync(async (req, res, next) => {
  const { name, email, password ,role} = req.body;

  let user = await User.findOne({ email });
  if (user) {
    response(res, 400, false, "User is already present!"); 
  }
  user = await User.create({
    name,
    email,
    password,
    role
  });

  // login after register
  const token = await user.generateToken();
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  res.status(201).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
  next();
});

// user login

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return response(res, 400, false, "User does not exist!");
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(400).json({
      success: false,
      message: "Incorrect password",
    });
  }

  const token = await user.generateToken();
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(200).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
  next();
});


//Add / Renew / Cancel Plan  Membership

exports.memberShip = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const {name,plan,cancel} = req.body;
  console.log(user,name,plan,cancel)

  if (!name && !plan)
    return response(res, 400, false, "Please Enter some Value !");

  if (name) {
    user.membership = name;
  }

  if (plan) {
          // here if plan is 1 so it represent next 1 month.
          // same as if 2 so it represent next 2 months. 
    user.membershipExpire= Date.now() + plan*30*24*60*60*1000 ;
  }

  // for cancellation the plan
  if(cancel){
    user.membership='none';
    user.membershipExpire= Date.now();
    await user.save();
   return response(res, 200, true, "Membership Cancel Successfully !");

  }

  await user.save();
  return response(res, 200, true, `${name} - ${plan} Months Membership Active Successfully !`);
});




// logout

exports.logout = catchAsync(async (req, res, next) => {
  const options = { expires: new Date(Date.now()), httpOnly: true };

  res.status(200).cookie("token", null, options).json({
    success: true,
    message: "Logged Out",
  });
});
// Update Passwords
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    return response(res, 400, false, "Please provide old and new password !");
  if (oldPassword === newPassword)
    return response(res, 400, false, "New password is same as old");

  const isMatch = await user.matchPassword(oldPassword);

  if (!isMatch) return response(res, 404, false, "Incorrect old password");

  user.password = newPassword;
  await user.save();
  return response(res, 200, true, "Password changed successfully !");
});

//update profile

exports.updateProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const { email, name } = req.body;

  if (!name && !email)
    return response(res, 400, false, "Please Enter some Value !");

  if (name) {
    user.name = name;
  }
  if (email) {
    user.email = email;
  }

  await user.save();
  return response(res, 200, true, "Profile updated successfully ! ");
});


// Getting Profile Information
exports.myProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  return response(res, 200, true, user);
});

exports.getUserProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return response(res, 400, false, "User not found");

  return response(res, 200, true, user);
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({});

  return response(res, 200, true, users);
});

// forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return response(res, 400, false, "User not found!");

  const resetPasswordToken = user.getResetPasswordToken();

  await user.save(); // saving after edinting date, and token;

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetPasswordToken} `;

  const message = `Reset Your Password by clicking on the link below: \n \n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Rest Password",
      message,
    });

    return response(res, 200, true, `Email sent to ${user.email}`);
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return response(res, 500, false, `${error.message}`);
  }
});

//
exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return response(res, 401, false, "Token Invalid");

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  return response(res, 200, true, "password changed! ");
});
