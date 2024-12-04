// module.exports = {
//   // See <http://truffleframework.com/docs/advanced/configuration>
//   // for more about customizing your Truffle configuration!
  
//   networks: {
//     development: {
//       host: "127.0.0.1",     // Địa chỉ Ganache
//       port: 8545,            // Cổng Ganache (thường là 7545)
//       network_id: "*",       // Kết nối với mọi network
//     },
//   },
//   compilers: {
//     solc: {
//       version: "0.8.0",      // Phiên bản Solidity (hoặc phiên bản hợp lệ)
//     },
//   },
// };

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  
  networks: {
    development: {
      host: "127.0.0.1",     // Địa chỉ Ganache
      port: 8545,            // Cổng Ganache (thường là 7545)
      network_id: "*",       // Kết nối với mọi network
      gas: 6721975,          // Chỉ định gas limit
      gasPrice: 20000000000, // Chỉ định gas price (20 Gwei)
    },
  },
  
  compilers: {
    solc: {
      version: "0.8.0",      // Phiên bản Solidity (hoặc phiên bản hợp lệ)
    },
  },
};