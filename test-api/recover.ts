import { recoverAddress } from "ethers";

const hash = process.argv[2];
const phygitalSignature = process.argv[3];

if (!hash || !hash.startsWith("0x") || hash.length !== 66) {
  console.log(`1st command line argument must be a valid keccak256 hash`);
  process.exit(1);
}

if (
  !phygitalSignature ||
  !phygitalSignature.startsWith("0x") ||
  phygitalSignature.length !== 132
) {
  console.log(`2nd command line argument must be a valid signature`);
  process.exit(1);
}

console.log("Recovered Address:", recoverAddress(hash, phygitalSignature));
