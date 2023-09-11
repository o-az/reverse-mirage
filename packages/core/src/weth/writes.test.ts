import invariant from "tiny-invariant";
import type { Hex } from "viem";
import { foundry } from "viem/chains";
import { beforeEach, describe, expect, test } from "vitest";
import WETH9Bytecode from "../../../../contracts/out/WETH9.sol/WETH9.json";
import { ALICE } from "../_test/constants.js";
import { publicClient, testClient, walletClient } from "../_test/utils.js";
import { createAmountFromString } from "../amountUtils.js";
import { weth9ABI } from "../generated.js";
import { erc20BalanceOf } from "../index.js";
import { readAndParse } from "../readUtils.js";
import type { WETH } from "./types.js";
import { createWETH } from "./utils.js";
import { wethDeposit, wethWithdraw } from "./writes.js";

let id: Hex | undefined = undefined;

let weth: WETH;

beforeEach(async () => {
  if (id === undefined) {
    const deployHash = await walletClient.deployContract({
      abi: weth9ABI,
      bytecode: WETH9Bytecode.bytecode.object as Hex,
    });

    const { contractAddress } = await publicClient.waitForTransactionReceipt({
      hash: deployHash,
    });
    invariant(contractAddress);
    weth = createWETH(contractAddress, "name", "symbol", 18, foundry.id);
  } else {
    await testClient.revert({ id });
  }

  id = await testClient.snapshot();
});

describe("weth writes", async () => {
  test("deposit", async () => {
    const { hash } = await wethDeposit(publicClient, walletClient, ALICE, {
      amount: createAmountFromString(weth, "1"),
    });

    await publicClient.waitForTransactionReceipt({ hash });

    const balance = await readAndParse(
      publicClient,
      erc20BalanceOf({ erc20: weth, address: ALICE }),
    );

    expect(balance.amount).toBe(10n ** 18n);
    expect(balance.token).toStrictEqual(weth);
  });

  test("deposit", async () => {
    const { hash } = await wethDeposit(publicClient, walletClient, ALICE, {
      amount: createAmountFromString(weth, "1"),
    });

    await publicClient.waitForTransactionReceipt({ hash });

    const balance = await readAndParse(
      publicClient,
      erc20BalanceOf({ erc20: weth, address: ALICE }),
    );

    expect(balance.amount).toBe(10n ** 18n);
    expect(balance.token).toStrictEqual(weth);
  });

  test("withdraw", async () => {
    const { hash } = await wethDeposit(publicClient, walletClient, ALICE, {
      amount: createAmountFromString(weth, "1"),
    });

    await publicClient.waitForTransactionReceipt({ hash });

    const { hash: withdrawHash } = await wethWithdraw(
      publicClient,
      walletClient,
      ALICE,
      {
        amount: createAmountFromString(weth, "1"),
      },
    );

    await publicClient.waitForTransactionReceipt({ hash: withdrawHash });

    const balance = await readAndParse(
      publicClient,
      erc20BalanceOf({ erc20: weth, address: ALICE }),
    );

    expect(balance.amount).toBe(0n);
    expect(balance.token).toStrictEqual(weth);
  });
});
