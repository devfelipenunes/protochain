import { SHA256 } from "crypto-js";
import Validation from "./validation";

export default class Block {
  index: number;
  timestamp: number;
  hash: string;
  previousHash: string;
  data: string;
  nonce: number;
  miner: string;

  /**
   * Initializes a new instance of the `constructor` class.
   *
   * @param {number} index - The index of the instance.
   * @param {string} previousHash - The previous hash of the instance.
   * @param {string} data - The data of the instance.
   */
  constructor(block?: Block) {
    this.index = block?.index || 0;
    this.timestamp = block?.timestamp || Date.now();
    this.previousHash = block?.previousHash || "";
    this.data = block?.data || "";
    this.nonce = block?.nonce || 0;
    this.miner = block?.miner || "";
    this.hash = block?.hash || this.geHash();
  }

  geHash(): string {
    return SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        this.data +
        this.nonce +
        this.miner
    ).toString();
  }

  mine(difficulty: number, miner: string) {
    this.miner = miner;
    const prefix = new Array(difficulty + 1).join("0");

    do {
      this.nonce++;
      this.hash = this.geHash();
    } while (!this.hash.startsWith(prefix));
  }

  /**
   * Validates the integrity of a block in the blockchain.
   *
   * @param {string} previousHash - the hash of the previous block in the blockchain.
   * @param {number} previousIndex - the index of the previous block in the blockchain.
   * @param {number} difficulty - the difficulty level for mining the block.
   * @return {Validation} - an object indicating whether the block is valid or not.
   */
  isValid(
    previousHash: string,
    previousIndex: number,
    difficulty: number
  ): Validation {
    if (previousIndex !== this.index - 1)
      return new Validation(false, "Invalid index.");

    if (!this.data) return new Validation(false, "Invalid data.");

    if (this.timestamp < 1) return new Validation(false, "Invalid timestamp.");

    if (this.previousHash !== previousHash)
      return new Validation(false, "Invalid previous hash.");

    if (!this.miner || !this.nonce) return new Validation(false, "No miner.");

    const prefix = new Array(difficulty + 1).join("0");
    if (this.hash !== this.geHash() || !this.hash.startsWith(prefix))
      return new Validation(false, "Invalid hash.");

    return new Validation();
  }
}
