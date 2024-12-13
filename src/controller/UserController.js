const User = require("../models/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const PasswordReset = require("../models/PasswordReset");
const Mailer = require("../helpers/Mailer");
const {TokenExpiredError } = jwt;
let io;
setSocket = (socketIo) => {
  io = socketIo;
}
require("dotenv").config();


// hàm thêm id vào listVote của user
const addPollIdInListVoteOfUser = async (req, res) => {
  try {
    const { id, pollId } = req.body;

    // Kiểm tra id và pollId có tồn tại
    if (!id || !pollId) {
      return res.status(400).json({
        status: "Err",
        message: "ID and pollId are required.",
      });
    }

    // Tìm user theo id
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: "Err",
        message: "User not found.",
      });
    }

    // Đảm bảo listVote là mảng hợp lệ
    if (!Array.isArray(user.listVote)) {
      user.listVote = [];
    }

    // Kiểm tra nếu pollId đã tồn tại trong listVote
    const isPollIdExist = user.listVote.some((existingVote) => {
      // So sánh object `pollId` với object `existingVote`
      return JSON.stringify(existingVote.id_vote) === JSON.stringify(pollId);
    });

    if (isPollIdExist) {
      return res.status(400).json({
        status: "Err",
        message: "Poll ID already exists in the list.",
      });
    }

    // Thêm pollId vào listVote dưới dạng đối tượng { id_vote: pollId }
    user.listVote.push({ id_vote: pollId });

    // Lưu lại thay đổi
    await user.save();

    return res.status(200).json({
      status: "Success",
      message: "Poll ID added successfully.",
      data: user.listVote,
    });
  } catch (error) {
    console.error("Error adding poll ID:", error);
    return res.status(500).json({
      status: "Err",
      message: "Internal Server Error",
    });
  }
};


const resetPasswordByEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Email and password are required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }
    user.password = password;
    await user.save();
    return res.status(200).json({
      success: true,
      msg: "Password reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
}
  
const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Validation error",
        errors: errors.array(),
      });
    }
    const { email } = req.body;
    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(400).json({
        success: false,
        msg: "Email does not exist",
      });
    }
    // Tạo OTP 6 chữ số
    const generateOTP = () =>
      Math.floor(100000 + Math.random() * 900000).toString();

    // Gọi hàm để sinh OTP
    const randomOTP = generateOTP();
    console.log("OTP: ", randomOTP);
    // Tạo JWT chứa email và OTP
    const token = jwt.sign({ email, randomOTP }, process.env.JWT_SECRET, {
      expiresIn: "5m",
    });
    //xóa token của email cũ
    await PasswordReset.deleteMany({ email: email});

    const passwordReset = new PasswordReset({
      user_id: userData._id,
      email: email,
      token,
    });
    await passwordReset.save();
    // Gửi email chứa OTP
    const subject = "Reset Your Password - OTP Included";
    const content = `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
    <h2 style="color: #007bff;">Hello ${userData.fullName},</h2>
    <p>You requested to reset your password. Here is your OTP:</p>
    <p style="font-size: 1.5em; font-weight: bold; color: #ff5733;">${randomOTP}</p>
    <p>This OTP is valid for the next 5 minutes. Please use it to complete your password reset process.</p>
    <p>If you did not request this, please ignore this email.</p>
    <br>
    <p>Best regards,<br><strong>Your Service Team</strong></p>
  </div>
`;

    Mailer.sendMail(email, subject, content);
    return res.status(201).json({
      success: true,
      msg: "OTP sent to your email. Please check your inbox.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log("Received email:", email);
    console.log("Received OTP:", otp);

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        msg: "Email and OTP are required",
      });
    }

    const passwordReset = await PasswordReset.findOne({ email, token: { $exists: true } });
    if (!passwordReset) {
      return res.status(404).json({
        success: false,
        msg: "OTP not found",
      });
    }
    console.log("Found password reset token:", passwordReset.token);

    let decoded;
    try {
      decoded = jwt.verify(passwordReset.token, process.env.JWT_SECRET);
    } catch (err) {
      // Kiểm tra lỗi nếu token hết hạn
      if (err instanceof TokenExpiredError) {
        return res.status(400).json({
          success: false,
          msg: "OTP has expired. Please request a new one.",
        });
      }
      // Nếu không phải lỗi hết hạn token thì trả về lỗi chung
      console.error("JWT verification failed:", err);
      return res.status(400).json({
        success: false,
        msg: "Invalid OTP token",
      });
    }
    console.log("Decoded JWT:", decoded);

    if (decoded.email !== email || decoded.randomOTP !== otp) {
      return res.status(400).json({
        success: false,
        msg: "Invalid OTP",
      });
    }

    const tokenExpirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    console.log("Token expiration time:", tokenExpirationTime);
    console.log("Current time:", currentTime);

    if (currentTime > tokenExpirationTime) {
      return res.status(400).json({
        success: false,
        msg: "OTP has expired",
      });
    }

    await PasswordReset.deleteMany({ email: decoded.email });
    console.log("Token deleted for user ID:", decoded.email);

    return res.status(200).json({
      success: true,
      msg: "OTP verified successfully. You can now reset your password.",
    });

  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({
      success: false,
      msg: "Internal Server Error",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const {
      _id,
      email,
      fullName,
      province,
      district,
      ward,
      street,
      phone,
      avatar,
    } = req.body; // Lấy các dữ liệu từ body request

    const { id } = req.params; // Lấy ID từ params

    // Kiểm tra xem ID có được cung cấp không
    if (!_id) {
      return res.status(400).json({
        status: "Err",
        message: "ID is required in params.",
      });
    }

    // Tìm user cần cập nhật
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({
        status: "Err",
        message: "User not found.",
      });
    }

    // Cập nhật các thông tin nếu được gửi
    if (email) user.email = email;
    if (fullName) user.fullName = fullName;
    if (province) user.province = province; // Cập nhật tỉnh
    if (district) user.district = district; // Cập nhật quận
    if (ward) user.ward = ward; // Cập nhật phường
    if (street) user.street = street; // Cập nhật đường
    if (phone) user.phone = phone; // Cập nhật số điện thoại
    if (avatar) user.avatar = avatar; // Cập nhật ảnh đại diện

    // Lưu các thay đổi vào database
    await user.save();

    if(io){
      io.emit('user-updated', user);
      console.log("User update socket successfully");
    }else{
      console.log("Socket.io not initialized");
    }
    res.status(200).json({
      status: "OK",
      message: "User updated successfully.",
      data: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        province: user.province,
        district: user.district,
        ward: user.ward,
        street: user.street,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ status: "Err", message: "Internal Server Error" });
  }
};

