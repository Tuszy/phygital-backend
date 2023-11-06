// Crypto
import { Contract, Interface, AbiCoder } from "ethers";

// ERC725
import ERC725, { ERC725JSONSchema } from "@erc725/erc725.js";
import LSP3ProfileMetadataSchema from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";
import LSP6KeyManagerSchema from "@erc725/erc725.js/schemas/LSP6KeyManager.json";

// Interfaces
import {
  LSP0ERC725AccountABIInterface,
  LSP6KeyManagerInterface,
} from "./Interfaces";

// Constants
import { OPERATION_TYPES } from "@lukso/lsp-smart-contracts";

// Wallet
import { controllerWallet } from "./wallet";

// Validation
import {
  throwIfAddressIsNotAERC725Account,
  throwIfAddressIsNotALSP6KeyManager,
} from "./validation";

export class UniversalProfile {
  private up: Contract;
  private erc725: ERC725;
  constructor(private universalProfileAddress: string) {
    throwIfAddressIsNotAERC725Account(this.universalProfileAddress);

    this.up = new Contract(
      this.universalProfileAddress,
      LSP0ERC725AccountABIInterface,
      controllerWallet
    );

    this.erc725 = new ERC725(
      LSP3ProfileMetadataSchema as ERC725JSONSchema[],
      this.universalProfileAddress,
      controllerWallet,
      { ipfsGateway: process.env.IPFS_GATEWAY }
    );
  }

  private async throwIfPermissionsAreNotSet(
    lsp6KeyManagerAddress: string,
    contractAddress: string
  ) {
    const { hasNecessaryPermissions } = await this.createPermissionFunctions(
      lsp6KeyManagerAddress,
      contractAddress
    );

    if (!(await hasNecessaryPermissions()))
      throw new Error(
        `KeyManager ${lsp6KeyManagerAddress} from ${this.universalProfileAddress} does not have the necessary permissions set.`
      );
  }

  public async createPermissionFunctions(
    lsp6KeyManagerAddress: string,
    contractAddress: string
  ) {
    const controllerKey = process.env.PUBLIC_KEY;
    const keyManager = new ERC725(
      LSP6KeyManagerSchema as ERC725JSONSchema[],
      lsp6KeyManagerAddress,
      controllerWallet,
      { ipfsGateway: process.env.IPFS_GATEWAY }
    );

    const permissionData = keyManager.encodeData([
      {
        keyName: "AddressPermissions:Permissions:<address>",
        dynamicKeyParts: controllerKey,
        value: keyManager.encodePermissions({ CALL: true }),
      },
      {
        keyName: "AddressPermissions:AllowedAddresses:<address>",
        dynamicKeyParts: controllerKey,
        value: [contractAddress],
      },
    ]);

    const hasNecessaryPermissions = async () => {
      const data = await this.up["getData(bytes32[])"](permissionData.keys);

      try {
        const addresses = AbiCoder.defaultAbiCoder().decode(
          ["address[]"],
          data[1]
        )[0];

        return (
          keyManager.decodePermissions(data[0]).CALL &&
          Boolean(
            addresses.find(
              (address: string) =>
                address.toLowerCase() === contractAddress.toLowerCase()
            )
          )
        );
      } catch (e) {}

      return false;
    };

    const setNecessaryPermissions = async (): Promise<boolean> => {
      try {
        const tx = await this.up["setData(bytes32[],bytes[])"](
          permissionData.keys,
          permissionData.values,
          { gasLimit: 3000000 }
        );
        await tx.wait();
        return true;
      } catch (e) {}
      return false;
    };

    return {
      hasNecessaryPermissions,
      setNecessaryPermissions,
    };
  }

  async executeCallThroughKeyManager(
    contractInterface: Interface,
    contractAddress: string,
    functionName: string,
    ...params: any[]
  ) {
    const lsp6KeyManagerAddress = (await this.erc725.getOwner()) as string;
    throwIfAddressIsNotALSP6KeyManager(lsp6KeyManagerAddress);

    await this.throwIfPermissionsAreNotSet(
      lsp6KeyManagerAddress,
      contractAddress
    );

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
    const tx = await LSP6KeyManager.execute(encodedExecuteCall);
    await tx.wait();
    return tx;
  }

  public address() {
    return this.universalProfileAddress;
  }
}
