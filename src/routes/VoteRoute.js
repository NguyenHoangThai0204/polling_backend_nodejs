const express = require("express")
const routers = express.Router();
const voteController = require("../controller/VoteController")

routers.post("/vote", voteController.createVote)
routers.post("/vote_private", voteController.createVotePrivate)

module.exports = routers;
