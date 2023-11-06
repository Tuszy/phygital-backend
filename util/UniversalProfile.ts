// Crypto
import { Contract, Interface, AddressLike } from "ethers";

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
  constructor(private universalProfileAddress: string) {}

  async executeCallThroughKeyManager(
    contractInterface: Interface,
    contractAddress: AddressLike,
    functionName: string,
    ...params: any[]
  ) {
    throwIfAddressIsNotAERC725Account(this.universalProfileAddress);
    const LSP0ERC725Account = new Contract(
      this.universalProfileAddress,
      LSP0ERC725AccountABIInterface,
      controllerWallet
    );

    const lsp6KeyManagerAddress = (await LSP0ERC725Account.owner()) as string;
    throwIfAddressIsNotALSP6KeyManager(lsp6KeyManagerAddress);

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
