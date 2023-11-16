import Transaction from "./transaction";

export default interface BlockInfo {
  index: number;
  previousHash: string;
  difficulty: number;
  maxDifficulty: number;
  feePexTx: number;
  transactions: Transaction[];
}
