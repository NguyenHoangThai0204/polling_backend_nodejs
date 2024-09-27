const mongoose = require("mongoose");

// Define the Vote schema
const voteSchema = new mongoose.Schema({
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ContentVoting", // Refer to the poll this vote is related to
    required: true,
  },
  optionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  userId: {
    type: String, // The user who voted
    required: true,
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

// Define the Option schema
const optionSchema = new mongoose.Schema({
  contentOption: {
    type: String,
    required: true,
  },
  descriptionContentOption: {
    type: String,
  },
  additonalContentOption: {
    type: String,
  },
  votes: [voteSchema], // Array of votes for this option
});

// Define the Poll (ContentVoting) schema
const contentVotingSchema = new mongoose.Schema({
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
  options: [optionSchema], // Array of options available in the poll
  typeContent: {
    type: String, // Could be any classification like "public", "private", etc.
  },
});

// Create the ContentVoting model
const ContentVoting = mongoose.model("ContentVoting", contentVotingSchema);

module.exports = ContentVoting;
