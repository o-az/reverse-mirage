import type {
  Chain,
  Client,
  Hex,
  ReadContractParameters,
  Transport,
} from "viem";
import { solmateErc20ABI as solmateERC20ABI } from "../../generated.js";
import type { ReverseMirage } from "../../types/rm.js";
import type { BaseERC20, ERC20, ERC20Permit } from "../types.js";
import { createERC20, createERC20Permit } from "../utils.js";
import { getERC20 } from "./getERC20.js";
import { getERC20DomainSeparator } from "./getERC20DomainSeparator.js";
import { getERC20Permit } from "./getERC20Permit.js";

export type GetIsERC20PermitParameters = Omit<
  ReadContractParameters<typeof solmateERC20ABI, "name">,
  "address" | "abi" | "functionName" | "args"
> & {
  erc20: Pick<BaseERC20, "address" | "chainID"> &
    Partial<Pick<BaseERC20, "blockCreated">> &
    Partial<Pick<ERC20Permit, "version">>;
};

export type GetIsERC20PermitReturnType = ERC20 | ERC20Permit;

/**
 * Returns either a {@link ERC20} or {@link ERC20Permit} depending on whether the specified token implements EIP 2616
 *
 * Implementation is determined by checking if calling `DOMAIN_SEPARATOR()` reverts
 */
export const getIsERC20Permit = <
  TChain extends Chain | undefined,
  T extends "select" | undefined,
>(
  client: Client<Transport, TChain>,
  args: GetIsERC20PermitParameters,
  type?: T,
): ReverseMirage<
  [[string, string, number], Hex] | [[string, string, number]],
  GetIsERC20PermitReturnType,
  T
> =>
  (type === undefined
    ? Promise.all([
        getERC20Permit(client, args),
        getERC20DomainSeparator(client, args),
      ])
        .then(([erc20]) => erc20)
        .catch(() => getERC20(client, args))
    : {
        read: async () => {
          try {
            return await Promise.all([
              getERC20Permit(client, args, "select").read(),
              getERC20DomainSeparator(client, args, "select").read(),
            ]);
          } catch {
            return await Promise.all([getERC20(client, args, "select").read()]);
          }
        },
        parse: (data) =>
          data.length === 1
            ? createERC20(
                args.erc20.address,
                data[0][0],
                data[0][1],
                data[0][2],
                args.erc20.chainID,
                args.erc20.blockCreated,
              )
            : createERC20Permit(
                args.erc20.address,
                data[0][0],
                data[0][1],
                data[0][2],
                args.erc20.version ?? "1",
                args.erc20.chainID,
                args.erc20.blockCreated,
              ),
      }) as ReverseMirage<
    [[string, string, number], Hex] | [[string, string, number]],
    GetIsERC20PermitReturnType,
    T
  >;