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
const routerUser = require('./src/routes/UserRoute');
const routerPoll = require('./src/routes/PollRoute');
const routerVote = require('./src/routes/VoteRoute');
const routerSSO = require('./src/routes/SSORoute');
const voteController = require('./src/controller/VoteController'); // Import controller
const routerTheNew = require('./src/routes/TheNewRoute');
const routerUpload = require('./src/routes/UploadRoute');
const routerAI = require('./src/routes/AIRouter');
const pollController = require('./src/controller/PollController');
const userController = require('./src/controller/UserController');
const theNewController = require('./src/controller/TheNewController');
const roundPoll = require('./src/routes/RoundRouter');
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
app.use('/api/upload', routerUpload);
app.use('/api/ai', routerAI);
app.use('/api/round', roundPoll);


// Route không tìm thấy
app.use((req, res) => {
  res.status(404).send('Route not found');
});

// Kết nối MongoDB  
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB);
    console.log('Connected to MongoDB successfully!');
  } catch (error) {
    console.log('Error connecting to MongoDB', error.message);
  }
};

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
pollController.setSocket(io);
userController.setSocket(io);
theNewController.setSocket(io);

// Khởi động server
server.listen(port, () => {
  connectToMongoDB();
  console.log(`Server is running on port ${port}`);
  console.log('Server started and cron jobs are active');
});
