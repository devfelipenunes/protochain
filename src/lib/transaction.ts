import { SHA256 } from "crypto-js";
import TransactionType from "./transactionType";
import Validation from "./validation";

export default class Transaction {
  type: TransactionType;
  timestamp: number;
  hash: string;
  data: string;

  constructor(tx?: Transaction) {
    this.type = tx?.type || TransactionType.REGULAR;
    this.timestamp = tx?.timestamp || Date.now();
    this.data = tx?.data || "";
    this.hash = tx?.hash || this.geHash();
  }

  geHash(): string {
    return SHA256(this.type + this.timestamp + this.data).toString();
  }

  isValid(): Validation {
    if (this.hash !== this.geHash())
      return new Validation(false, "Invalid hash");

    if (!this.data) return new Validation(false, "Invalid data");

    return new Validation();
  }
}
