// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CertificationContract
 * @dev Smart contract for managing digital certificates on the blockchain
 */
contract CertificationContract is Ownable, ReentrancyGuard {
    
    // Certificate structure
    struct Certificate {
        string certificateHash;
        uint256 timestamp;
        address issuer;
        bool isValid;
        string metadata;
    }
    
    // Mapping from certificate hash to certificate data
    mapping(bytes32 => Certificate) public certificates;
    
    // Mapping to track if a hash has been registered
    mapping(bytes32 => bool) public hashExists;
    
    // Events
    event CertificateRegistered(bytes32 indexed hash, address indexed issuer, uint256 timestamp);
    event CertificateRevoked(bytes32 indexed hash, address indexed issuer, uint256 timestamp);
    
    // Modifier to check if certificate exists
    modifier certificateExists(bytes32 _hash) {
        require(hashExists[_hash], "Certificate does not exist");
        _;
    }
    
    // Modifier to check if certificate is valid
    modifier certificateValid(bytes32 _hash) {
        require(hashExists[_hash], "Certificate does not exist");
        require(certificates[_hash].isValid, "Certificate is not valid");
        _;
    }
    
    /**
     * @dev Register a new certificate hash
     * @param _hash The hash of the certificate data
     * @param _metadata Additional metadata about the certificate
     */
    function registerCertificate(string memory _hash, string memory _metadata) 
        external 
        onlyOwner 
        nonReentrant 
    {
        bytes32 hashBytes = keccak256(abi.encodePacked(_hash));
        
        require(!hashExists[hashBytes], "Certificate hash already exists");
        
        certificates[hashBytes] = Certificate({
            certificateHash: _hash,
            timestamp: block.timestamp,
            issuer: msg.sender,
            isValid: true,
            metadata: _metadata
        });
        
        hashExists[hashBytes] = true;
        
        emit CertificateRegistered(hashBytes, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Verify a certificate hash
     * @param _hash The hash to verify
     * @return isValid Whether the certificate is valid
     * @return timestamp When the certificate was registered
     * @return issuer Who issued the certificate
     */
    function verifyCertificate(string memory _hash) 
        external 
        view 
        returns (bool isValid, uint256 timestamp, address issuer) 
    {
        bytes32 hashBytes = keccak256(abi.encodePacked(_hash));
        
        if (!hashExists[hashBytes]) {
            return (false, 0, address(0));
        }
        
        Certificate memory cert = certificates[hashBytes];
        return (cert.isValid, cert.timestamp, cert.issuer);
    }
    
    /**
     * @dev Get certificate details
     * @param _hash The hash of the certificate
     * @return The complete certificate data
     */
    function getCertificate(string memory _hash) 
        external 
        view 
        certificateExists(keccak256(abi.encodePacked(_hash)))
        returns (Certificate memory) 
    {
        bytes32 hashBytes = keccak256(abi.encodePacked(_hash));
        return certificates[hashBytes];
    }
    
    /**
     * @dev Revoke a certificate (only owner can do this)
     * @param _hash The hash of the certificate to revoke
     */
    function revokeCertificate(string memory _hash) 
        external 
        onlyOwner 
        certificateExists(keccak256(abi.encodePacked(_hash)))
    {
        bytes32 hashBytes = keccak256(abi.encodePacked(_hash));
        
        certificates[hashBytes].isValid = false;
        
        emit CertificateRevoked(hashBytes, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Check if a certificate hash exists
     * @param _hash The hash to check
     * @return Whether the hash exists
     */
    function certificateExists(string memory _hash) external view returns (bool) {
        bytes32 hashBytes = keccak256(abi.encodePacked(_hash));
        return hashExists[hashBytes];
    }
    
    /**
     * @dev Get total number of certificates
     * @return Total count of registered certificates
     */
    function getTotalCertificates() external view returns (uint256) {
        // This would require additional tracking, simplified for now
        return 0;
    }
}











