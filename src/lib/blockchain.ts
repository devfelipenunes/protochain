import BlockInfo from "./blockInfo";
import Block from "./block";
import Validation from "./validation";
import Transaction from "./transaction";
import TransactionType from "./transactionType";
import TransactionSearch from "./transactionSearch";

export default class Blockchain {
  blocks: Block[];
  mempool: Transaction[];
  nextIndex: number = 0;

  static readonly TX_PER_BLOCK: number = 2;
  static readonly DIFFICULTY_FACTOR: number = 5;
  static readonly MAX_DIFFICULTY: number = 62;

  constructor() {
    this.mempool = [];
    this.blocks = [
      new Block({
        index: this.nextIndex,
        previousHash: "",
        transactions: [
          new Transaction({
            type: TransactionType.FEE,
            data: new Date().toString(),
          } as Transaction),
        ],
      } as Block),
    ];
    this.nextIndex++;
  }

  getLastBlock(): Block {
    return this.blocks[this.blocks.length - 1];
  }

  addTransaction(transaction: Transaction): Validation {
    const validation = transaction.isValid();

    if (!validation.success)
      return new Validation(false, "Invalid tx: " + validation.message);

    if (
      this.blocks.some((b) =>
        b.transactions.some((tx) => tx.hash === transaction.hash)
      )
    )
      return new Validation(false, "Duplicated tx: " + transaction.hash);

    if (this.mempool.some((tx) => tx.hash === transaction.hash))
      return new Validation(false, "Duplicated tx: " + transaction.hash);

    this.mempool.push(transaction);
    return new Validation(true, transaction.hash);
  }

  getBlock(hash: string): Block | undefined {
    return this.blocks.find((b) => hash === hash);
  }

  getTransaction(hash: string): TransactionSearch {
    const mempoolIndex = this.mempool.findIndex((tx) => tx.hash === hash);

    if (mempoolIndex !== -1)
      return {
        transaction: this.mempool[mempoolIndex],
        mempoolIndex,
        blockIndex: -1,
      } as TransactionSearch;

    const blockIndex = this.blocks.findIndex((b) =>
      b.transactions.some((tx) => tx.hash === hash)
    );
    if (blockIndex !== -1) {
      return {
        blockIndex,
        transaction: this.blocks[blockIndex].transactions.find(
          (tx) => tx.hash === hash
        ),
      } as TransactionSearch;
    }

    return {
      blockIndex: -1,
      mempoolIndex: -1,
    } as TransactionSearch;
  }

  getDifficulty(): number {
    return Math.ceil(this.blocks.length / Blockchain.DIFFICULTY_FACTOR);
  }

  addBlock(block: Block): Validation {
    const lastBlock = this.getLastBlock();

    const validation = block.isValid(
      lastBlock.hash,
      lastBlock.index,
      this.getDifficulty()
    );
    if (!validation.success)
      return new Validation(false, `Invalid block: ${validation.message}`);

    const txs = block.transactions
      .filter((tx) => tx.type !== TransactionType.FEE)
      .map((tx) => tx.hash);

    const newMempool = this.mempool.filter((tx) => !txs.includes(tx.hash));

    if (newMempool.length + txs.length !== this.mempool.length)
      return new Validation(false, "Invalid mempool");

    this.mempool = newMempool;
    this.nextIndex++;

    return new Validation(true, block.hash);
  }

  isValid(): Validation {
    for (let i = this.blocks.length - 1; i > 0; i--) {
      const currentBlock = this.blocks[i];
      const previousBlock = this.blocks[i - 1];
      const validation = currentBlock.isValid(
        previousBlock.hash,
        previousBlock.index,
        this.getDifficulty()
      );
      if (!validation.success)
        return new Validation(
          false,
          `Invalid block #${currentBlock.index}:  ${validation.message} `
        );
    }
    return new Validation();
  }

  getFeerPerTx(): number {
    return 1;
  }

  getNextBlock(): BlockInfo | null {
    if (!this.mempool || this.mempool.length === 0) return null;

    const transactions = this.mempool.slice(0, Blockchain.TX_PER_BLOCK);
    const difficulty = this.getDifficulty();
    const previousHash = this.getLastBlock().hash;
    const index = this.blocks.length;
    const feePexTx = this.getFeerPerTx();

    return {
      index,
      previousHash,
      difficulty,
      maxDifficulty: Blockchain.MAX_DIFFICULTY,
      feePexTx,
      transactions,
    } as BlockInfo;
  }
}
