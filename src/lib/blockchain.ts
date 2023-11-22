import BlockInfo from "./blockInfo";
import Block from "./block";
import Validation from "./validation";
import Transaction from "./transaction";
import TransactionType from "./transactionType";
import TransactionSearch from "./transactionSearch";
import TransactionOutput from "./transactionOutput";
import TransactionInput from "./transactionInput";

export default class Blockchain {
  blocks: Block[];
  mempool: Transaction[];
  nextIndex: number = 0;

  static readonly TX_PER_BLOCK: number = 5;
  static readonly DIFFICULTY_FACTOR: number = 5;
  static readonly MAX_DIFFICULTY: number = 62;

  constructor(miner: string) {
    this.blocks = [];
    this.mempool = [];

    const genesis = this.createGenesis(miner);
    this.blocks.push(genesis);

    this.nextIndex++;
  }

  createGenesis(miner: string) {
    const amount = Blockchain.getReward(this.getDifficulty());

    const tx = Transaction.fromReward(
      new TransactionOutput({
        toAddress: miner,
        amount,
      } as TransactionOutput)
    );

    const block = new Block();
    block.transactions = [tx];
    block.mine(this.getDifficulty(), miner);

    return block;
  }

  getLastBlock(): Block {
    return this.blocks[this.blocks.length - 1];
  }

  getDifficulty(): number {
    return Math.ceil(this.blocks.length / Blockchain.DIFFICULTY_FACTOR) + 1;
  }

  addTransaction(transaction: Transaction): Validation {
    if (transaction.txInputs && transaction.txInputs.length) {
      const from = transaction.txInputs[0].fromAddress;

      const peddingTx = this.mempool
        .filter((tx) => tx.txInputs && tx.txInputs.length)
        .map((tx) => tx.txInputs)
        .flat()
        .filter((txi) => txi!.fromAddress === from);

      if (peddingTx && peddingTx.length) {
        return new Validation(false, "This wallet has pending txs");
      }

      const utxo = this.getUtxo(from);

      for (let i = 0; i < transaction.txInputs.length; i++) {
        const txi = transaction.txInputs[i];
        if (
          utxo.findIndex(
            (txo) => txo.tx === txi.previousTx && txo.amount >= txi.amount
          ) === -1
        )
          return new Validation(false, "Invalid tx: " + transaction.hash);
      }
    }

    const validation = transaction.isValid(
      this.getDifficulty(),
      this.getFeerPerTx()
    );

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

  addBlock(block: Block): Validation {
    const nextBlock = this.getNextBlock();
    if (!nextBlock) return new Validation(false, "No next block");

    const validation = block.isValid(
      nextBlock.previousHash,
      nextBlock.index - 1,
      nextBlock.difficulty,
      nextBlock.feePexTx
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

  getTxInputs(wallet: string): (TransactionInput | undefined)[] {
    return this.blocks
      .map((b) => b.transactions)
      .flat()
      .filter((tx) => tx.txInputs && tx.txInputs.length)
      .map((tx) => tx.txInputs)
      .flat()
      .filter((txi) => txi!.fromAddress === wallet);
  }

  getTxOutputs(wallet: string): TransactionOutput[] {
    return this.blocks
      .map((b) => b.transactions)
      .flat()
      .filter((tx) => tx.txOutputs && tx.txOutputs.length)
      .map((tx) => tx.txOutputs)
      .flat()
      .filter((txo) => txo.toAddress === wallet);
  }

  getUtxo(wallet: string): TransactionOutput[] {
    const txIns = this.getTxInputs(wallet);
    const txOuts = this.getTxOutputs(wallet);

    if (!txIns || !txIns.length) return txOuts;

    txIns.forEach((txi) => {
      const index = txOuts.findIndex((txo) => txo.amount === txi!.amount);
      txOuts.splice(index, 1);
    });

    return txOuts;
  }

  getBalance(wallet: string): number {
    const utxo = this.getUtxo(wallet);
    if (!utxo || !utxo.length) return 0;

    return utxo.reduce((a, b) => a + b.amount, 0);
  }

  static getReward(difficulty: number): number {
    return (64 - difficulty) * 10;
  }
}
