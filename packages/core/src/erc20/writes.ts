import type { ReverseMirageWrite } from "../types.js";
import { erc20ABI } from "./erc20Abi.js";
import type { ERC20, ERC20Amount } from "./types.js";
import type { Account, PublicClient, WalletClient } from "viem";
import type { Address } from "viem/accounts";

export const erc20Transfer = async (
  publicClient: PublicClient,
  walletClient: WalletClient,
  account: Account | Address,
  args: {
    to: Address;
    amount: ERC20Amount<ERC20>;
  },
): Promise<ReverseMirageWrite<typeof erc20ABI, "transfer">> => {
  const { request, result } = await publicClient.simulateContract({
    address: args.amount.token.address,
    abi: erc20ABI,
    functionName: "transfer",
    args: [args.to, args.amount.amount],
    account,
  });
  const hash = await walletClient.writeContract(request);
  return { hash, result, request };
};

export const erc20Approve = async (
  publicClient: PublicClient,
  walletClient: WalletClient,
  account: Account | Address,
  args: {
    spender: Address;
    amount: ERC20Amount<ERC20>;
  },
): Promise<ReverseMirageWrite<typeof erc20ABI, "approve">> => {
  const { request, result } = await publicClient.simulateContract({
    address: args.amount.token.address,
    abi: erc20ABI,
    functionName: "approve",
    args: [args.spender, args.amount.amount],
    account,
  });
  const hash = await walletClient.writeContract(request);
  return { hash, result, request };
};

export const erc20TransferFrom = async (
  publicClient: PublicClient,
  walletClient: WalletClient,
  account: Account | Address,
  args: {
    from: Address;
    to: Address;
    amount: ERC20Amount<ERC20>;
  },
): Promise<ReverseMirageWrite<typeof erc20ABI, "transferFrom">> => {
  const { request, result } = await publicClient.simulateContract({
    address: args.amount.token.address,
    abi: erc20ABI,
    functionName: "transferFrom",
    args: [args.to, args.from, args.amount.amount],
    account,
  });
  const hash = await walletClient.writeContract(request);
  return { hash, result, request };
};