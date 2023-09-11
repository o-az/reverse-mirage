import { type Address, getAddress } from "viem";
import type { WETH } from "./types.js";

/**
 * Creates an {@link WETH}
 */
export const createWETH = (
  address: Address,
  name: string,
  symbol: string,
  decimals: number,
  chainID: number,
): WETH => ({
  type: "weth",
  address: getAddress(address),
  name,
  symbol,
  decimals,
  chainID,
});
