import { SHA256 } from "crypto-js";
import Validation from "../validation";

export default class Block {
  index: number;
  timestamp: number;
  hash: string;
  previousHash: string;
  data: string;

  constructor(block?: Block) {
    this.index = block?.index || 0;
    this.timestamp = block?.timestamp || Date.now();
    this.previousHash = block?.previousHash || "";
    this.data = block?.data || "";
    this.hash = block?.hash || this.geHash();
  }

  geHash(): string {
    return this.data || "abc";
  }

  /**
   * Checks if the current state is valid.
   *@param {string} previousHash
   * @param {number} previousIndex
   *
   * @return {boolean} True if the state is valid, false otherwise.
   */
  isValid(previousHash: string, previousIndex: number): Validation {
    if (!previousHash || previousIndex < 0 || this.index < 0)
      return new Validation(false, "Invalid mock block.");
    return new Validation();
  }
}
