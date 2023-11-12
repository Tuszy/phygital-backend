import {
  solidityPackedKeccak256,
  isAddress,
  solidityPacked,
  zeroPadValue,
  toBeHex,
} from "ethers";

// const phygitalAssetContractAddress = "0x05459De0c9605dd69364173A46cC7483Ce1A9fd4";

// Example: Nucleo 32 L031K6

const universalProfileAddress = process.argv[2];
const nonceAsNumber = parseInt(process.argv[3]);
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

console.log(
  "SOLIDITY PACKED",
  solidityPacked(
    ["address", ...(nonce ? ["uint256"] : [])],
    [universalProfileAddress, ...(nonce ? [nonce] : [])]
  )
);

console.log(
  "Keccak256:",
  solidityPackedKeccak256(
    ["address", ...(nonce ? ["uint256"] : [])],
    [universalProfileAddress, ...(nonce ? [nonce] : [])]
  )
);
