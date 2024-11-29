const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const port = 3000;
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const routeContract = require('./src/routes/ContractRoute');
const routerUser = require('./src/routes/UserRoute');
const routerPoll = require('./src/routes/PollRoute');
const routerVote = require('./src/routes/VoteRoute');
const routerSSO = require('./src/routes/SSORoute');
const voteController = require('./src/controller/VoteController'); // Import controller
const routerTheNew = require('./src/routes/TheNewRoute');
const routerUpload = require('./src/routes/UploadRoute');
const routerAI = require('./src/routes/AIRouter');
const ContentPoll = require('./src/models/ContentPoll');
const { addWeeks, isBefore } = require('date-fns');
const cron = require('node-cron');

// Tải cấu hình từ file .env
dotenv.config();

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(morgan('common'));

// Định nghĩa các route
app.use('/api/user', routerUser);
app.use('/api/poll', routerPoll);
app.use('/api/theNew', routerTheNew);
app.use('/api/vote', routerVote);
app.use('/api/auth', routerSSO);
app.use('/api/private', routeContract);
app.use('/api/upload', routerUpload);
app.use('/api/ai', routerAI);

// Kết nối MongoDB
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB);
    console.log('Connected to MongoDB successfully!');
  } catch (error) {
    console.log('Error connecting to MongoDB', error.message);
  }
};

// Đặt lịch cron để chạy mỗi phút (dễ kiểm tra khi phát triển)
cron.schedule('39 15 29 11 *', async () => {  // Chạy mỗi phút
    console.log('Running the cron job to check and delete polling');
    try {
        const polls = await ContentPoll.find();  // Lấy tất cả polling

        for (let poll of polls) {
            const currentDate = new Date();
            const pollEndDate = new Date(poll.timeEnd);
            const deleteDate = addWeeks(pollEndDate, 3);

            if (isBefore(currentDate, deleteDate)) {
                // Nếu đã đủ 3 tuần kể từ ngày kết thúc polling, xóa polling
                await ContentPoll.findByIdAndDelete(poll._id);
                console.log(`Deleted poll with ID: ${poll._id}`);
            }
        }
    } catch (error) {
        console.error("Error deleting poll:", error);
    }
});

// Thêm log khi cron được đăng ký
console.log('Cron job is scheduled and will run every minute for testing');

// Route không tìm thấy
app.use((req, res) => {
  res.status(404).send('Route not found');
});

// Tạo server HTTP với express
const server = http.createServer(app);

// Tạo instance của socket.io
const io = socketIo(server);

// Lắng nghe kết nối WebSocket từ client
io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Truyền io đến VoteController
voteController.setSocket(io);

// Khởi động server
server.listen(port, () => {
  connectToMongoDB();
  console.log(`Server is running on port ${port}`);
  console.log('Server started and cron jobs are active');
});
