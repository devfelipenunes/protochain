import Block from "../src/lib/block";
import Blockchain from "../src/lib/blockchain";

jest.mock("../src/lib/block.ts");

describe("blockchain", () => {
  test("Should has genesis blocks", () => {
    const blockchain = new Blockchain();
    expect(blockchain.blocks.length).toEqual(1);
  });

  test("Should be valid (genesis)", () => {
    const blockchain = new Blockchain();
    expect(blockchain.isValid().success).toEqual(true);
  });

  test("Should be valid (two blocks)", () => {
    const blockchain = new Blockchain();
    blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: blockchain.blocks[0].hash,
        data: "Block 2",
      } as Block)
    );

    expect(blockchain.isValid().success).toEqual(true);
  });

  test("Should NOT be valid ", () => {
    const blockchain = new Blockchain();
    blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: blockchain.blocks[0].hash,
        data: "Block 2",
      } as Block)
    );
    blockchain.blocks[1].data = "mil";
    expect(blockchain.isValid().success).toEqual(false);
  });

  test("Should get block", () => {
    const blockchain = new Blockchain();
    const block = blockchain.getBlock(blockchain.blocks[0].hash);

    expect(block).toBeTruthy();
  });

  test("Should add block", () => {
    const blockchain = new Blockchain();
    const result = blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: blockchain.blocks[0].hash,
        data: "Block 2",
      } as Block)
    );

    expect(result.success).toBe(true);
  });

  test("Should NOT add block", () => {
    const blockchain = new Blockchain();
    const block = new Block({
      index: -1,
      previousHash: blockchain.blocks[0].hash,
      data: "Block 2",
    } as Block);

    const result = blockchain.addBlock(block);

    expect(result.success).toEqual(false);
  });
});
