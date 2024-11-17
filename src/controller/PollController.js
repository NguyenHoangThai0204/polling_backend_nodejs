const ContentPoll = require("../models/ContentPoll");
const User = require("../models/User"); // Import model của User

exports.createPolling = async (req, res) => {
    try {
        const poll = new ContentPoll(req.body);
        await poll.save();

        // Giả sử bạn có userId trong req.body hoặc req.user
        const userId = req.body.authorId; // Hoặc req.user._id nếu bạn sử dụng xác thực

        // Tìm user và cập nhật listPoll
        const user = await User.findById(userId);
        if (user) {
            user.listPoll.push(poll._id);
            await user.save();
        } else {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            status: "OK",
            message: "Create Polling success",
            data: poll
        });
    } catch (error) {
        console.error("Error creating poll:", error);
        res.status(500).json({ message: "Internal Server Error: " + error });
    }
};


exports.findAllPollingUser = async( req, res )=>{
    try {
        const authorId = req.params.authorId;
        const listPolling = await ContentPoll.find({authorId: authorId});
        res.status(200).json({
            status: "OK",
            message: "Success",
            data: listPolling
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal Server Error" + error});
    }
}

exports.findAllPolling = async( req, res )=>{
    try {
        const listPolling = await ContentPoll.find();
        res.status(200).json({
            status: "OK",
            message: "Success",
            data: listPolling
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal Server Error" + error});
    }
}

exports.findByIdPolling = async (req, res) => {
    try {
        const id = req.params.id;  // Lấy giá trị id từ params
        const Polling = await ContentPoll.findById(id);
        res.status(200).json({
            status: "OK",
            message: "Success",
            data: Polling
        });
    } catch (error) {
        console.error("Error finding polling:", error);
        res.status(500).json({ message: "Internal Server Error: " + error });
    }
};

// update timeend poll is time now
exports.updateTimeEndPoll = async (req, res) => {
    try {
        const id = req.params.id;  // Lấy giá trị id từ params
        const Polling = await ContentPoll.findById(id);
        Polling.timeEnd = new Date();
        await Polling.save();
        res.status(200).json({
            status: "OK",
            message: "Success",
            data: Polling
        });
    } catch (error) {
        console.error("Error finding polling:", error);
        res.status(500).json({ message: "Internal Server Error: " + error });
    }
};
