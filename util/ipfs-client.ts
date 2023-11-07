// Crypto
import {
  keccak256,
  dataSlice,
  toUtf8Bytes,
  toUtf8String,
  hexlify,
  getBytes,
} from "ethers";

// Pinata
import PinataSDK from "@pinata/sdk";

// Constants
import { KECCAK_256_HASH_FUNCTION } from "./crypto";

const ipfsClient = new PinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

// see https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#JSONURL
export const getLSP2JSONURL = (json: Object, ipfsURL: string): string => {
  const hashFunction = dataSlice(
    keccak256(toUtf8Bytes("keccak256(utf8)")),
    0,
    4
  );
  const hashedJSON = keccak256(toUtf8Bytes(JSON.stringify(json))).substring(2);

  const hexlifiedIpfsURL = hexlify(toUtf8Bytes(ipfsURL)).substring(2);

  const jsonURL = hashFunction + hashedJSON + hexlifiedIpfsURL;

  return jsonURL;
};

export const uploadJSONToIPFSAndGetLSP2JSONURL = async (
  name: string,
  json: Object
): Promise<null | string> => {
  const cid = await uploadJSONToIPFS(name, json);
  if (!cid) return null;
  return await getLSP2JSONURL(json, `ipfs://${cid}`);
};

export const uploadJSONToIPFS = async (
  name: string,
  json: Object
): Promise<null | string> => {
  try {
    const uploadResult = await ipfsClient.pinJSONToIPFS(json, {
      pinataMetadata: {
        name: name,
      },
      pinataOptions: {
        cidVersion: 0,
      },
    });
    if (!uploadResult?.IpfsHash) return null;
    return uploadResult.IpfsHash;
  } catch (e) {
    throw Error(`Upload to IPFS failed (${e.message})`);
  }
};

export const decodeLSP2JSONURL = async (
  jsonURL: string
): Promise<null | Object> => {
  const hashFunction = jsonURL.slice(0, 10);
  const hashedJSON = "0x" + jsonURL.slice(10, 74);
  const hexlifiedIpfsURL = "0x" + jsonURL.slice(74);

  if (hashFunction !== KECCAK_256_HASH_FUNCTION) {
    console.error(
      `❌ decodeLSP2JSONURL(${jsonURL}) failed: Unsupported hash function ${hashFunction}`
    );
    return null;
  }

  const ipfsURL = toUtf8String(getBytes(hexlifiedIpfsURL));
  const response = await fetch(getURLWithIPFSGateway(ipfsURL));

  if (response.status !== 200) {
    console.error(
      `❌ decodeLSP2JSONURL(${jsonURL}) failed: Invalid IPFS url (${ipfsURL}) - HTTP Status ${response.status}`
    );
    return null;
  }

  const json = await response.json();
  const hash = hexlify(keccak256(toUtf8Bytes(JSON.stringify(json))));

  if (hash !== hashedJSON) {
    console.error(
      `❌ decodeLSP2JSONURL(${jsonURL}) failed: Different hash (${hash} != ${hashedJSON}) - HTTP Status ${response.status}`
    );
    return null;
  }

  return json;
};

export const getURLWithIPFSGateway = (ipfsURL: string): string =>
  `${process.env.IPFS_GATEWAY}/${ipfsURL.replace("ipfs://", "")}`;
