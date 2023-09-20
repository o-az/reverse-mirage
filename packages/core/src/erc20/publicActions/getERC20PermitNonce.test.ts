import invariant from "tiny-invariant";
import type { Hex } from "viem";
import { foundry } from "viem/chains";
import { beforeAll, expect, test } from "vitest";
import ERC20PermitBytecode from "../../../../../contracts/out/ERC20Permit.sol/ERC20Permit.json";
import { ALICE } from "../../_test/constants.js";
import { publicClient, testClient, walletClient } from "../../_test/utils.js";
import { erc20PermitABI } from "../../generated.js";
import type { ERC20Permit } from "../types.js";
import { createERC20Permit } from "../utils.js";
import { getERC20PermitNonce } from "./getERC20PermitNonce.js";

let id: Hex | undefined = undefined;

let erc20: ERC20Permit;

beforeAll(async () => {
  if (id === undefined || erc20 === undefined) {
    const deployHash = await walletClient.deployContract({
      account: ALICE,
      abi: erc20PermitABI,
      bytecode: ERC20PermitBytecode.bytecode.object as Hex,
      args: ["name", "symbol", 18],
    });

    const { contractAddress } = await publicClient.waitForTransactionReceipt({
      hash: deployHash,
    });
    invariant(contractAddress);
    erc20 = createERC20Permit(
      contractAddress,
      "name",
      "symbol",
      18,
      "1",
      foundry.id,
    );
  } else {
    await testClient.revert({ id });
  }
  id = await testClient.snapshot();
});

test("read nonce", async () => {
  const nonce = await getERC20PermitNonce(publicClient, {
    erc20,
    address: ALICE,
  });
  expect(nonce).toBe(0n);
});

test("read nonce select", async () => {
  const rm = getERC20PermitNonce(
    publicClient,
    {
      erc20,
      address: ALICE,
    },
    "select",
  );

  expect(await rm.read().then((data) => rm.parse(data))).toBe(0n);
});