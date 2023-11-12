import Block from "./block";
import Validation from "../validation";

export default class Blockchain {
  blocks: Block[];
  nextIndex: number = 0;

  constructor() {
    this.blocks = [
      new Block({
        index: 0,
        hash: "abc",
        previousHash: "",
        timestamp: Date.now(),
        data: "Genesis Block",
      } as Block),
    ];
    this.nextIndex++;
  }

  getLastBlock(): Block {
    return this.blocks[this.blocks.length - 1];
  }

  getBlock(hash: string): Block | undefined {
    return this.blocks.find((b) => hash === hash);
  }

  addBlock(block: Block): Validation {
    if (block.index < 0) return new Validation(false, "invalid mock block.");

    this.blocks.push(block);
    this.nextIndex++;

    return new Validation();
  }

  isValid(): Validation {
    for (let i = this.blocks.length - 1; i > 0; i--) {
      const currentBlock = this.blocks[i];
      const previousBlock = this.blocks[i - 1];
      const validation = currentBlock.isValid(
        previousBlock.hash,
        previousBlock.index
      );
      if (!validation.success)
        return new Validation(
          false,
          `Invalid block #${currentBlock.index}:  ${validation.message} `
        );
    }
    return new Validation();
  }
}
