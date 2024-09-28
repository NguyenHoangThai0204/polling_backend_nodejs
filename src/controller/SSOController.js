const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User'); 
const client = new OAuth2Client(process.env.GG_CLIENT_ID);


// POST /api/auth/google
const googleLogin = async (req, res) => {
  const { token } = req.body; // Lấy token từ request frontend gửi lên
  try {
    console.log("Received token:", token); 

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GG_CLIENT_ID,  
    });

    const payload = ticket.getPayload(); 
    console.log("Payload:", payload); 

    const email = payload.email; // Lấy email từ payload
    const avatar = payload.picture || 'default_avatar_url.png'; 
    const fullName = `${payload.family_name || ''} ${payload.given_name || ''}`.trim(); 
    const role = 'user';
    
    // Kiểm tra xem người dùng đã tồn tại trong cơ sở dữ liệu chưa
    let user = await User.findOne({ email });

    if (!user) {
      // Nếu người dùng chưa tồn tại, tạo người dùng mới mà không cần mật khẩu
      user = new User({
        email,
        password: "no-password",
        fullName,
        role,
        avatar
      });
      await user.save();
      console.log("New user created:", user); // In ra thông tin người dùng mới tạo
    } else {
      console.log("Existing user found:", user); // In ra thông tin người dùng đã tồn tại
    }

    res.status(200).json({ success: true, message: 'Login successful', data: user });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(400).json({ message: 'Google login failed', error: error.message });
  }
};

module.exports = { googleLogin };
