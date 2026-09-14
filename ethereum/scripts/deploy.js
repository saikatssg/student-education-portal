import hre from "hardhat";

async function main() {
    console.log("Starting deployment...");

    // Get the contract factory
    const CertificatePortal = await hre.ethers.getContractFactory("StudentCertificatePortal");

    // Deploy the contract
    const portal = await CertificatePortal.deploy();

    // Wait for the deployment transaction to be mined
    await portal.waitForDeployment();

    // Log the deployed address
    const targetAddress = await portal.getAddress();
    console.log(`StudentCertificatePortal successfully deployed to: ${targetAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});