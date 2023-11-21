import * as ecc from "tiny-secp256k1";
import ECPairFactory from "ecpair";
import { SHA256 } from "crypto-js";
import Validation from "./validation";

const ECPair = ECPairFactory(ecc);

export default class TransactionInput {
  fromAddress: string;
  amount: number;
  signature: string;
  previousTx: string;

  constructor(txInput?: TransactionInput) {
    this.previousTx = txInput?.previousTx || "";
    this.fromAddress = txInput?.fromAddress || "";
    this.amount = txInput?.amount || 0;
    this.signature = txInput?.signature || "";
  }

  sign(privateKey: string) {
    this.signature = ECPair.fromPrivateKey(Buffer.from(privateKey, "hex"))
      .sign(Buffer.from(this.getHash(), "hex"))
      .toString("hex");
  }

  getHash(): string {
    return SHA256(this.previousTx + this.fromAddress + this.amount).toString();
  }

  isValid(): Validation {
    if (!this.previousTx || !this.signature)
      return new Validation(false, "Invalid signature");
    if (this.amount < 1)
      return new Validation(false, "Amount must be greater than 0");

    const hash = Buffer.from(this.getHash(), "hex");
    const isValid = ECPair.fromPublicKey(
      Buffer.from(this.fromAddress, "hex")
    ).verify(hash, Buffer.from(this.signature, "hex"));

    return isValid
      ? new Validation()
      : new Validation(false, "Invalid signature");
  }
}
