# Blockchain-based Digital Certification System

A complete system for generating and verifying digital certificates using Ethereum blockchain technology.

## Features

- **Certificate Generation**: Create digital certificates with blockchain verification
- **Certificate Verification**: Verify certificate authenticity using blockchain hashes
- **Smart Contracts**: Solidity contracts for certificate registration and verification
- **Modern UI**: React frontend with Tailwind CSS
- **Secure Backend**: Node.js + Express API with MongoDB storage

## Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Blockchain**: Ethereum (Ganache local network)
- **Smart Contracts**: Solidity + Hardhat
- **Web3**: ethers.js

## Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (local installation or MongoDB Atlas)
3. **Ganache** (for local Ethereum blockchain)
4. **MetaMask** browser extension

## Installation

1. **Clone and install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env` in backend and contracts directories
   - Update with your MongoDB URI and Ganache RPC URL

3. **Start Ganache:**
   - Launch Ganache application
   - Note the RPC URL (usually `http://127.0.0.1:7545`)

4. **Deploy smart contracts:**
   ```bash
   npm run compile
   npm run deploy
   ```

5. **Start the application:**
   ```bash
   npm run dev
   ```

## Usage

1. **Generate Certificate:**
   - Fill out the certificate form
   - Submit to create certificate on blockchain
   - Download PDF and QR code

2. **Verify Certificate:**
   - Scan QR code or enter certificate ID
   - System verifies against blockchain hash
   - Shows validation result

## Project Structure

```
blockchain/
├── contracts/          # Solidity smart contracts
├── backend/            # Node.js + Express API
├── frontend/           # React application
├── package.json        # Root package configuration
└── README.md          # This file
```

## Smart Contracts

- `CertificationContract.sol`: Main contract for certificate management
- Functions: `registerCertificate()`, `verifyCertificate()`

## API Endpoints

- `POST /api/certificates` - Generate new certificate
- `GET /api/certificates/:id` - Get certificate details
- `POST /api/certificates/verify` - Verify certificate

## Testing

```bash
npm test
```

## License

MIT


