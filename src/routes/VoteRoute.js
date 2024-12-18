const express = require("express")
const routers = express.Router();
const voteController = require("../controller/VoteController")


routers.post("/vote", voteController.createVote)
routers.post("/vote_private", voteController.createVotePrivate)
routers.post("/check_vote_private", voteController.checkVotePrivate)
routers.post("/find_all_vote_bypollid", voteController.getVotesByPollId)
routers.post("/find_vote_byuserid_pollid", voteController.getVoteByUserIdAndPollId)

module.exports = routers;
