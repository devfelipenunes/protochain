import dotenv from "dotenv";
dotenv.config();

import express from "express";
import Blockchain from "../lib/blockchain";
import Block from "../lib/block";
import morgan from "morgan";
import Transaction from "../lib/transaction";
import Wallet from "../lib/wallet";
import TransactionOutput from "../lib/transactionOutput";
const PORT: number = parseInt(`${process.env.BLOCKCHAIN_PORT || 3001}`);

const app = express();

if (process.argv.includes("--run")) app.use(morgan("tiny"));
app.use(express.json());

const wallet = new Wallet(process.env.BLOCKCHAIN_WALLET);
const blockchain = new Blockchain(wallet.publicKey);

app.get("/status", (req, res, next) => {
  res.json({
    numberOfBlocks: blockchain.blocks.length,
    isValid: blockchain.isValid(),
    lastBlock: blockchain.getLastBlock(),
  });
});

app.get("/blocks/next", (req, res, next) => {
  res.json(blockchain.getNextBlock());
});

app.get("/blocks/:indexOrHash", (req, res, next) => {
  let block;

  if (/^[0-9]/.test(req.params.indexOrHash))
    block = blockchain.blocks[parseInt(req.params.indexOrHash)];
  else block = blockchain.getBlock(req.params.indexOrHash);

  if (!block) return res.sendStatus(404);
  else return res.json(block);
});

app.post("/blocks", (req, res, next) => {
  if (req.body.hash === undefined) return res.sendStatus(422);

  const block = new Block(req.body as Block);
  const validation = blockchain.addBlock(block);

  if (validation.success) res.status(201).json(block);
  else res.status(400).json(validation);
});

app.get("/transactions/:hash?", (req, res, next) => {
  if (req.params.hash) {
    res.json(blockchain.getTransaction(req.params.hash));
  } else
    res.json({
      next: blockchain.mempool.slice(0, Blockchain.TX_PER_BLOCK),
      total: blockchain.mempool.length,
    });
});

app.post("/transactions", (req, res, next) => {
  if (req.body.hash === undefined) return res.sendStatus(422);

  const tx = new Transaction(req.body as Transaction);
  const validation = blockchain.addTransaction(tx);

  if (validation.success) res.status(201).json(tx);
  else res.status(400).json(validation);
});

app.get("/wallets/:wallet", (req, res, next) => {
  const wallet = req.params.wallet;
  return res.json({
    balance: 10,
    fee: blockchain.getFeerPerTx(),
    utxo: [
      new TransactionOutput({
        toAddress: wallet,
        amount: 10,
        tx: "abc",
      } as TransactionOutput),
    ],
  });
});

if (process.argv.includes("--run"))
  app.listen(PORT, () => {
    console.log(
      `Blockchain server is running at ${PORT}. wallet: ${wallet.publicKey}`
    );
  });

export { app };
