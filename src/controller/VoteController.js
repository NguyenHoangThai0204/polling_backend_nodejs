const mongoose = require('mongoose');
const Vote = require('../models/Vote');
const ContentPoll = require('../models/ContentPoll');

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
    console.log('Vote saved:', vote);

    // 2. Tìm Poll chứa Option và cập nhật mảng 'votes' của Option
    const updatedPoll = await ContentPoll.findOneAndUpdate(
      { 'options._id': vote.optionId },  // Tìm Poll chứa Option có optionId này
      { $push: { 'options.$.votes': vote._id } }, // Thêm vote._id vào mảng votes của Option
      { new: true }  // Trả về Poll đã được cập nhật
    );

    // Kiểm tra nếu không tìm thấy Poll
    if (!updatedPoll) {
      console.log('Option not found in Poll:', vote.optionId);
      return res.status(404).json({
        message: 'Option not found in Poll',
        optionId: vote.optionId
      });
    }

    // 3. Emit sự kiện WebSocket cho frontend khi có sự thay đổi
    // Kiểm tra instance của socket.io trước khi emit
    if (io) {
        io.emit('voteUpdate', {
          pollId: updatedPoll._id,
          updatedPoll: updatedPoll
        });
        console.log('WebSocket event "voteUpdate" emitted successfully:');
      } else {
        console.log('Socket.io instance is not set');
      }

    res.status(200).json({
      status: 'OK',
      message: 'Create vote success',
      data: {
        vote: vote,
        updatedPoll: updatedPoll
      }
    });

  } catch (error) {
    console.error('Error creating vote:', error);
    res.status(500).json({ message: 'Internal Server Error: ' + error.message });
  }
};
