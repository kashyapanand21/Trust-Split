const fs = require('fs');
const path = require('path');

const artifactPath = path.join(__dirname, '../artifacts/contracts/TrustSplit.sol/TrustSplit.json');
const abiPath = path.join(__dirname, '../frontend/src/abi/TrustSplit.json');

const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));

console.log('✅ ABI copied successfully!');

