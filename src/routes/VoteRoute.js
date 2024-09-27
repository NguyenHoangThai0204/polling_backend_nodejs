const express = require("express")
const routers = express.Router();
const voteController = require("../controller/VoteController")

routers.post("/vote", voteController.createVote)

module.exports = routers;
