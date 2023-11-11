import Block from "../src/lib/block";
import Blockchain from "../src/lib/blockchain";

describe("blockchain", () => {
  test("Should has genesis blocks", () => {
    const blockchain = new Blockchain();
    expect(blockchain.blocks.length).toEqual(1);
  });

  test("Should be valid (genesis)", () => {
    const blockchain = new Blockchain();
    expect(blockchain.isValid()).toEqual(true);
  });

  test("Should be valid (two blocks)", () => {
    const blockchain = new Blockchain();
    blockchain.addBlock(new Block(1, blockchain.blocks[0].hash, "Block 2"));

    expect(blockchain.isValid()).toEqual(true);
  });

  test("Should NOT be valid ", () => {
    const blockchain = new Blockchain();
    blockchain.addBlock(new Block(1, blockchain.blocks[0].hash, "Block 2"));
    blockchain.blocks[1].data = "mil";
    expect(blockchain.isValid()).toEqual(false);
  });

  test("Should add block", () => {
    const blockchain = new Blockchain();
    const result = blockchain.addBlock(
      new Block(1, blockchain.blocks[0].hash, "Block 2")
    );

    expect(result).toBe(true);
  });

  test("Should NOT add block", () => {
    const blockchain = new Blockchain();
    const block = new Block(-1, blockchain.blocks[0].hash, "Block 2");

    const result = blockchain.addBlock(block);

    expect(result).toBeFalsy();
  });
});
