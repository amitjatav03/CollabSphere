const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/user.model");

// auth
exports.auth = async (req, res, next) => {
    try {
        // extract token
        const token = req.cookies.token || req.body.token || req.header("Authorisation").replace("Bearer ", "");

        // if token missing, return response
        if(!token) {
            return res.status(401).json({
                success: false,
                message: "Token is Missing"
            });
        }

        // verify the token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decoded);
            req.user = decoded;

        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Token is Invalid"
            });
        }
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Something went wrong while validating the token"
        });
    }
}