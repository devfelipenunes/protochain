import * as ecc from "tiny-secp256k1";
import ECPairFactory from "ecpair";

const ECPair = ECPairFactory(ecc);

export default class Wallet {
  privateKey: string;
  publicKey: string;

  constructor(wiOrPrivateKey?: string) {
    let keys;

    if (wiOrPrivateKey) {
      if (wiOrPrivateKey.length == 64) {
        keys = ECPair.fromPrivateKey(Buffer.from(wiOrPrivateKey, "hex"));
      } else {
        keys = ECPair.fromWIF(wiOrPrivateKey);
      }
    } else keys = ECPair.makeRandom();

    this.publicKey = keys.publicKey?.toString("hex") || "";
    this.privateKey = keys.privateKey?.toString("hex") || "";
  }
}
