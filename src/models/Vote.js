const mongoose = require('mongoose');

// Define the Vote schema
const voteSchema = new mongoose.Schema({
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentVoting' // Refer to the poll this vote is related to
  },
  optionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  userId: {
    type: String, // The user who voted
  },
  timestamp: {
    type: Date,
    default: Date.now, // Automatically record the time of vote
  },
  transactionHash: {
    type: String, // Optional, in case votes are recorded on the blockchain
    default: null,
  },
});

// Create the Vote model
const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;