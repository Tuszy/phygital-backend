// Crypto
import { Contract, Interface, AddressLike } from "ethers";

// ABI
import { abi as LSP0ERC725AccountABI } from "@lukso/lsp-smart-contracts/artifacts/LSP0ERC725Account.json";
import { abi as LSP6KeyManagerABI } from "@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json";

// Interfaces
const LSP0ERC725AccountABIInterface = new Interface(LSP0ERC725AccountABI);
const LSP6KeyManagerInterface = new Interface(LSP6KeyManagerABI);

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
