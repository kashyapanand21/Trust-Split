const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // ── 1. Deploy ────────────────────────────────────────────────────────────────
  console.log("Deploying TrustSplit...");

  const TrustSplit = await ethers.getContractFactory("TrustSplit");
  const trustSplit = await TrustSplit.deploy();

  // ── 2. Wait for confirmation ─────────────────────────────────────────────────
  await trustSplit.waitForDeployment();

  const deployedAddress = await trustSplit.getAddress();
  console.log(`TrustSplit deployed to: ${deployedAddress}`);

  // ── 3. Resolve paths ─────────────────────────────────────────────────────────
  const abiSourcePath = path.resolve(
    __dirname,
    "../artifacts/contracts/TrustSplit.sol/TrustSplit.json"
  );

  const frontendAbiDir = path.resolve(
    __dirname,
    "../frontend/src/abi"
  );

  const abiDestPath     = path.join(frontendAbiDir, "TrustSplit.json");
  const addressDestPath = path.join(frontendAbiDir, "address.json");

  // ── 4. Ensure frontend/src/abi directory exists ──────────────────────────────
  fs.mkdirSync(frontendAbiDir, { recursive: true });

  // ── 5. Copy ABI ───────────────────────────────────────────────────────────────
  const artifact = JSON.parse(fs.readFileSync(abiSourcePath, "utf8"));
  fs.writeFileSync(abiDestPath, JSON.stringify(artifact.abi, null, 2), "utf8");
  console.log(`ABI copied to: ${abiDestPath}`);

  // ── 6. Write address file ─────────────────────────────────────────────────────
  const addressPayload = JSON.stringify({ address: deployedAddress }, null, 2);
  fs.writeFileSync(addressDestPath, addressPayload, "utf8");
  console.log(`Address written to: ${addressDestPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
