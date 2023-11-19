import {
  solidityPackedKeccak256,
  Wallet,
  isAddress,
  solidityPacked,
  zeroPadValue,
  toBeHex,
} from "ethers";
import phygitalKeyPairs from "./phygital-key-pairs.json";

// const phygitalAssetContractAddress = "0xE78e41D9e55b97bE634EF28eca4E7E19622c8181";

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
    ["address", ...(nonce !== null ? ["uint256"] : [])],
    [universalProfileAddress, ...(nonce !== null ? [nonce] : [])]
  )
);

const phygitalWallet = new Wallet(phygitalKeyPairs[phygitalIdIndex].privateKey);
console.log(
  "Phygital Signature:",
  phygitalWallet.signingKey.sign(
    solidityPackedKeccak256(
      ["address", ...(nonce !== null ? ["uint256"] : [])],
      [universalProfileAddress, ...(nonce !== null ? [nonce] : [])]
    )
  ).serialized
);
