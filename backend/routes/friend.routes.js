const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth.middleware");
const Friend = require("../controllers/friend.controller");

// routes
router.post("/send", auth, Friend.sendFriendRequest);
router.put("/accept/:requestId", auth, Friend.acceptFriendRequest);
router.put("/reject/:requestId", auth, Friend.rejectFriendRequest);
router.get("/pending", auth, Friend.getPendingRequests);

module.exports = router;