import {
  solidityPackedKeccak256,
  Wallet,
  isAddress,
  solidityPacked,
  hexlify,
  zeroPadValue,
  toBeHex,
} from "ethers";
import phygitalKeyPairs from "./phygital-key-pairs.json";

// const phygitalAssetContractAddress = "0xc60E674211BDE37f47Ff1AB6a6b536d9E322fC1F";

const universalProfileAddress = process.argv[2];
const phygitalIdIndex = parseInt(process.argv[3]);
const nonceAsNumber = parseInt(process.argv[4]);
const nonce =
  !isNaN(nonceAsNumber) && nonceAsNumber >= 0
    ? zeroPadValue(toBeHex(nonceAsNumber), 32)
    : null;

if (
  !universalProfileAddress ||
  !isAddress(universalProfileAddress) ||
  !universalProfileAddress.startsWith("0x") ||
  universalProfileAddress.length !== 42
) {
  console.log(`1st command line argument must be a valid address`);
  process.exit(1);
}

if (
  isNaN(phygitalIdIndex) ||
  phygitalIdIndex < 0 ||
  phygitalIdIndex >= phygitalKeyPairs.length
) {
  console.log(
    `2nd command line argument must be a number [0,${phygitalKeyPairs.length}) (phygital id index)`
  );
  process.exit(2);
}

console.log(
  "SOLIDITY PACKED",
  solidityPacked(
    ["address", ...(nonce ? ["uint256"] : [])],
    [universalProfileAddress, ...(nonce ? [nonce] : [])]
  )
);

const phygitalWallet = new Wallet(phygitalKeyPairs[phygitalIdIndex].privateKey);
console.log(
  "Phygital Signature:",
  phygitalWallet.signingKey.sign(
    solidityPackedKeccak256(
      ["address", ...(nonce ? ["uint256"] : [])],
      [universalProfileAddress, ...(nonce ? [nonce] : [])]
    )
  ).serialized
);
