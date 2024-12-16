const mongoose = require("mongoose");
const RoundPoll = require("../models/RoundPoll");

let io; // Biến để lưu instance của socket.io

// Hàm để gán instance của socket.io
exports.setSocket = (socketIo) => {
  io = socketIo;
};

// kiểm tra xem có round nào có roundName và trong idPollRound có pollId không
exports.checkRoundPoll = async (req, res) => {
  try {
    const { roundName, pollId } = req.body;

    console.log("roundName:", roundName);
    console.log("pollId:", pollId);
    // Tìm trong cơ sở dữ liệu có roundName và pollId khớp
    const roundPoll = await RoundPoll.findOne({
      roundName: roundName,
      idPollRound: { $in: [pollId] },
    });

    // nếu không có trả về status FAIL
    if (!roundPoll) {
      return res.status(200).json({
        status: "FAIL"
      });
    }

    res.status(200).json({
      status: "OK"
    });
  } catch (error) {
    console.error("Error checking roundPoll:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error: " + error.message });
  }

};

// thêm pollid vào mảng idPollRound của RoundPoll
exports.addPollToRound = async (req, res) => {
  try {
    const { pollIdOld, roundName } = req.body;
    // nếu có thì trả về thông báo đã thêm rồi

    const roundPoll = await RoundPoll.findOne({
      roundName: roundName,
    });

    if (!roundPoll) {
      return res.status(400).json({ message: "RoundPoll not found" });
    }
    
    // Kiểm tra xem pollId đã tồn tại trong mảng idPollRound của roundPoll chưa
    const isExist = roundPoll.idPollRound.includes(pollIdOld);

    if (isExist) {
      return res.status(400).json({ message: "Poll already exists in RoundPoll" });
    }

    // Thêm pollId vào mảng idPollRound
    roundPoll.idPollRound.push(pollIdOld);

    // Lưu vào cơ sở dữ liệu
    await roundPoll.save();

    res.status(200).json({
      status: "OK",
      message: "Add poll to RoundPoll success",
      data: roundPoll,
    });
   
  } catch (error) {
    console.error("Error adding poll to RoundPoll:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error: " + error.message });
  }
};

// trả về số lượng round theo tên
exports.getRoundCountByName = async (req, res) => {
  try {
    const { roundName } = req.body;

    // Tìm số lượng bản ghi có roundName khớp
    const count = await RoundPoll.countDocuments({ roundName: roundName });

    if (count === 0) {
      return 0;
    }

    res.status(200).json(
      {count // Trả về số lượng
    });
  } catch (error) {
    console.error("Error getting round count:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error: " + error.message });
  }
};

// hàm tìm round theo tên
exports.getRoundPollByName = async (req, res) => {
  try {
    const { roundName } = req.body;

    // Tìm trong cơ sở dữ liệu có roundName khớp
    const roundPoll = await RoundPoll.findOne({ roundName: roundName });

    if (!roundPoll) {
      return res.status(400).json({ message: "RoundPoll not found" });
    }

    res.status(200).json({
      status: "OK",
      data: roundPoll,
    });
  } catch (error) {
    console.error("Error getting round by name:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error: " + error.message });
  }
};

// tạo round
exports.createRound = async (req, res) => {
  try {
    const { roundName, pollId } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!roundName || !pollId) {
      return res.status(400).json({ message: "roundName and pollId are required" });
    }


    // Tìm trong cơ sở dữ liệu có roundName khớp sẽ không tạo mới
    const round = await RoundPoll.findOne({ roundName: roundName });

    if (round) {
      return res.status(400).json({ message: "RoundPoll already exists" });
    }

    // Tạo mới RoundPoll với pollId được thêm vào mảng
    const roundPoll = new RoundPoll({
      roundName: roundName,
      idPollRound: [pollId], // Gán trực tiếp pollId vào mảng
    });

    // Lưu vào cơ sở dữ liệu
    await roundPoll.save();

    res.status(200).json({
      status: "OK",
      message: "Create Round success",
      data: roundPoll,
    });
  } catch (error) {
    console.error("Error creating round:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error: " + error.message });
  }
};
