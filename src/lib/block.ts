import { SHA256 } from "crypto-js";
import Validation from "./validation";

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
  isValid(previousHash: string, previousIndex: number): Validation {
    if (previousIndex !== this.index - 1)
      return new Validation(false, "Invalid index.");
    if (this.hash !== this.geHash())
      return new Validation(false, "Invalid hash.");
    if (!this.data) return new Validation(false, "Invalid data.");
    if (this.timestamp < 1) return new Validation(false, "Invalid timestamp.");
    if (this.previousHash !== previousHash)
      return new Validation(false, "Invalid previous hash.");
    return new Validation();
  }
}
