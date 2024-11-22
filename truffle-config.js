module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  
  networks: {
    development: {
      host: "127.0.0.1",     // Địa chỉ Ganache
      port: 7545,            // Cổng Ganache (thường là 7545)
      network_id: "*",       // Kết nối với mọi network
    },
  },
  compilers: {
    solc: {
      version: "0.8.0",      // Phiên bản Solidity (hoặc phiên bản hợp lệ)
    },
  },
};