const { Web3 } = require("web3");
const assert = require("assert");
const PollingSys = artifacts.require("PollingSys");
const web3 = new Web3("http://127.0.0.1:7545"); // Kết nối đến Ganache
let accounts;
let pollingSys;

before(async () => {
  // Lấy tài khoản từ Ganache
  accounts = await web3.eth.getAccounts();

  // Triển khai hợp đồng PollingSys
  pollingSys = await PollingSys.deployed();
});

contract("PollingSys", (accounts) => {
  const [author, voter1, voter2] = accounts;

  it("should create a poll", async () => {
    const title = "Favorite Programming Language";

    await pollingSys.createPoll(title, { from: author });

    const pollCount = await pollingSys.pollCount();
    const poll = await pollingSys.polls(pollCount);

    assert.equal(
      poll.id.toNumber(),
      pollCount.toNumber(),
      "Poll ID does not match"
    );
    assert.equal(poll.author, author, "Author address does not match");
    assert.equal(poll.title, title, "Poll title does not match");
    assert.equal(poll.state.toNumber(), 0, "Poll state should be 'created'");
  });

  it("should add options to a poll", async () => {
    const pollId = 1;

    await pollingSys.addOptionsToPoll(pollId, "JavaScript", { from: author });
    await pollingSys.addOptionsToPoll(pollId, "Python", { from: author });

    const poll = await pollingSys.polls(pollId);
    const option1 = await pollingSys.getOptionById(pollId, 1);
    const option2 = await pollingSys.getOptionById(pollId, 2);

    assert.equal(poll.optionsCount.toNumber(), 2, "Options count mismatch");
    assert.equal(option1.name, "JavaScript", "Option 1 name mismatch");
    assert.equal(option2.name, "Python", "Option 2 name mismatch");
  });

  it("should change poll state to voting", async () => {
    const pollId = 1;

    await pollingSys.changePollState(pollId, 1, { from: author }); // Change to "voting"
    const poll = await pollingSys.polls(pollId);

    assert.equal(poll.state.toNumber(), 1, "Poll state should be 'voting'");
  });

  it("should allow users to vote", async () => {
    const title = "Favorite Programming Language";
    const option1 = "JavaScript";
    const option2 = "Python";
    await pollingSys.createPoll(title, { from: author });
    await pollingSys.addOptionsToPoll(2, option1, { from: author });
    await pollingSys.addOptionsToPoll(2, option2, { from: author });

    await pollingSys.changePollState(2, 1, { from: author }); // Change to 'voting' state

    await pollingSys.vote(2, 1, { from: voter1 });
    await pollingSys.vote(2, 2, { from: voter2 });

    const voteCountOption1 = await pollingSys.getVoteCount(2, 1);
    const voteCountOption2 = await pollingSys.getVoteCount(2, 2);

    assert.equal(
      voteCountOption1.toString(),
      "1",
      "Option 1 should have 1 vote"
    );
    assert.equal(
      voteCountOption2.toString(),
      "1",
      "Option 2 should have 1 vote"
    );
  });
  it("should not allow the same user to vote twice", async () => {
    const title = "Favorite Programming Language";
    const option1 = "JavaScript";
    const option2 = "Python";
    await pollingSys.createPoll(title, { from: author });
    await pollingSys.addOptionsToPoll(3, option1, { from: author });
    await pollingSys.addOptionsToPoll(3, option2, { from: author });

    await pollingSys.changePollState(3, 1, { from: author }); // Change to 'voting' state

    await pollingSys.vote(3, 1, { from: voter1 });

    try {
      await pollingSys.vote(3, 2, { from: voter1 }); // Attempt to vote again
      assert.fail("Voter should not be allowed to vote twice");
    } catch (err) {
      assert(
        err.message.includes("Voter has already voted"),
        "Error should contain 'Voter has already voted'"
      );
    }
  });
  it("should not allow voting outside the voting phase", async () => {
    const pollId = 1;

    await pollingSys.changePollState(pollId, 2, { from: author }); // Change to "finished"

    try {
      await pollingSys.vote(pollId, 1, { from: voter1 });
      assert.fail("Should not allow voting in 'finished' state");
    } catch (error) {
      assert(
        error.message.includes("Poll is not in the voting phase"),
        "Expected voting phase error"
      );
    }
  });

  it("should return poll results correctly", async () => {
    const pollTitle = "Favorite Programming Language";
    const option1 = "JavaScript";
    const option2 = "Python";
    // Create poll and add options
    await pollingSys.createPoll(pollTitle, { from: author });
    await pollingSys.addOptionsToPoll(4, option1, { from: author });
    await pollingSys.addOptionsToPoll(4, option2, { from: author });

    // Change poll state to voting
    await pollingSys.changePollState(4, 1, { from: author });

    // Voters cast their votes
    await pollingSys.vote(4, 1, { from: voter1 });
    await pollingSys.vote(4, 2, { from: voter2 });

    // Fetch poll results
    const result = await pollingSys.getPollResult(4);

    // Destructure the result (web3.js returns BigNumber)
    const optionIds = result[0].map((id) => id.toString()); // Convert BigNumber to string
    const voteCounts = result[1].map((count) => count.toString()); // Convert BigNumber to string

    // Check the option IDs and vote counts
    assert.equal(optionIds[0], "1", "First option id should be 1");
    assert.equal(optionIds[1], "2", "Second option id should be 2");
    assert.equal(voteCounts[0], "1", "Vote count for option 1 should be 1");
    assert.equal(voteCounts[1], "1", "Vote count for option 2 should be 1");
});

});
