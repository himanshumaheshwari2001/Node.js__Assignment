const express = require("express");
const {
  registerUser,
  login,
  logout,
  updatePassword,
  updateProfile,
  myProfile,
  getUserProfile,
  getAllUsers,
  forgotPassword,
  resetPassword,
} = require("../controllers/user.js");
const { isAuthenticateUser } = require("../middleware/auth");
const router = express.Router();

router.route("/register").post(registerUser);

router.route("/login").get(login);

router.route("/logout").get(logout);

router.route('/update/password').put(isAuthenticateUser,updatePassword);

router.route('/update/profile').patch(isAuthenticateUser,updateProfile);


router.route('/me').get(isAuthenticateUser,myProfile);

router.route('/user/:id').get(isAuthenticateUser,getUserProfile);

router.route('/users').get(isAuthenticateUser,getAllUsers);

router.route('/forgot/password').post(forgotPassword);

router.route('/password/reset/:token').put(resetPassword);




module.exports = router;
