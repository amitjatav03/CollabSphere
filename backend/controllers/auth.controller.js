const User = require("../models/user.model");
const OTP = require("../models/otp.model");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/profile.model");
require("dotenv").config();


// send otp
exports.sendOTP = async (req, res) => {
    try {
        // fetch email from request body
        const { email } = req.body;

        // check user present or not
        const user = await User.findOne({ email });

        // if user already exists, return response
        if(user) {
            return res.status(401).json({
                success: false,
                message: "User Already Registered"
            });
        }

        // generate otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });

        // check uniqueness of otp
        let result = await OTP.findOne({ otp });
        while(result) {
            otp = otpGenerator(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });
            result = await OTP.findOne({ otp });
        }

        // create an entry for otp
        const otpBody = await OTP.create({ email, otp});

        // return success response
        res.status(200).json({
            success: true,
            message: "OTP Sent Successfully",
            otp: otp
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// register user 
exports.signUp = async (req, res) => {
    try {
        // fetch data from request body
        const { fullname, enroll, email, branch, course, password, confirmPassword, otp } = req.body;
        console.log("fetching data");

        // data validation
        if(!fullname || !enroll || !email || !branch || !course || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            });
        }

        // match password and confirm password
        if(password != confirmPassword) {
            return res.status(400).json({
                status: false,
                message: "Password and ConfirmPassword value does not match. Please try again."
            });
        }

        // check user already exists or not
        const user = await User.findOne({ email });
        if(user) {
            return res.status(400).json({
                success: false,
                message: "User Already Exists. Please Sign In to Continue"
            });
        }
        console.log(user);

        // find most recent OTP stored for the user
        const recentOTP = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);

        // validate OTP
        if(recentOTP.length === 0) {
            // OTP not found for the email
            return res.status(400).json({
                success: false,
                message: "OTP Not Found"
            });
        } else if(otp != recentOTP[0].otp) {
            // OTP is invalid
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // hash password
        const hash = await bcrypt.hash(password, 10);

        // create additional profile for user
        const profileDets = await Profile.create({
            about: null,
            github: null,
            linkedin: null,
            skills: [],
            codingProfiles: [],
            achievements: [""],
            user: null
        });
        console.log("profile", profileDets);
        // create the user
        const userdata = await User.create({
            fullname, enroll, branch, course, email,
            password: hash,
            profileDetails: profileDets._id,
            image: `https://api.dicebear.com/9.x/initials/svg?seed=${fullname.firstname} ${fullname.lastname}`
        });
        console.log(userdata);

        // return response
        return res.status(200).json({
            success: true,
            message: "User Registered Successfully",
            data: userdata
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

// login user 
exports.login = async (req, res) => {
    try {
        // fetch data from request body
        const { enroll, password } = req.body;

        // data validation
        if(!enroll || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are required, please try again"
            });
        }

        // check user exists or not
        const user = await User.findOne({ enroll }).populate("profileDetails");

        if(!user) {
            return res.status(401).json({
                success: false,
                message: "user is not registered, please signup later"
            });
        }

        // generate jwt, after password matching
        if(await bcrypt.compare(password, user.password)) {
            const payload = {
                enroll: user.enroll,
                id: user._id,
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });
            
            // save token to user document in database
            user.token = token;
            user.password = undefined;

            // create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly: true
            }

            res.cookie("token", token, options)
            .status(200).json({
                success: true,
                token,
                user,
                message: "Successfully Logged In"
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "Password is Incorrect"
            });
        }    

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Login Failure, Please Try Again"
        });
    }
}

// changing password
exports.changePassword = async (req, res) => {
    try {
        // get user data from req.user
        const user = await User.findById(req.user.id);

        // fetch passwords from request body
        const { oldPass, newPass, confirmNewPass } = req.body;

        // validate old password
        const isPasswordMatch = await bcrypt.compare(oldPass, user.password);

        if(!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "The Password is Incorrect"
            });
        }

        // match new and confirm new password
        if(newPass !== confirmNewPass) {
            return res.status(400).json({
                success: false,
                message: "The Password and Confirm Password does not Match"
            });
        }

        // update password
        const encryptPass = await bcrypt.hash(newPass, 10);

        const updatedUser = await User.findByIdAndUpdate(req.user.id, { password: encryptPass }, { new: true });

        // send notification mail
        try {
            const emailRes = await mailSender(
                updatedUser.email,
                passwordUpdated(
                    updatedUser.email,
                    `Password Updated Successfully for ${updatedUser.fullname.firstname} ${updatedUser.fullname.lastname}`
                )
            );

        } catch (error) {
            console.log("Error occurred while sending email:", error);
            return res.status(500).json({
                success: false,
                message: "Error occurred while sending email",
                error: error.message
            });
        }

        // return success response
        return res.status(200).json({
            success: true,
            message: "Password Updated Successfully"
        });

    } catch(error) {
        console.log("Error occurred while Updating Password:", error);

        return res.status(500).json({
            success: false,
            message: "Error occurred while Updaing Password",
            error: error.message
        });
    }
}