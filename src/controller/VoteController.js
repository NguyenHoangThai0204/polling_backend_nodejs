const mongoose = require("mongoose");
const Vote = require("../models/Vote");
const ContentPoll = require("../models/ContentPoll");

let io; // Biến để lưu instance của socket.io

// Hàm để gán instance của socket.io
exports.setSocket = (socketIo) => {
  io = socketIo;
};

exports.createVote = async (req, res) => {
  try {
    // 1. Tạo đối tượng Vote và lưu vào database
    const vote = new Vote(req.body);
    await vote.save();
    console.log("Vote saved:", vote);

    // 2. Tìm Poll chứa Option và cập nhật mảng 'votes' của Option
    const updatedPoll = await ContentPoll.findOneAndUpdate(
      { "options._id": vote.optionId }, // Tìm Poll chứa Option có optionId này
      { $push: { "options.$.votes": vote._id } }, // Thêm vote._id vào mảng votes của Option
      { new: true } // Trả về Poll đã được cập nhật
    );

    // Kiểm tra nếu không tìm thấy Poll
    if (!updatedPoll) {
      console.log("Option not found in Poll:", vote.optionId);
      return res.status(404).json({
        message: "Option not found in Poll",
        optionId: vote.optionId,
      });
    }

    // 3. Emit sự kiện WebSocket cho frontend khi có sự thay đổi
    // Kiểm tra instance của socket.io trước khi emit
    if (io) {
      io.emit("voteUpdateSL", {
        pollId: updatedPoll._id,
        updatedPoll: updatedPoll,
      });
      console.log('WebSocket event "voteUpdateSL" emitted successfully:');
    } else {
      console.log("Socket.io instance is not set");
    }

    res.status(200).json({
      status: "OK",
      message: "Create vote success",
      data: {
        vote: vote,
        updatedPoll: updatedPoll,
      },
    });
  } catch (error) {
    console.error("Error creating vote:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error: " + error.message });
  }
};

exports.createVotePrivate = async (req, res) => {
  try {
    const { pollId, userId, optionId, addRessWallet } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!pollId || !userId || !optionId) {
      return res
        .status(400)
        .json({ message: "pollId, userId, and optionId are required." });
    }

    // Kiểm tra xem userId đã vote cho pollId này chưa
    const existingVote = await Vote.findOne({ pollId, userId });

    if (existingVote) {
      return res.status(400).json({
        message: "You have already voted in this poll.",
        pollId: pollId,
        userId: userId,
      });
    }
    // kiểm tra xem địa chỉ ví đã vote chưa
    if (addRessWallet !== null) {
      const existingVoteWallet = await Vote.findOne({ pollId, addRessWallet });
      if (existingVoteWallet) {
        return res.status(400).json({
          message: "You have already voted in this poll.",
          pollId: pollId,
          addRessWallet: addRessWallet,
        });
      }
    }

    // Tạo đối tượng Vote và lưu vào database
    const vote = new Vote({ pollId, userId, optionId, addRessWallet });
    await vote.save();
    console.log("Vote saved:", vote);

    // Tìm và cập nhật Poll với optionId
    const updatedPoll = await ContentPoll.findOneAndUpdate(
      { _id: pollId, "options._id": optionId },
      { $push: { "options.$.votes": vote._id } },
      { new: true }
    );

    if (!updatedPoll) {
      return res.status(404).json({
        message: "Option not found in Poll",
        pollId: pollId,
        optionId: optionId,
      });
    }

    // Emit sự kiện WebSocket nếu có
    if (io) {
      io.emit("voteUpdateSL", {
        pollId: updatedPoll._id,
        updatedPoll: updatedPoll,
      });
      console.log('WebSocket event "voteUpdateSL" emitted voteprivate successfully:');
    } else {
      console.log("Socket.io instance is not set");
    }

    res.status(200).json({
      status: "OK",
      message: "Vote created successfully",
      data: {
        vote: vote,
        updatedPoll: updatedPoll,
      },
    });
  } catch (error) {
    console.error("Error creating vote:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error: " + error.message });
  }
};

// Hàm lấy tất cả Vote của một Poll theo pollId
exports.getVotesByPollId = async (req, res) => {
  try {
    const { pollId } = req.body; // Lấy pollid từ query string

    // Kiểm tra pollId
    if (!mongoose.Types.ObjectId.isValid(pollId)) {
      return res.status(400).json({ message: "Invalid pollId" });
    }

    // Tìm tất cả Vote của Poll theo pollId
    const votes = await Vote.find({ pollId: pollId });

    res.status(200).json({
      status: "OK",
      message: "Get votes by pollId success",
      data: votes,
    });
  } catch (error) {
    console.error("Error getting votes by pollId:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error: " + error.message });
  }
};
// hàm lấy vote detail dựa trên userid và pollid
exports.getVoteByUserIdAndPollId = async (req, res) => {
  try {
    const { pollId, userId } = req.body; // Lấy pollId và userId từ body

    // Kiểm tra pollId và userId
    if (!mongoose.Types.ObjectId.isValid(pollId)) {
      return res.status(400).json({ message: "Invalid pollId" });
    }
    if (!userId) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    // Tìm Vote của userId trong Poll theo pollId
    const vote = await Vote.findOne({ pollId: pollId, userId: userId });

    if (!vote) {
      return res.status(404).json({
        status: "NOT_FOUND",
        message: "Vote not found for the given userId and pollId",
      });
    }

    // Phát sự kiện qua Socket.IO nếu tìm thấy vote
    if (io) {
      io.emit("voteDetailFetched", {
        pollId: pollId,
        userId: userId,
        vote: vote,
      });
      console.log(
        `WebSocket event "voteDetailFetched" emitted for pollId: ${pollId}, userId: ${userId}`
      );
    } else {
      console.log("Socket.io instance is not set");
    }

    res.status(200).json({
      status: "OK",
      message: "Get vote by userId and pollId success",
      data: vote,
    });
  } catch (error) {
    console.error("Error getting vote by userId and pollId:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error: " + error.message });
  }
};

// lấy ra danh sách các poll theo user id
exports.getPollsByUserId = async (req, res) => {
  try {
    const { userId } = req.body; // Lấy userId từ body

    // Kiểm tra userId
    if (!userId) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    // Tìm tất cả Vote của userId
    const votes = await Vote.find({ userId: userId });

    res.status(200).json({
      status: "OK",
      message: "Get votes by userId success",
      data: votes,
    });
  } catch (error) {
    console.error("Error getting votes by userId:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error: " + error.message });
  }
};
