var PollingSys = artifacts.require("./PollingSys.sol");

module.exports = function(deployer) {
  deployer.deploy(PollingSys);
};
