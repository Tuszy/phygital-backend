// JWT
import jwt from "jsonwebtoken";

// Crypto
import {
  BytesLike,
  Contract,
  Interface,
  concat,
  toBeHex,
  toBigInt,
  zeroPadValue,
  solidityPacked,
} from "ethers";

// Interfaces
import {
  LSP0ERC725AccountABIInterface,
  LSP6KeyManagerInterface,
} from "./Interfaces";
import { INTERFACE_IDS } from "@lukso/lsp-smart-contracts";

// Constants
import { ERC725YDataKeys, OPERATION_TYPES } from "@lukso/lsp-smart-contracts";
import permissionData from "./permission";

// Wallet
import {
  controllerWallet,
  CONTROLLER_PUBLIC_KEY,
  CONTROLLER_PRIVATE_KEY,
  CHAIN_ID,
} from "./wallet";

// Signer
import { EIP191Signer } from "@lukso/eip191-signer.js";

// Validation
import {
  throwIfAddressIsNotAERC725Account,
  throwIfAddressIsNotALSP6KeyManager,
} from "./contract-validation";

// ERC725
import ERC725, { ERC725JSONSchema } from "@erc725/erc725.js";
import LSP6KeyManagerSchema from "../schema/LSP6KeyManager.json";

export class UniversalProfile {
  private _up: Contract;
  constructor(private universalProfileAddress: string) {
    this._up = new Contract(
      this.universalProfileAddress,
      LSP0ERC725AccountABIInterface,
      controllerWallet
    );
  }

  private async throwIfPermissionsAreNotSet() {
    if (!(await this.hasNecessaryPermissions()))
      throw new Error(
        `${this.universalProfileAddress} does not have the necessary permissions set.`
      );
  }

  public async init() {
    await throwIfAddressIsNotAERC725Account(this.universalProfileAddress);
    await this.throwIfPermissionsAreNotSet();
  }

  public async login(hash: string, signature: string) {
    if (!(await this._up.isValidSignature(hash, signature)))
      throw "Login failed";

    const token = jwt.sign(
      { address: this.universalProfileAddress },
      CONTROLLER_PRIVATE_KEY,
      { expiresIn: 60 * 60 * 24 } // 1 day
    );

    return token;
  }

  public async hasNecessaryPermissions() {
    try {
      const data = await this._up["getDataBatch(bytes32[])"](
        permissionData.keys
      );

      const KeyManagerERC725 = new ERC725(
        LSP6KeyManagerSchema as ERC725JSONSchema[]
      );

      return (
        KeyManagerERC725.checkPermissions(permissionData.values[0], data[0]) &&
        permissionData.values[1] === data[1]
      );
    } catch (e) {
      console.error(e);
    }

    return false;
  }

  async executeCallThroughKeyManager(
    contractInterface: Interface,
    contractAddress: string,
    functionName: string,
    ...params: any[]
  ) {
    const lsp6KeyManagerAddress = (await this._up.owner()) as string;
    await throwIfAddressIsNotALSP6KeyManager(lsp6KeyManagerAddress);

    const LSP6KeyManager = new Contract(
      lsp6KeyManagerAddress,
      LSP6KeyManagerInterface,
      controllerWallet
    );

    const encodedInterfaceCall = contractInterface.encodeFunctionData(
      functionName,
      params
    );

    const encodedExecuteCall = LSP0ERC725AccountABIInterface.encodeFunctionData(
      "execute",
      [OPERATION_TYPES.CALL, contractAddress, 0, encodedInterfaceCall]
    );

    const nonce = await LSP6KeyManager.getNonce(CONTROLLER_PUBLIC_KEY, 0);
    let encodedMessage = solidityPacked(
      ["uint256", "uint256", "uint256", "uint256", "uint256", "bytes"],
      [
        25, // LSP25_VERSION
        CHAIN_ID,
        nonce,
        0,
        0,
        encodedExecuteCall,
      ]
    );

    const eip191Signer = new EIP191Signer();
    const { signature } = await eip191Signer.signDataWithIntendedValidator(
      lsp6KeyManagerAddress,
      encodedMessage,
      CONTROLLER_PRIVATE_KEY
    );

    return await LSP6KeyManager.executeRelayCall(
      signature,
      nonce,
      0,
      encodedExecuteCall
    );
  }

  async addIssuedAsset(phygitalAssetContractAddress: string) {
    const lsp6KeyManagerAddress = (await this._up.owner()) as string;
    await throwIfAddressIsNotALSP6KeyManager(lsp6KeyManagerAddress);

    const LSP6KeyManager = new Contract(
      lsp6KeyManagerAddress,
      LSP6KeyManagerInterface,
      controllerWallet
    );

    const arrayLength = await this._up.getData(
      ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].length
    );
    const index = arrayLength !== "0x" ? toBigInt(arrayLength) : BigInt(0);

    const keys: BytesLike[] = [
      ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].length,
      concat([
        ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].index,
        zeroPadValue(toBeHex(index), 16),
      ]),
      concat([
        ERC725YDataKeys.LSP12.LSP12IssuedAssetsMap,
        phygitalAssetContractAddress,
      ]),
    ];
    const values: BytesLike[] = [
      zeroPadValue(toBeHex(index + BigInt(1)), 16),
      phygitalAssetContractAddress,
      concat([
        INTERFACE_IDS.LSP8IdentifiableDigitalAsset,
        zeroPadValue(toBeHex(index), 16),
      ]),
    ];

    const encodedSetDataCall = LSP0ERC725AccountABIInterface.encodeFunctionData(
      "setDataBatch",
      [keys, values]
    );

    const nonce = await LSP6KeyManager.getNonce(CONTROLLER_PUBLIC_KEY, 0);
    let encodedMessage = solidityPacked(
      ["uint256", "uint256", "uint256", "uint256", "uint256", "bytes"],
      [
        25, // LSP25_VERSION
        CHAIN_ID,
        nonce,
        0,
        0,
        encodedSetDataCall,
      ]
    );

    const eip191Signer = new EIP191Signer();
    const { signature } = await eip191Signer.signDataWithIntendedValidator(
      lsp6KeyManagerAddress,
      encodedMessage,
      CONTROLLER_PRIVATE_KEY
    );

    return await LSP6KeyManager.executeRelayCall(
      signature,
      nonce,
      0,
      encodedSetDataCall
    );
  }

  public get address() {
    return this.universalProfileAddress;
  }
}
