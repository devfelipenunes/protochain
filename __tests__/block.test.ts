import Block from "../src/lib/block";

describe("Block", () => {
  let genesis: Block;

  beforeAll(() => {
    genesis = new Block(0, "abc", "genesis block");
  });

  test("Should be Valid", () => {
    const block = new Block(1, genesis.hash, "block 2");
    const valid = block.isValid(genesis.hash, genesis.index);

    expect(valid).toBe(true);
  });

  describe("Should NOT be valid (previous hash)", () => {
    const block = new Block(1, "", "block 1");
    const valid = block.isValid(genesis.hash, genesis.index);

    expect(valid).toBeFalsy();
  });

  describe("Should NOT be valid (timestamp)", () => {
    const block = new Block(-1, "abc", "block bloc");
    const valid = block.isValid(genesis.hash, genesis.index);

    expect(valid).toBeFalsy();
  });

  describe("Should NOT be valid (hash)", () => {
    const block = new Block(1, genesis.hash, "");
    const valid = block.isValid(genesis.hash, genesis.index);

    expect(valid).toBeFalsy();
  });

  test("Should NOT be valid (index)", () => {
    const block = new Block(-1, genesis.hash, "block 2");
    const valid = block.isValid(genesis.hash, genesis.index);

    expect(valid).toBeFalsy();
  });
});
