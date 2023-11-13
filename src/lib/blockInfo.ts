export default interface BlockInfo {
  index: number;
  previousHash: string;
  difficulty: number;
  maxDifficulty: number;
  feePexTx: number;
  data: string;
}
