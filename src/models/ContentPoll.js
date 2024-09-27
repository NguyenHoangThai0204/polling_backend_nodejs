const mongoose = require('mongoose');
const Option = require('./Option'); // Import the Option model

// Define the Poll (ContentVoting) schema
const contentPollSchema = new mongoose.Schema({
  authorId: {
    type: String,
    required: true, // The user who created the poll
  },
  avatar: {
    type: String, // Optional avatar for the poll
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  timeCreate: {
    type: Date,
    default: Date.now,
  },
  timeStart: {
    type: Date,
  },
  timeEnd: {
    type: Date,
  },
  options: [Option.schema], // Chỉ định kiểu dữ liệu đúng là schema của Option
  typeContent: {
    type: String, 
  },
});

const ContentPoll = mongoose.model('ContentPoll', contentPollSchema);

module.exports = ContentPoll;
