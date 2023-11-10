// Crypto
import { Contract, Interface } from "ethers";

// Interfaces
import {
  LSP0ERC725AccountABIInterface,
  LSP6KeyManagerInterface,
} from "./Interfaces";

// Constants
import { OPERATION_TYPES } from "@lukso/lsp-smart-contracts";
import permissionData from "./permission";

// Wallet
import { controllerWallet } from "./wallet";

// Validation
import {
  throwIfAddressIsNotAERC725Account,
  throwIfAddressIsNotALSP6KeyManager,
} from "./contract-validation";
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

  public async hasNecessaryPermissions() {
    try {
      const data = await this._up["getDataBatch(bytes32[])"](
        permissionData.keys
      );
      return (
        permissionData.values[0] === data[0] &&
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

    console.log("Encoded function: ", encodedInterfaceCall);

    const encodedExecuteCall = LSP0ERC725AccountABIInterface.encodeFunctionData(
      "execute",
      [OPERATION_TYPES.CALL, contractAddress, 0, encodedInterfaceCall]
    );

    console.log("Encoded execution function: ", encodedInterfaceCall);

    return await LSP6KeyManager.execute(encodedExecuteCall);
  }

  public get address() {
    return this.universalProfileAddress;
  }
}
