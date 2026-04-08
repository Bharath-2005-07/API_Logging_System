// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title APILogger
 * @dev Immutable API usage logging system on blockchain
 * Stores IPFS hashes of API logs with digital signatures
 */

contract APILogger {
    
    // Structs
    struct APILog {
        bytes32 ipfsHash;
        bytes signature;
        uint256 timestamp;
        address loggedBy;
        string userId;
        string endpoint;
        uint256 statusCode;
        uint256 requestSize;
        uint256 responseSize;
        bool verified;
    }
    
    struct APIUser {
        address userAddress;
        string userId;
        uint256 totalRequests;
        uint256 totalCost;
        bool isActive;
        uint256 createdAt;
    }
    
    struct BillingRecord {
        string userId;
        uint256 requestCount;
        uint256 totalCost;
        uint256 startDate;
        uint256 endDate;
        bool isPaid;
    }
    
    // State Variables
    mapping(bytes32 => APILog) public logs;
    mapping(address => APIUser) public users;
    mapping(string => bytes32[]) public userLogs;
    mapping(string => BillingRecord[]) public userBillingHistory;
    
    bytes32[] public allLogHashes;
    address public owner;
    uint256 public costPerRequest = 1000; // in wei
    uint256 public logCount = 0;
    
    // Events
    event LogCreated(
        bytes32 indexed logHash,
        string indexed userId,
        string endpoint,
        uint256 timestamp
    );
    
    event LogVerified(bytes32 indexed logHash, bool isValid);
    event UserRegistered(address indexed userAddress, string userId);
    event BillingRecorded(string indexed userId, uint256 cost);
    event CostUpdated(uint256 newCost);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyRegisteredUser() {
        require(users[msg.sender].isActive, "User not registered or inactive");
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
    }
    
    // Register User
    function registerUser(string memory _userId) public {
        require(bytes(_userId).length > 0, "User ID cannot be empty");
        require(users[msg.sender].userAddress == address(0), "User already registered");
        
        users[msg.sender] = APIUser({
            userAddress: msg.sender,
            userId: _userId,
            totalRequests: 0,
            totalCost: 0,
            isActive: true,
            createdAt: block.timestamp
        });
        
        emit UserRegistered(msg.sender, _userId);
    }
    
    // Store API Log
    function storeLog(
        bytes32 _ipfsHash,
        bytes memory _signature,
        string memory _userId,
        string memory _endpoint,
        uint256 _statusCode,
        uint256 _requestSize,
        uint256 _responseSize
    ) public onlyRegisteredUser returns (bytes32) {
        
        require(_ipfsHash != 0, "IPFS hash cannot be zero");
        require(bytes(_userId).length > 0, "User ID cannot be empty");
        require(bytes(_endpoint).length > 0, "Endpoint cannot be empty");
        
        APILog memory newLog = APILog({
            ipfsHash: _ipfsHash,
            signature: _signature,
            timestamp: block.timestamp,
            loggedBy: msg.sender,
            userId: _userId,
            endpoint: _endpoint,
            statusCode: _statusCode,
            requestSize: _requestSize,
            responseSize: _responseSize,
            verified: false
        });
        
        logs[_ipfsHash] = newLog;
        userLogs[_userId].push(_ipfsHash);
        allLogHashes.push(_ipfsHash);
        logCount++;
        
        // Update user statistics
        users[msg.sender].totalRequests++;
        users[msg.sender].totalCost += costPerRequest;
        
        emit LogCreated(_ipfsHash, _userId, _endpoint, block.timestamp);
        emit BillingRecorded(_userId, costPerRequest);
        
        return _ipfsHash;
    }
    
    // Verify Log
    function verifyLog(bytes32 _logHash) public {
        require(logs[_logHash].timestamp != 0, "Log does not exist");
        logs[_logHash].verified = true;
        emit LogVerified(_logHash, true);
    }
    
    // Get Log Details
    function getLog(bytes32 _logHash) public view returns (APILog memory) {
        require(logs[_logHash].timestamp != 0, "Log does not exist");
        return logs[_logHash];
    }
    
    // Get User Logs
    function getUserLogs(string memory _userId) public view returns (bytes32[] memory) {
        return userLogs[_userId];
    }
    
    // Get User Statistics
    function getUserStats(address _userAddress) public view returns (
        string memory userId,
        uint256 totalRequests,
        uint256 totalCost,
        bool isActive
    ) {
        require(users[_userAddress].userAddress != address(0), "User not found");
        APIUser memory user = users[_userAddress];
        return (user.userId, user.totalRequests, user.totalCost, user.isActive);
    }
    
    // Get All Logs Count
    function getLogCount() public view returns (uint256) {
        return logCount;
    }
    
    // Get All Logs
    function getAllLogs() public view returns (bytes32[] memory) {
        return allLogHashes;
    }
    
    // Update Cost Per Request
    function updateCostPerRequest(uint256 _newCost) public onlyOwner {
        require(_newCost > 0, "Cost must be greater than zero");
        costPerRequest = _newCost;
        emit CostUpdated(_newCost);
    }
    
    // Deactivate User
    function deactivateUser(address _userAddress) public onlyOwner {
        require(users[_userAddress].userAddress != address(0), "User not found");
        users[_userAddress].isActive = false;
    }
    
    // Activate User
    function activateUser(address _userAddress) public onlyOwner {
        require(users[_userAddress].userAddress != address(0), "User not found");
        users[_userAddress].isActive = true;
    }
    
    // Check if User Exists
    function userExists(address _userAddress) public view returns (bool) {
        return users[_userAddress].userAddress != address(0);
    }
    
    // Get Contract Owner
    function getOwner() public view returns (address) {
        return owner;
    }
    
    // Get User Billing History
    function getUserBillingHistory(string memory _userId) public view returns (BillingRecord[] memory) {
        return userBillingHistory[_userId];
    }
    
    // Transfer Ownership
    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "New owner cannot be zero address");
        owner = _newOwner;
    }
}
