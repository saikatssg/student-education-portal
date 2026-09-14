import "@nomicfoundation/hardhat-toolbox";

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
    solidity: "0.8.19", // Make sure this matches your contract's version
    networks: {
        ganache: {
            url: "http://127.0.0.1:7545"
            
        }
    }
};

export default config;