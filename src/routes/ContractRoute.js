const express = require("express");
const routers = express.Router();
const { Web3 } = require("web3");
const fs = require("fs");
const web3Validator = require("web3-validator");

console.log(web3Validator);
// Kết nối với Ethereum node (ví dụ: Ganache)
const web3 = new Web3("HTTP://127.0.0.1:7545");

// ABI và địa chỉ của smart contract
// Đọc ABI từ tệp JSON đã được biên dịch
const contractJSON = JSON.parse(
  fs.readFileSync("./build/contracts/PollingSys.json", "utf8")
);
const contractABI = contractJSON.abi;
const contractAddress = "0x15B1B59f1437431E2A811B74eEDa132E817a6d82";

// Tạo instance của smart contract
const myContract = new web3.eth.Contract(contractABI, contractAddress);

// Endpoint để kiểm tra kết nối
routers.get("/checkConnection", async (req, res) => {
  try {
    const accounts = await web3.eth.getAccounts();
    res.json({ message: "Connected to smart contract", accounts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// routers.post('/createPoll', async (req, res) => {
//     const accounts = await web3.eth.getAccounts();
//     const { title } = req.body;

//     console.log("createPoll", title, accounts[0]);

//     try {
//       // Gửi giao dịch đến blockchain
//       const result = await myContract.methods.createPoll(title).send({
//         from: accounts[0],
//         gas: 3000000,
//       });

//       // Chuyển đổi kết quả thành JSON hợp lệ, xử lý BigInt
//       const serializedResult = JSON.parse(
//         JSON.stringify(result, (_, value) =>
//           typeof value === "bigint" ? value.toString() : value
//         )
//     );
//       // Trả về kết quả giao dịch
//       res.json({ message: 'Poll created successfully', transaction: serializedResult });
//     } catch (error) {
//       console.error('Transaction failed:', error.message);
//       res.status(500).json({ error: error.message });
//     }
//   });
routers.post("/createPoll", async (req, res) => {
  const { title, author } = req.body; // Nhận địa chỉ author từ body

  // Kiểm tra thông tin đầu vào
  if (!title || !author) {
    return res
      .status(400)
      .json({ error: "Title and author address are required" });
  }

  // Kiểm tra định dạng địa chỉ Ethereum
  if (!web3Validator.isAddress(author)) {
    return res
      .status(400)
      .json({ error: "Invalid Ethereum address for author" });
  }

  console.log("createPoll", title, author);

  try {
    const balanceBefore = await web3.eth.getBalance(author);
    // Gửi giao dịch đến blockchain
    const result = await myContract.methods.createPoll(title).send({
      from: author, // Sử dụng địa chỉ author
      gas: 3000000,
    });

    // Chuyển đổi kết quả thành JSON hợp lệ, xử lý BigInt
    const serializedResult = JSON.parse(
      JSON.stringify(result, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );
    const balanceAfter = await web3.eth.getBalance(author);
    // Trả về kết quả giao dịch
    res.json({
      message: "Poll created successfully",
      transaction: serializedResult,
    });
    console.log("Balance before:", balanceBefore);
    console.log("Balance after:", balanceAfter);
  } catch (error) {
    console.error("Transaction failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});

routers.post("/addOption", async (req, res) => {
  const { pollId, name, author } = req.body; // Nhận thêm author từ body

  // Kiểm tra đầu vào
  if (!pollId || !name || !author) {
    return res
      .status(400)
      .json({ error: "Poll ID, option name, and author address are required" });
  }

  // Kiểm tra địa chỉ Ethereum hợp lệ
  if (!web3Validator.isAddress(author)) {
    return res
      .status(400)
      .json({ error: "Invalid Ethereum address for author" });
  }

  try {
    // Gửi giao dịch đến blockchain
    const result = await myContract.methods
      .addOptionsToPoll(pollId, name)
      .send({
        from: author, // Sử dụng địa chỉ author
        gas: 3000000,
      });

    // Chuyển đổi kết quả thành JSON hợp lệ, xử lý BigInt
    const serializedResult = JSON.parse(
      JSON.stringify(result, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    // Trả về kết quả giao dịch
    res.json({
      message: "Option added successfully",
      transaction: serializedResult,
    });
  } catch (error) {
    console.log("Error adding option:", error.message);
    res.status(500).json({ error: error.message });
  }
});

routers.post("/poll/:pollId/change-state", async (req, res) => {
  const { pollId } = req.params;
  const { newState, author } = req.body; // newState: trạng thái mới, author: người gọi

  if (!pollId || isNaN(pollId)) {
    return res.status(400).json({ error: "Invalid poll ID" });
  }

  if (!newState || isNaN(newState)) {
    return res.status(400).json({ error: "Invalid new state" });
  }

  if (!author || !web3Validator.isAddress(author)) {
    return res.status(400).json({ error: "Invalid Ethereum address" });
  }

  try {
    // Gửi giao dịch để thay đổi trạng thái
    const result = await myContract.methods
      .changePollState(pollId, newState)
      .send({
        from: author,
      });

    // Chuyển đổi kết quả thành JSON hợp lệ, xử lý BigInt
    const serializedResult = JSON.parse(
      JSON.stringify(result, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    // Trả về kết quả giao dịch
    res.json({
      message: "Poll state changed successfully",
      transaction: serializedResult,
    });
  } catch (error) {
    console.error("Error changing poll state:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint để vote
routers.post("/vote/:pollId", async (req, res) => {
  const { pollId } = req.params;
  const { optionId, author } = req.body;

  if (!pollId || isNaN(pollId)) {
    return res.status(400).json({ error: "Poll ID must be a valid number" });
  }
  if (!optionId || isNaN(optionId)) {
    return res.status(400).json({ error: "Option ID must be a valid number" });
  }
  if (!author || !web3Validator.isAddress(author)) {
    return res
      .status(400)
      .json({ error: "Invalid Ethereum address for author" });
  }

  try {
    // Gửi giao dịch
    const result = await myContract.methods.vote(pollId, optionId).send({
      from: author,
      gas: 3000000,
    });

    // Chuyển đổi kết quả thành JSON hợp lệ, xử lý BigInt
    const serializedResult = JSON.parse(
      JSON.stringify(result, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    res.json({
      message: "Vote cast successfully",
      transaction: serializedResult,
    });
  } catch (error) {
    console.error("Error voting:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint để lấy kết quả poll
routers.get("/getPollResult/:pollId", async (req, res) => {
  const { pollId } = req.params;

  // Kiểm tra đầu vào
  if (!pollId || isNaN(pollId)) {
    return res.status(400).json({ error: "Poll ID must be a valid number" });
  }

  try {
    // Gọi hàm `getPollResult` từ smart contract
    const result = await myContract.methods.getPollResult(pollId).call();

    // Xử lý kết quả trả về
    const { 0: optionIds, 1: voteCounts } = result;

    // Chuyển kết quả thành định dạng dễ đọc
    const formattedResults = optionIds.map((optionId, index) => ({
      optionId: Number(optionId),
      voteCount: Number(voteCounts[index]),
    }));

    res.json({
      pollId: Number(pollId),
      results: formattedResults,
    });
  } catch (error) {
    console.error("Error fetching poll results:", error.message);
    res.status(500).json({ error: error.message });
  }
});

routers.get("/getOptionById/:pollId/:optionId", async (req, res) => {
  const { pollId, optionId } = req.params;

  // Kiểm tra đầu vào
  if (!pollId || isNaN(pollId) || !optionId || isNaN(optionId)) {
    return res.status(400).json({ error: "Poll ID and Option ID must be valid numbers" });
  }

  try {
    // Gọi hàm `getOptionById` từ smart contract
    const option = await myContract.methods.getOptionById(pollId, optionId).call();

    res.json({
      pollId: Number(pollId),
      optionId: Number(optionId),
      option: {
        id: Number(option.id),
        name: option.name,
        voteCount: Number(option.voteCount),
      },
    });
  } catch (error) {
    console.error("Error fetching option by ID:", error.message);
    res.status(500).json({ error: error.message });
  }
});


module.exports = routers;
