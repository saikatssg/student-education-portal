// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract StudentCertificatePortal {

    // The core data structure requested for the blockchain
    struct CertificateBlock {
        string previousHash;
        string currentHash;
        string transactionDetails;
        string studentId;
        string name;
        string certificateId;
        string marksScore;
        string grade;
        string courseName;
        string phone;
        string email;
        uint256 timestamp;
    }

    // Map certificate IDs to their blockchain record
    mapping(string => CertificateBlock) public certificates;

    // Track the hash of the last generated certificate to link the chain
    string public lastBlockHash;

    event CertificateMinted(string certificateId, string currentHash, uint256 timestamp);

    constructor() {
        // Initialize the genesis hash
        lastBlockHash = "GENESIS_BLOCK_0000000000000000000000000000";
    }

    // Function to generate and store a new certificate block
    function mintCertificate(
        string memory _transactionDetails,
        string memory _studentId,
        string memory _name,
        string memory _certificateId,
        string memory _marksScore,
        string memory _grade,
        string memory _courseName,
        string memory _phone,
        string memory _email
    ) public {
        
        // Generate a pseudo-hash for the current block data
        bytes32 generatedHash = keccak256(
            abi.encodePacked(
                lastBlockHash,
                _studentId,
                _certificateId,
                _marksScore,
                _grade,
                block.timestamp
            )
        );

        string memory currentHashStr = toHexString(uint256(generatedHash), 32);

        // Create the new certificate block
        certificates[_certificateId] = CertificateBlock({
            previousHash: lastBlockHash,
            currentHash: currentHashStr,
            transactionDetails: _transactionDetails,
            studentId: _studentId,
            name: _name,
            certificateId: _certificateId,
            marksScore: _marksScore,
            grade: _grade,
            courseName: _courseName,
            phone: _phone,
            email: _email,
            timestamp: block.timestamp
        });

        // Update the last hash for the next block
        lastBlockHash = currentHashStr;

        emit CertificateMinted(_certificateId, currentHashStr, block.timestamp);
    }

    // Helper function to convert bytes32 to string
    function toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = bytes1(uint8(48 + uint8(value & 15) + (uint8(value & 15) > 9 ? 39 : 0)));
            value >>= 4;
        }
        return string(buffer);
    }
}
