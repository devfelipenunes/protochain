import express from "express";
import Blockchain from "../lib/blockchain";
const PORT: number = 3000;

const app = express();

const blockchain = new Blockchain();

app.get("/status", (req, res, next) => {
  res.json({
    numberOfBlocks: blockchain.blocks.length,
    isValid: blockchain.isValid(),
    lastBlock: blockchain.getLastBlock(),
  });
});

app.listen(PORT, () => {
  console.log(`Blockchain server is running at ${PORT}`);
});
