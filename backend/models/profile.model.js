const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    // profilepic: {
    //     type: String,
    //     required: true,
    // },
    about: {
        type: String,
        required: true,
    },
    github: {
        type: String,
        required: true,
    },
    linkedin: {
        type: String,
        required: true,
    },
    skills: [{
        type: String
    }],
    codingProfiles: [{
        name: {
            type: String,
        },
        link: {
            type: String,
        }
    }],
    achievements: [{
        type: String,
        required: true,
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});


module.exports = mongoose.model("Profile", profileSchema);