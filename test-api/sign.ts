import { BytesLike, Wallet, isAddress } from "ethers";
import phygitalKeyPairs from "./phygital-key-pairs.json";
import { keccak256 } from "../util/crypto";

// const phygitalAssetContractAddress = "0x3e0c0A775052d205bC7189BE61b0Aa8DEeC254e7";

const universalProfileAddress = process.argv[2];
const phygitalIdIndex = parseInt(process.argv[3]);

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

const phygitalWallet = new Wallet(phygitalKeyPairs[phygitalIdIndex].privateKey);
console.log(
  "Phygital Signature:",
  phygitalWallet.signingKey.sign(keccak256("address")(universalProfileAddress))
    .serialized
);
