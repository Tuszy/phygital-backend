// Crypto
import { Contract, Interface, AddressLike } from "ethers";

// Interfaces
import {
  LSP0ERC725AccountABIInterface,
  LSP6KeyManagerInterface,
} from "./Interfaces";

// Wallet
import { controllerWallet } from "./wallet";

export class UniversalProfile {
  constructor(private universalProfileAddress: string) {}

  async executeCallThroughKeyManager(
    contractInterface: Interface,
    contractAddress: AddressLike,
    functionName: string,
    ...params: any[]
  ) {
    const LSP0ERC725Account = new Contract(
      this.universalProfileAddress,
      LSP0ERC725AccountABIInterface,
      controllerWallet
    );

    const lsp6KeyManagerAddress = (await LSP0ERC725Account.owner()) as string;

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
      [0, contractAddress, 0, encodedInterfaceCall]
    );
    const tx = await LSP6KeyManager.execute(encodedExecuteCall);
    await tx.wait();
    return tx;
  }

  public address() {
    return this.universalProfileAddress;
  }
}
