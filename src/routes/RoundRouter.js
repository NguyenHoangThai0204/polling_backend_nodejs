const express = require("express");
const routers = express.Router(); // Sử dụng router của express
const roundController = require("../controller/RoundPollController");

// Post: http://localhost:3000/api/round/create_round
// {
//     "roundName":"Vòng 1",
//     "roundDescription":"Vòng 1",
//     "idPollRound":[]
// }
routers.post("/create_round", roundController.createRound);

// tìm round theo tên
routers.post("/check_round", roundController.checkRoundPoll);

// Post: http://localhost:3000/api/round/get_round_by_name
// {
//     "roundName":"Vòng 1"
// }
routers.post("/get_round_by_name", roundController.getRoundCountByName);

// Post: http://localhost:3000/api/round/get_round_by_name
// {
//     "roundName":"Vòng 1"
// }
routers.post("/get_round_poll_by_name", roundController.getRoundPollByName);

// Post: http://localhost:3000/api/round/add_poll_to_round
routers.post("/add_poll_to_round", roundController.addPollToRound);

module.exports = routers;