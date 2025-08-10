const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.contractAddress = null;
    this.contractABI = null;
    this.isMockMode = true; // Start in mock mode
    
    this.initialize();
  }

  async initialize() {
    try {
      // For now, run in mock mode
      this.isMockMode = true;
      console.log('Blockchain service running in MOCK mode');
      
      // Try to connect to real blockchain if available
      try {
        this.provider = new ethers.JsonRpcProvider(
          process.env.GANACHE_RPC_URL || 'http://127.0.0.1:7545'
        );

        // Test connection
        await this.provider.getNetwork();
        console.log('Real blockchain connection successful');
        this.isMockMode = false;
        
        // Get signer from private key or first account
        if (process.env.PRIVATE_KEY) {
          this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        } else {
          const accounts = await this.provider.listAccounts();
          if (accounts.length > 0) {
            this.signer = this.provider.getSigner(accounts[0]);
          }
        }

        if (!this.signer) {
          throw new Error('No signer available');
        }

        // Load contract address and ABI
        await this.loadContract();

        console.log('Blockchain service initialized successfully');
        console.log('Connected to network:', await this.provider.getNetwork());
        console.log('Signer address:', await this.signer.getAddress());
        
      } catch (error) {
        console.log('Real blockchain not available, continuing in mock mode:', error.message);
        this.isMockMode = true;
      }
      
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      this.isMockMode = true;
    }
  }

  async loadContract() {
    try {
      // Try to load contract address from contracts.json
      const contractsPath = path.join(__dirname, '../../contracts/contracts.json');
      
      if (fs.existsSync(contractsPath)) {
        const contractsData = JSON.parse(fs.readFileSync(contractsPath, 'utf8'));
        this.contractAddress = contractsData.CertificationContract;
      } else {
        // Fallback to environment variable
        this.contractAddress = process.env.CONTRACT_ADDRESS;
      }

      if (!this.contractAddress) {
        throw new Error('Contract address not found. Please deploy the contract first.');
      }

      // Load contract ABI from Hardhat artifacts
      const artifactsPath = path.join(__dirname, '../../contracts/artifacts/contracts/CertificationContract.sol/CertificationContract.json');
      
      if (fs.existsSync(artifactsPath)) {
        const contractArtifact = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
        this.contractABI = contractArtifact.abi;
      } else {
        throw new Error('Contract ABI not found. Please compile the contract first.');
      }

      // Create contract instance
      this.contract = new ethers.Contract(
        this.contractAddress,
        this.contractABI,
        this.signer
      );

      console.log('Contract loaded at address:', this.contractAddress);
      
    } catch (error) {
      console.error('Failed to load contract:', error);
      throw error;
    }
  }

  async registerCertificate(certificateHash, metadata = '') {
    try {
      if (this.isMockMode) {
        // Mock implementation
        const mockResult = {
          transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          blockNumber: Math.floor(Math.random() * 1000000) + 1,
          gasUsed: Math.floor(Math.random() * 100000) + 50000,
          status: true
        };
        
        console.log('Mock: Registered certificate hash:', certificateHash);
        return mockResult;
      }

      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      console.log('Registering certificate hash:', certificateHash);
      
      // Call the smart contract
      const tx = await this.contract.registerCertificate(certificateHash, metadata);
      const receipt = await tx.wait();
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1
      };
      
    } catch (error) {
      console.error('Failed to register certificate:', error);
      throw error;
    }
  }

  async verifyCertificate(certificateHash) {
    try {
      if (this.isMockMode) {
        // Mock implementation - always return valid for now
        const mockResult = {
          isValid: true,
          blockNumber: Math.floor(Math.random() * 1000000) + 1,
          timestamp: new Date().toISOString(),
          transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`
        };
        
        console.log('Mock: Verified certificate hash:', certificateHash);
        return mockResult;
      }

      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      // Call the smart contract
      const result = await this.contract.verifyCertificate(certificateHash);
      
      return {
        isValid: result.isValid,
        blockNumber: result.blockNumber?.toNumber() || 0,
        timestamp: new Date().toISOString(),
        transactionHash: result.transactionHash || 'N/A'
      };
      
    } catch (error) {
      console.error('Failed to verify certificate:', error);
      throw error;
    }
  }

  async getCertificateDetails(certificateHash) {
    try {
      if (this.isMockMode) {
        // Mock implementation
        const mockResult = {
          exists: true,
          metadata: 'Mock certificate metadata',
          blockNumber: Math.floor(Math.random() * 1000000) + 1,
          timestamp: new Date().toISOString()
        };
        
        return mockResult;
      }

      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      // Call the smart contract
      const result = await this.contract.getCertificateDetails(certificateHash);
      
      return {
        exists: result.exists,
        metadata: result.metadata,
        blockNumber: result.blockNumber?.toNumber() || 0,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Failed to get certificate details:', error);
      throw error;
    }
  }

  async checkCertificateExists(certificateHash) {
    try {
      if (this.isMockMode) {
        // Mock implementation - always return true for now
        return true;
      }

      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      // Call the smart contract
      const exists = await this.contract.certificateExists(certificateHash);
      return exists;
      
    } catch (error) {
      console.error('Failed to check certificate existence:', error);
      throw error;
    }
  }

  async getNetworkInfo() {
    try {
      if (this.isMockMode) {
        // Mock network info
        return {
          name: 'Mock Network',
          chainId: 1337,
          blockNumber: Math.floor(Math.random() * 1000000) + 1,
          gasPrice: '20000000000'
        };
      }

      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getGasPrice();
      
      return {
        name: network.name,
        chainId: network.chainId,
        blockNumber,
        gasPrice: gasPrice.toString()
      };
      
    } catch (error) {
      console.error('Failed to get network info:', error);
      throw error;
    }
  }

  async getSignerBalance() {
    try {
      if (this.isMockMode) {
        // Mock balance
        return {
          balance: '1000000000000000000000', // 1000 ETH
          formatted: '1000.0 ETH'
        };
      }

      if (!this.signer) {
        throw new Error('Signer not initialized');
      }

      const balance = await this.signer.getBalance();
      const formatted = ethers.formatEther(balance);
      
      return {
        balance: balance.toString(),
        formatted: `${formatted} ETH`
      };
      
    } catch (error) {
      console.error('Failed to get signer balance:', error);
      throw error;
    }
  }
}

module.exports = new BlockchainService();

