const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            trim: true
        },
        lastname: {
            type: String,
            required: true,
            trim: true
        }
    },
    enroll: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    course: {
        type: String,
        required: true,
    },
    branch: {
        type: String,
        enum: ["CSCY", "CSE", "CSIT", "ECE", "EX", "ME", "CE"],
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    profileDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile"
    },
    image: {
        type: String,
        required: true   
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
});

module.exports = mongoose.model('User', userSchema);