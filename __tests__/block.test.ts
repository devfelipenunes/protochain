import Block from "../src/lib/block";

describe("Block", () => {
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
    const valid = block.isValid(genesis.hash, genesis.index);

    expect(valid.success).toBe(true);
  });

  describe("Should NOT be valid (previous hash)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "block 2",
    } as Block);
    const valid = block.isValid(genesis.hash, genesis.index);

    expect(valid.success).toBeFalsy();
  });

  describe("Should NOT be valid (timestamp)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "block 2",
    } as Block);
    const valid = block.isValid(genesis.hash, genesis.index);

    expect(valid.success).toBeFalsy();
  });

  describe("Should NOT be valid (hash)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "",
    } as Block);
    const valid = block.isValid(genesis.hash, genesis.index);

    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (index)", () => {
    const block = new Block({
      index: -1,
      previousHash: genesis.hash,
      data: "block 2",
    } as Block);
    const valid = block.isValid(genesis.hash, genesis.index);

    expect(valid.success).toBeFalsy();
  });
});
