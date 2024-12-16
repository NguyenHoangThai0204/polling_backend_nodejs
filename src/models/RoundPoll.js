const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
    
    roundName: {
        type: String,
    },
    idPollRound: {
        type: [String],
        default: [], 
    },
});

const RoundPoll = mongoose.model("RoundPoll", optionSchema);
module.exports = RoundPoll;
