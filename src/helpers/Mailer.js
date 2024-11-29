const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

// Kiểm tra cài đặt biến môi trường
if (!process.env.EMAIL || !process.env.PASSWORD) {
  console.error("Missing environment variables: EMAIL or PASSWORD");
  process.exit(1); // Dừng chương trình nếu thiếu cài đặt quan trọng
}

// Tạo transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Sử dụng Gmail
  secure: true, // Dùng cổng bảo mật 465
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

// Hàm gửi email
const sendMail = async (email, subject, content) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: subject,
      html: content, // Nội dung dạng HTML
    };

    // Gửi mail với async/await
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);

    // Trả về thông tin email đã gửi thành công
    return {
      success: true,
      message: `Email sent to ${email}`,
      info,
    };
  } catch (err) {
    console.error("Error sending email: ", err);

    // Trả về lỗi
    return {
      success: false,
      message: `Failed to send email to ${email}`,
      error: err,
    };
  }
};

module.exports = { sendMail };
