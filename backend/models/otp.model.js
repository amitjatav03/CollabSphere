const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5*60
    }
});

// a function -> to send mails
async function sendVerificationEmail(email, otp) {
    try {
        const response = await mailSender(email, "Verification Email", emailTemplate(otp));
        console.log("Email Sent Successfully: ", response);

    } catch (error) {
        console.log("Error occured while sending mail: ", error);
        throw error;
    }
}

OTPSchema.pre("save", async function(next) {
    await sendVerificationEmail(this.email, this.otp);
    next();
});


module.exports = mongoose.model("OTP", OTPSchema);