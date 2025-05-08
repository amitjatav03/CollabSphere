const FriendRequest = require("../models/friend.model");
const User = require("../models/user.model");

// send friend request
exports.sendFriendRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user.id;
        console.log(senderId);

        // check if request already exists
        const existingRequest = await FriendRequest.findOne({
            sender: senderId,
            receiver: receiverId
        });

        if(existingRequest) {
            return res.status(400).json({
                success: false,
                message: "Friend Request Already Sent"
            }); 
        }

        // create a new request
        const friendRequest = await FriendRequest.create({
            sender: senderId,
            receiver: receiverId
        });

        return res.status(200).json({
            success: true,
            message: "Friend Request Sent Successfully",
            data: friendRequest
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in sending Friend Request",
            error: error.message
        });
    }
}

// accept friend request
exports.acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const friendRequest = await FriendRequest.findById(requestId);

        if(!friendRequest) {
            return res.status(404).json({
                success: false,
                message: "Friend request do not found"
            });
        }

        // update request status
        friendRequest.status = "accepted";
        await friendRequest.save();

        // add users to each other's friends list
        await User.findByIdAndUpdate(
            friendRequest.sender,
            { $addToSet: { friends: friendRequest.receiver }}
        );
        await User.findByIdAndUpdate(
            friendRequest.receiver,
            { $addToSet: { friends: friendRequest.sender }}
        );

        return res.status(200).json({
            success: true,
            message: "Friend request accepted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in accepting friend request"
        });
    }
}

// reject friend request
exports.rejectFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const friendRequest = await FriendRequest.findById(requestId);

        if(!friendRequest) {
            return res.status(404).json({
                success: false,
                message: "Friend request not found"
            });
        }
        
        friendRequest.status = "rejected";
        await friendRequest.save();

        return res.status(200).json({
            success: false,
            message: "Friend request already sent"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in rejecting friend request",
            error: error.message
        });
    }
}

// get all pending friend requests
exports.getPendingRequests = async (req, res) => {
    try {
        const requests = await FriendRequest.find({
            receiver: req.user.id,
            status: "pending"
        }).populate("sender", "fullname email image");

        return res.status(200).json({
            success: true,
            data: requests
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in fetching friend requests",
            error: error.message
        });
    }
}