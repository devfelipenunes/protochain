import Blockchain from "../src/lib/blockchain";

describe("blockchain", () => {
  test("Should has genesis blocks", () => {
    const blockchain = new Blockchain();
    expect(blockchain.blocks.length).toBe(1);
  });
});
