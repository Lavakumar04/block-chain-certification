const hre = require("hardhat");

async function main() {
  console.log("Deploying CertificationContract...");

  // Get the contract factory
  const CertificationContract = await hre.ethers.getContractFactory("CertificationContract");
  
  // Deploy the contract
  const certificationContract = await CertificationContract.deploy();
  
  // Wait for deployment to finish
  await certificationContract.waitForDeployment();
  
  const address = await certificationContract.getAddress();
  
  console.log("CertificationContract deployed to:", address);
  console.log("Contract address:", address);
  
  // Save the contract address for frontend/backend use
  const fs = require('fs');
  const contractsDir = __dirname + "/../contracts.json";
  
  if (!fs.existsSync(__dirname + "/../")) {
    fs.mkdirSync(__dirname + "/../");
  }
  
  fs.writeFileSync(
    contractsDir,
    JSON.stringify({ CertificationContract: address }, undefined, 2)
  );
  
  console.log("Contract address saved to contracts.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });






