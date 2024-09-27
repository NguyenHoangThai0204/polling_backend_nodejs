const mongoose = require('mongoose');
const Vote = require('./Vote'); // Import the Vote model

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
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vote' }], // Reference Vote by ObjectId
});

const Option = mongoose.model('Option', optionSchema);

module.exports = Option;
