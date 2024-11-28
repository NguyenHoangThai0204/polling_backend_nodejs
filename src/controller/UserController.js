const User = require("../models/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

const updateUser = async (req, res) => {
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
    } = req.body; // Lấy các dữ liệu từ body request

    const { id } = req.params; // Lấy ID từ params

    // Kiểm tra xem ID có được cung cấp không
    if (!id) {
      return res.status(400).json({
        status: "Err",
        message: "ID is required in params.",
      });
    }

    // Tìm user cần cập nhật
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: "Err",
        message: "User not found.",
      });
    }

    // Cập nhật các thông tin nếu được gửi
    if (email) user.email = email;
    if (password) user.password = password; // Nên hash mật khẩu trước khi lưu
    if (fullName) user.fullName = fullName;
    if (role) user.role = role;
    if (status) user.status = status;
    if (province) user.province = province; // Cập nhật tỉnh
    if (district) user.district = district; // Cập nhật quận
    if (ward) user.ward = ward; // Cập nhật phường
    if (street) user.street = street; // Cập nhật đường
    if (avatar) user.avatar = avatar; // Lưu URL avatar từ body
    if (phone) user.phone = phone; // Cập nhật số điện thoại
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth); // Chuyển về kiểu Date nếu cần

    // Lưu các thay đổi vào database
    await user.save();

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
};const signUpWithGmail = (req, res) => {
  const { userEmail } = req.body;

  const config = {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  };

  const transporter = nodemailer.createTransport(config);

  const MailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: 'HỆ THỐNG BÌNH CHỌN T&M',
      link: 'https://mailgen.js/',
    },
  });

  const response = {
    body: {
      name: 'HỆ THỐNG BÌNH CHỌN',
      intro: 'ĐĂNG KÝ THÀNH CÔNG !!!',
      action: {
        instructions: 'Để tiếp tục, vui lòng truy cập trang đăng nhập bằng cách nhấn vào nút bên dưới:',
        button: {
          color: '#22BC66',
          text: 'Đăng nhập vào tài khoản của bạn',
          link: 'http://localhost:3000/api/user/login', // Link đến trang đăng nhập
        },
      },
      outro: "Nếu bạn cần hỗ trợ hoặc có thắc mắc, vui lòng trả lời email này, chúng tôi sẵn sàng giúp đỡ.",
    },
  };

  const mail = MailGenerator.generate(response);

  const message = {
    from: process.env.EMAIL,
    to: userEmail,
    subject: 'ĐĂNG KÝ THÀNH CÔNG',
    html: mail,
  };

  transporter
    .sendMail(message)
    .then(() => {
      return res.status(201).json({
        msg: 'Bạn sẽ nhận được email xác nhận.',
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
    if (checkUser !== null) {
      return res.status(500).json({
        status: "Err",
        message: "email is already defined.",
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
  signUpWithGmail,
  updateUser,
};

