import dotenv from "dotenv";
import Safe, { EthersAdapter } from "@safe-global/protocol-kit";
import { OperationType } from "@safe-global/safe-core-sdk-types";
import * as ethers from "ethers";
import { SAFE_OWNER, SAFE_WALLET, TENDERLY_FORK_ID } from "./constants";

dotenv.config();

const TENDERLY_RPC_URL = "https://rpc.tenderly.co/fork/" + TENDERLY_FORK_ID;

const PROVIDER = new ethers.providers.JsonRpcProvider(TENDERLY_RPC_URL);
const SAFE_OWNER_SIGNER = PROVIDER.getSigner(SAFE_OWNER);
export async function executeEnsoShortcut(
  to: string,
  data: string,
  value: string
) {
  const snap = await PROVIDER.send("evm_snapshot", []);
  try {
    const safeSdk = await Safe.create({
      ethAdapter: new EthersAdapter({
        ethers,
        signerOrProvider: SAFE_OWNER_SIGNER,
      }),
      safeAddress: SAFE_WALLET,
    });
    const safeTransaction = await safeSdk.createTransaction({
      safeTransactionData: {
        to,
        data,
        value,
        operation: OperationType.DelegateCall, // required for security
      },
    });
    const { hash, transactionResponse } = await safeSdk.executeTransaction(
      safeTransaction,
      {
        gasLimit: Number(30_000_000).toString(),
      }
    );
    let success = false;
    try {
      success = (await transactionResponse?.wait())?.status === 1;
    } catch (e) {}
    return { hash, success };
  } catch (e) {
    throw e;
  } finally {
    await PROVIDER.send("evm_revert", [snap]);
  }
}
