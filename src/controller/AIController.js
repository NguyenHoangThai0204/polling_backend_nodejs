const axios = require("axios");

// URL chính xác của Hugging Face API cho mô hình phân tích cảm xúc
const HUGGINGFACE_API_URL =
  "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english";

// Đảm bảo bạn đã cài đặt openai
const { OpenAI } = require("openai");
require("dotenv").config(); // Để sử dụng biến môi trường từ file .env

// Khởi tạo OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.checkEthicalStandards = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).send({ message: "Vui lòng cung cấp văn bản để phân tích." });
  }

  try {
    // Tạo yêu cầu với mô hình OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Hoặc mô hình bạn muốn sử dụng
      messages: [
        { role: "system", content: "Bạn là một trợ lý AI thông minh." },
        { role: "user", content: `Phân tích nội dung sau: "${text}"` },
      ],
    });

    // Lấy kết quả từ phản hồi của OpenAI API
    const result = response.choices[0].message.content.trim();
    res.status(200).json({ result });
  } catch (error) {
    console.error("Lỗi API:", error.message);
    res.status(500).json({ error: "Đã xảy ra lỗi khi xử lý yêu cầu." });
  }
};
exports.checkEthicalStandards_HUGGINGFACE_API_URL = async (req, res) => {
  const { text } = req.body; // Văn bản cần phân tích

  // Kiểm tra nếu không có văn bản được cung cấp
  if (!text) {
    return res.status(400).send({ message: 'Vui lòng cung cấp văn bản cần phân tích.' });
  }

  const requestBody = {
    inputs: [text], // Đảm bảo 'text' được gửi dưới dạng mảng
  };
  console.log("requestBody", requestBody);

  // Hàm để gửi yêu cầu và xử lý phản hồi từ API Hugging Face
  const makeRequest = async (retries) => {
    try {
      // Gửi yêu cầu POST đến Hugging Face API
      const response = await axios.post(HUGGINGFACE_API_URL, requestBody, {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`, // Sử dụng API Key từ biến môi trường
          'Content-Type': 'application/json' // Đảm bảo định dạng JSON
        },
      });

      // In toàn bộ phản hồi từ API để kiểm tra dữ liệu
      console.log("Full response data:", response.data);

      const data = response.data;

      // Kiểm tra xem phản hồi có dữ liệu không
      if (!data || !data[0]) {
        return res.status(500).send({ message: 'Không nhận được kết quả phân tích từ Hugging Face API.' });
      }

      const sentimentData = data[0]; // Lấy kết quả phân tích cảm xúc

      // Chọn nhãn có điểm số cao nhất
      const sentiment = sentimentData[0].score > sentimentData[1].score ? sentimentData[0].label : sentimentData[1].label;

      // Trả kết quả phân tích về frontend
      res.json({ sentiment });
    } catch (error) {
      // In thông tin chi tiết về lỗi để debug
      console.log('Response Error:', error.response ? error.response.data : error.message);

      // Thử lại nếu gặp lỗi 503
      if (error.response && error.response.status === 503 && retries > 0) {
        console.log(`Retrying... (${retries} retries left)`);
        setTimeout(() => makeRequest(retries - 1), 1000); // Thử lại sau 1 giây
      } else {
        console.error('Lỗi khi gọi Hugging Face API:', error);
        if (error.response) {
          // Nếu có phản hồi từ API, hiển thị mã lỗi
          res.status(error.response.status).send({ message: error.response.data.error.message });
        } else {
          // Nếu không có phản hồi (ví dụ: kết nối không thành công)
          res.status(500).send({ message: 'Lỗi hệ thống khi phân tích văn bản.' });
        }
      }
    }
  };

  makeRequest(3); // Thử lại tối đa 3 lần
};
// Hàm kiểm tra kết nối với Hugging Face API
async function checkConnection() {
  try {
    // Gửi yêu cầu GET đến API để kiểm tra kết nối
    const response = await axios.get(HUGGINGFACE_API_URL, {
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`, // Kiểm tra kết nối với Hugging Face API
      },
    });

    if (response.status === 200) {
      console.log("Kết nối với Hugging Face API thành công!");
      return true;
    } else {
      console.error(
        "Kết nối không thành công, mã trạng thái:",
        response.status
      );
      return false;
    }
  } catch (error) {
    console.error("Lỗi khi kết nối với Hugging Face API:", error.message);
    return false;
  }
}

// Export hàm checkConnection
exports.checkConnection = checkConnection;
