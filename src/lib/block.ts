import { SHA256 } from "crypto-js";

export default class Block {
  index: number;
  timestamp: number;
  hash: string;
  previousHash: string;
  data: string;

  /**
   * Initializes a new instance of the `constructor` class.
   *
   * @param {number} index - The index of the instance.
   * @param {string} previousHash - The previous hash of the instance.
   * @param {string} data - The data of the instance.
   */
  constructor(index: number, previousHash: string, data: string) {
    this.index = index;
    this.timestamp = Date.now();
    this.previousHash = previousHash;
    this.data = data;
    this.hash = this.geHash();
  }

  geHash(): string {
    return SHA256(
      this.index + this.previousHash + this.timestamp + this.data
    ).toString();
  }

  /**
   * Checks if the current state is valid.
   *@param {string} previousHash
   * @param {number} previousIndex
   *
   * @return {boolean} True if the state is valid, false otherwise.
   */
  isValid(previousHash: string, previousIndex: number): boolean {
    if (previousIndex !== this.index - 1) return false;
    if (this.hash !== this.geHash()) return false;
    if (!this.data) return false;
    if (this.timestamp < 1) return false;
    if (this.previousHash !== previousHash) return false;
    return true;
  }
}
