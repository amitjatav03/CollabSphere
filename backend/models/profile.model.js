const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    about: {
        type: String,
        default: ""
    },
    github: {
        type: String,
        default: ""
    },
    linkedin: {
        type: String,
        default: ""
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
        default: ""
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

module.exports = mongoose.model("Profile", profileSchema);