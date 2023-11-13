import Block from "../src/lib/block";

jest.mock("../src/lib/block.ts");

describe("Block", () => {
  const exampleDifficulty = 0;
  const exampleMiner = "miner";
  let genesis: Block;

  beforeAll(() => {
    genesis = new Block({ data: "genesis block" } as Block);
  });

  test("Should be Valid", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "block 2",
    } as Block);
    block.mine(exampleDifficulty, exampleMiner);
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);

    expect(valid.success).toBe(true);
  });

  test("Should NOT be valid (fallbacks)", () => {
    const block = new Block();
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);

    expect(valid.success).toBeFalsy();
  });

  describe("Should NOT be valid (previous hash)", () => {
    const block = new Block({
      index: 1,
      previousHash: "abc",
      data: "block 2",
    } as Block);
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);

    expect(valid.success).toBeFalsy();
  });

  describe("Should NOT be valid (timestamp)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "block 2",
    } as Block);
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);

    expect(valid.success).toBeFalsy();
  });

  describe("Should NOT be valid (hash)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "",
    } as Block);
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);

    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (index)", () => {
    const block = new Block({
      index: -1,
      previousHash: genesis.hash,
      data: "block 2",
    } as Block);
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);

    expect(valid.success).toBeFalsy();
  });
});
