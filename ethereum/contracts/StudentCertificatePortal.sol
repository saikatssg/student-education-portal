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

    // ==========================================
    // ID Card Structures
    // ==========================================
    struct IdBlock {
        string previousHash;
        string currentHash;
        string transactionDetails;
        string studentId;
        string name;
        string courseName;
        string batchCode;
        string phone;
        string email;
        string photoUrl;
        uint256 timestamp;
    }

    mapping(string => IdBlock) public idCards;
    event IdCardMinted(string idCardId, string currentHash, uint256 timestamp);

    function mintIdCard(
        string memory _transactionDetails,
        string memory _idCardId,
        string memory _studentId,
        string memory _name,
        string memory _courseName,
        string memory _batchCode,
        string memory _phone,
        string memory _email,
        string memory _photoUrl
    ) public {
        bytes32 generatedHash = keccak256(
            abi.encodePacked(
                lastBlockHash,
                _studentId,
                _idCardId,
                _courseName,
                _batchCode,
                block.timestamp
            )
        );

        string memory currentHashStr = toHexString(uint256(generatedHash), 32);

        idCards[_idCardId] = IdBlock({
            previousHash: lastBlockHash,
            currentHash: currentHashStr,
            transactionDetails: _transactionDetails,
            studentId: _studentId,
            name: _name,
            courseName: _courseName,
            batchCode: _batchCode,
            phone: _phone,
            email: _email,
            photoUrl: _photoUrl,
            timestamp: block.timestamp
        });

        lastBlockHash = currentHashStr;
        emit IdCardMinted(_idCardId, currentHashStr, block.timestamp);
    }

    // ==========================================
    // Result Structures
    // ==========================================
    struct ResultBlock {
        string previousHash;
        string currentHash;
        string transactionDetails;
        string resultId;
        string studentId;
        string batchCode;
        string examId;
        string semester;
        string marksData;
        string totalScore;
        string grade;
        uint256 timestamp;
    }

    mapping(string => ResultBlock) public results;
    event ResultMinted(string resultId, string currentHash, uint256 timestamp);

    function mintResult(
        string memory _transactionDetails,
        string memory _resultId,
        string memory _studentId,
        string memory _batchCode,
        string memory _examId,
        string memory _semester,
        string memory _marksData,
        string memory _totalScore,
        string memory _grade
    ) public {
        bytes32 generatedHash = keccak256(
            abi.encodePacked(
                lastBlockHash,
                _studentId,
                _resultId,
                _batchCode,
                _examId,
                _semester,
                block.timestamp
            )
        );

        string memory currentHashStr = toHexString(uint256(generatedHash), 32);

        results[_resultId] = ResultBlock({
            previousHash: lastBlockHash,
            currentHash: currentHashStr,
            transactionDetails: _transactionDetails,
            resultId: _resultId,
            studentId: _studentId,
            batchCode: _batchCode,
            examId: _examId,
            semester: _semester,
            marksData: _marksData,
            totalScore: _totalScore,
            grade: _grade,
            timestamp: block.timestamp
        });

        lastBlockHash = currentHashStr;
        emit ResultMinted(_resultId, currentHashStr, block.timestamp);
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
