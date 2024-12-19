const { console } = require("inspector");
const ContentPoll = require("../models/ContentPoll");
const User = require("../models/User"); // Import model của User
let io;
const Vote = require("../models/Vote");
exports.setSocket = (socketIo) => {
    io = socketIo;
};


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


exports.updatePolling = async (req, res) => {
    try {
        const poll = req.body; // Lấy thông tin Poll từ body
        const pollNew = await ContentPoll.findById(poll._id);
        if (!pollNew) {
            return res.status(404).json({ message: "Poll not found" });
        }

        // Cập nhật thông tin Poll
        pollNew.title = req.body.title;
        pollNew.description = req.body.description;
        pollNew.options = req.body.options;
        pollNew.avatar = req.body.avatar;
        pollNew.timeStart = req.body.timeStart;
        pollNew.timeEnd = req.body.timeEnd;
        pollNew.authorId = req.body.authorId;
        await pollNew.save();

        res.status(200).json({
            status: "OK",
            message: "Update Polling success",
            data: poll
        });

        // Gửi tín hiệu cập nhật Poll qua Socket
        if (io) {
            io.emit("updatePoll", { pollId: pollNew._id, updatedPoll: pollNew });
            console.log("Đã gửi tín hiệu socket cập nhật poll");
        } else {
            console.log("io is null");
        }
    } catch (error) {
        console.error("Error updating poll:", error);
        res.status(500).json({ message: "Internal Server Error: " + error });
    }
};

// tìm mảng cuộc bình chọn có cùng tên 
exports.findPollingByName = async (req, res) => {
    try {
        const {title} = req.body;  // Lấy giá trị id từ params
        const Polling = await ContentPoll.find({title: title});
        // trả về danh sách các cuộc bình chọn có cùng tên
        res.status(200).json({
            status: "OK",
            message: "Success",
            data: Polling
        });
    } catch (error) {
        console.error("Error finding polling:", error);
        res.status(500).json({ message: "Internal Server Error: " + error });
    }
}


const mongoose = require('mongoose');

exports.deletePolling = async (req, res) => {
    try {
        const { id } = req.body; // Lấy id của Poll từ body
        const poll = await ContentPoll.findById(id);

        if (!poll) {
            return res.status(404).json({ message: "Poll not found" });
        }

        const userId = poll.authorId; // Lấy userId từ Poll

        // Kiểm tra nếu userId có hợp lệ (ObjectId hợp lệ)
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: "Invalid userId in Poll" });
        }

        // Tìm user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log("User found:", user);

        // Loại bỏ Poll khỏi listPoll của người dùng
        await User.updateOne(
            { _id: userId }, // Tìm user theo userId
            { $pull: { listPoll: { _id: id } } } // Loại bỏ object có _id khớp với id
        );

        await User.updateMany(
            { "listVote.id_vote": id }, // Tìm các user có id_vote khớp với id
            { $pull: { listVote: { id_vote: id } } } // Loại bỏ object trong listVote có id_vote khớp
        );

        // Xóa Poll khỏi ContentPoll (nếu cần)
        await ContentPoll.findByIdAndDelete(id);

        // Xóa tất cả các Vote liên quan đến Poll (nếu cần)
        await Vote.deleteMany({ pollId: id });

        res.status(200).json({
            status: "OK",
            message: "Delete Polling success"
        });

        // Gửi tín hiệu xóa Poll qua Socket
        if (io) {
            io.emit("deletePoll", { pollId: id });
            console.log("Đã gửi tín hiệu socket xóa poll");
        } else {
            console.log("io is null");
        }
    } catch (error) {
        console.error("Error deleting poll:", error);
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
        if(io){
            io.emit("updatePolling", {
                pollId: Polling._id,
                updatedPoll: Polling,
            });
            console.log("Đã gửi tín hiệu socket");
        }else{
            console.log("io is null");
        }
    } catch (error) {
        console.error("Error finding polling:", error);
        res.status(500).json({ message: "Internal Server Error: " + error });
    }
};


// 