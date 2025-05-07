// import the required modules
const express = require("express");
const router = express.Router();

// import the required controllers and middleware
const Auth = require("../controllers/auth.controller");

const { auth } = require("../middlewares/auth.middleware");



// AUTHENTICATION ROUTES

// user login route
router.post("/login", Auth.login);

// user signup route
router.post("/signup", Auth.signUp);

// send OTP to mail route
router.post("/sendotp", Auth.sendOTP);

// change password route
router.post("/change-password", auth, Auth.changePassword);


module.exports = router;