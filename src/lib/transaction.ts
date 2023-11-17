import { SHA256 } from "crypto-js";
import TransactionType from "./transactionType";
import Validation from "./validation";
import TransactionInput from "./transactionInput";

export default class Transaction {
  type: TransactionType;
  timestamp: number;
  hash: string;
  txInput: TransactionInput;
  to: string;

  constructor(tx?: Transaction) {
    this.type = tx?.type || TransactionType.REGULAR;
    this.timestamp = tx?.timestamp || Date.now();
    this.to = tx?.to || "carteiraTo";
    if (tx && tx.txInput) {
      this.txInput = new TransactionInput(tx.txInput);
    } else {
      this.txInput = new TransactionInput();
    }
    this.hash = tx?.hash || this.getHash();
  }

  getHash(): string {
    const from = this.txInput ? this.txInput.getHash() : "";
    return SHA256(this.type + this.timestamp + this.to + from).toString();
  }

  isValid(): Validation {
    if (this.hash !== this.getHash())
      return new Validation(false, "Invalid hash");

    if (!this.to) return new Validation(false, "Invalid data");

    if (this.txInput) {
      const isValid = this.txInput.isValid();
      if (!isValid.success) return new Validation(false, "Invalid ");
    }

    return new Validation();
  }
}
