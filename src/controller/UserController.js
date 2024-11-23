const User = require("../models/User");
const bcrypt = require("bcrypt");


const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "This email is already registered." });
    }

    // Tạo OTP ngẫu nhiên (6 chữ số)
    const otp = crypto.randomInt(100000, 999999).toString();

    // Lưu OTP tạm thời (Redis hoặc MongoDB)
    await OtpModel.create({ email, otp, createdAt: new Date() });

    // Gửi OTP qua email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "your-email@gmail.com",
        pass: "your-email-password",
      },
    });

    await transporter.sendMail({
      from: '"Your App Name" <your-email@gmail.com>',
      to: email,
      subject: "Your OTP for Account Verification",
      text: `Your OTP code is: ${otp}`,
    });

    return res.status(200).json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const createUser = async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      role,
      status,
      province,
      district,
      ward,
      street,
      avatar,
      phone,
      dateOfBirth,
    } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required." });
    }

    const newUser = new User({
      email,
      password,
      fullName,
      role,
      status,
      province,
      district,
      ward,
      street,
      avatar,
      phone,
      dateOfBirth,
    });
    await newUser.save(); // Lưu vào cơ sở dữ liệu

    res
      .status(200)
      .json({ status: "Ok", message: "Login success", data: newUser }); // Trả về người dùng mới đã được tạo})
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(500).json({
        status: "Err",
        message: "email and password are required.",
      });
    }

    const checkUser = await User.findOne({
      email: email,
    });
    if (checkUser === null) {
      return res.status(500).json({
        status: "Err",
        message: "email is not defined.",
      });
    }

    const checkPassword = bcrypt.compare(password, checkUser.password);
    if (!checkPassword) {
      return res.status(500).json({
        status: "Err",
        message: "Password is incorrect",
      });
    }

    res.status(200).json({
      status: "Ok",
      message: "Login success",
      data: checkUser,
    });
  } catch (error) {
    console.error("Error login: " + error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const findAllUser = async (req, res) => {
  try {
    const listUser = await User.find();
    res.status(200).json({
      status: "OK",
      message: "Success",
      data: listUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const findByIdUser = async (req, res) => {
  try {
    const { id } = req.body; // Lấy id từ body
    if (!id) {
      return res.status(400).json({
        status: "Err",
        message: "ID is required.",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: "Err",
        message: "User not found.",
      });
    }

    res.status(200).json({
      status: "OK",
      message: "Success",
      data: user,
    });
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateUserStatusToNon = async (req, res) => {
  try {
    const { id } = req.body; // Lấy id từ body

    // Cập nhật trạng thái thành "non"
    await User.findByIdAndUpdate(id, { status: "inactive" });

    res.status(200).json({
      status: "OK",
      message: "User status updated to 'inactive'.",
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const updateUserStatusToActive = async (req, res) => {
  try {
    const { id } = req.body; // Lấy id từ body

    // Cập nhật trạng thái thành "non"
    await User.findByIdAndUpdate(id, { status: "active" });

    res.status(200).json({
      status: "OK",
      message: "User status updated to 'inactive'.",
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createUser,
  loginUser,
  findAllUser,
  findByIdUser,
  updateUserStatusToNon,
  updateUserStatusToActive,
  sendOtp,
};
