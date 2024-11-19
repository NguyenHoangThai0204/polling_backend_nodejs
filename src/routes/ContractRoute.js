const express =  require("express")
const routers = express.Router();
const {Web3} = require('web3');
const fs = require('fs');

// Kết nối với Ethereum node (ví dụ: Ganache)
const web3 = new Web3('HTTP://127.0.0.1:7545');

// ABI và địa chỉ của smart contract
// Đọc ABI từ tệp JSON đã được biên dịch
const contractJSON = JSON.parse(fs.readFileSync('./src/contracts/PollingSys.json', 'utf8'));
const contractABI = contractJSON.abi;
const contractAddress = '0x13E632cb6248410747Fe085645b0149Cf440fC11';

// Tạo instance của smart contract
const myContract = new web3.eth.Contract(contractABI, contractAddress);

// Endpoint để kiểm tra kết nối
routers.get('/checkConnection', async (req, res) => {
    try {
      const accounts = await web3.eth.getAccounts();
      res.json({ message: 'Connected to smart contract', accounts });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  });
  

// Endpoint để tạo poll
routers.post('/createPoll', async (req, res) => {
    const accounts = await web3.eth.getAccounts();
    const { title, accessCode } = req.body;
    console.log("createPoll",title,accessCode, accounts[0]);
    try {
      const result = await myContract.methods.createPoll(title, accessCode.toString()).send({
        from: accounts[0],
        gas: 3000000,
      });
      res.json({ message: 'Poll created successfully', transaction: result });
    } catch (error) {
      console.error('Transaction failed:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  

// Endpoint để thêm option vào poll
routers.post('/addOption', async (req, res) => {
    const { pollId, name } = req.body;
    const accounts = await web3.eth.getAccounts();
  
    if (!pollId || !name) {
      return res.status(400).json({ error: 'Poll ID and option name are required' });
    }
  
    try {
      const result = await myContract.methods.addOptionsToPoll(pollId, name).send({ 
        from: accounts[0], 
        gas: 3000000 
      });
      res.json({ message: 'Option added successfully', transaction: result });
    } catch (error) {
      console.log('Error adding option:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  

// Endpoint để bỏ phiếu
routers.post('/vote', async (req, res) => {
    const { pollId, optionId, accessCode } = req.body;
    const accounts = await web3.eth.getAccounts();
  
    if (!pollId || !optionId || !accessCode) {
      return res.status(400).json({ error: 'Poll ID, option ID, and access code are required' });
    }
  
    try {
      const result = await myContract.methods.vote(pollId, optionId, accessCode).send({
        from: accounts[0],
        gas: 3000000,
      });
      res.json({ message: 'Vote cast successfully', transaction: result });
    } catch (error) {
      console.log('Error voting:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  

// Endpoint để lấy kết quả poll
routers.get('/getPollResult/:pollId', async (req, res) => {
    const { pollId } = req.params;
  
    if (!pollId) {
      return res.status(400).json({ error: 'Poll ID is required' });
    }
  
    try {
      const results = await myContract.methods.getPollResult(pollId).call();
      res.json({ pollId, results });
    } catch (error) {
      console.log('Error fetching poll result:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  

module.exports = routers;
