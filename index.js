const express = require('express');
const app = express();
const port = 3000;
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const routerUser = require("./src/routes/UserRoute");
const routerPoll = require("./src/routes/PollRoute");
const routerVote = require("./src/routes/VoteRoute");

dotenv.config(); 

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
app.use('/api/vote', routerVote);

// Route không tìm thấy
app.use((req, res) => {
  res.status(404).send("Route not found");
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

app.listen(port, () => {
  connectToMongoDB();
  console.log(`Example app listening on port ${port}`);
});
