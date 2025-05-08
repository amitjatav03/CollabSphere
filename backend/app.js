const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

const database = require("./config/database");
const dotenv = require("dotenv");

// importing routes
const userRoutes = require("./routes/user.routes");
const friendRoutes = require("./routes/friend.routes");

dotenv.config(); 
const PORT = process.env.PORT || 5000;

database.connect();

app.use(express.json());
app.use(cookieParser());

// routers
app.use("/api/auth", userRoutes);
app.use("/api/friends", friendRoutes);

app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Youre server is up and running..."
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});