const signUpWithGmail = (req, res) => {

  const config = {
    service: "gmail",
    port: 465,
    secure: true,
    logger: true,
    debug: true,
    secureConnection: "true",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  };

  const transporter = nodemailer.createTransport(config);

  const MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "HỆ THỐNG BÌNH CHỌN T&M",
      link: "https://mailgen.js/",
    },
  });

  const response = {
    body: {
      name: "HỆ THỐNG BÌNH CHỌN",
      intro: "ĐĂNG KÝ THÀNH CÔNG !!!",
      action: {
        instructions:
          "Để tiếp tục, vui lòng truy cập trang đăng nhập bằng cách nhấn vào nút bên dưới:",
        button: {
          color: "#22BC66",
          text: "Đăng nhập vào tài khoản của bạn",
          link: "http://localhost:3000/api/user/login", // Link đến trang đăng nhập
        },
      },
      outro:
        "Nếu bạn cần hỗ trợ hoặc có thắc mắc, vui lòng trả lời email này, chúng tôi sẵn sàng giúp đỡ.",
    },
  };

  const mail = MailGenerator.generate(response);

  const message = {
    from: process.env.EMAIL,
    to: userMail,
    subject: "ĐĂNG KÝ THÀNH CÔNG",
    html: mail,
  };
  console.log("Sending email to:", userMail);
  console.log("Email content:", mail);
  transporter
    .sendMail(message)
    .then(() => {
      return res.status(201).json({
        msg: "Bạn sẽ nhận được email xác nhận.",
      });
    })
    .catch((error) => {
      return res.status(500).json({ error });
    });
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
    const checkUser = await User.findOne({
      email: email,
    });
    // Kiểm tra xem email đã tồn tại hay chưa
    if (checkUser) {
      return res.status(409).json({
        status: 409,
        message: "Email is already defined.",
      });
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
        message: "Email and password are required.",
      });
    }

    const checkUser = await User.findOne({ email: email });
    if (!checkUser) {
      return res.status(500).json({
        status: "Err",
        message: "Email is not defined.",
      });
    }

    // Kiểm tra mật khẩu trực tiếp
    if (password !== checkUser.password) {
      return res.status(500).json({
        status: "Err",
        message: "Password is incorrect",
      });
    }
    
     if(io) {
      io.emit('user-login', { userId: checkUser._id });

      console.log("User socket login successfully");
      console.log("User id: ", checkUser._id);
    }
    else {
      console.log("Socket.io not initialized");
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

// hàm logout user
const logoutUser = async (req, res) => {
  try {
    const { id } = req.body; // Lấy id từ body
    if (!id) {
      return res.status(400).json({
        status: "Err",
        message: "ID is required.",
      });
    }
    if(io) {
      io.emit('user-logout', { id });
      console.log("User socket logout successfully", id);
    }
    else {
      console.log("Socket.io not initialized");
    }
    res.status(200).json({
      status: "OK",
      message: "Success",
    });
  } catch (error) {
    console.error("Error logout user:", error);
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
    if(io) {
      io.emit('user-status-changed', { id, status: "inactive" });
      console.log("user status changed to inactive");
    }
    else {
      console.log("Socket.io not initialized");
    }


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
    if(io) {
      io.emit('user-status-changed', { id, status: "active" });
      console.log("user status changed to active");
    }
    else {
      console.log("Socket.io not initialized");
    }
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
  signUpWithGmail,
  updateUser,
  forgotPassword,
  verifyOTP,
  resetPasswordByEmail,
  setSocket,
  logoutUser,
  addPollIdInListVoteOfUser,
};
