import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import BlockInfo from "../lib/blockInfo";
import Block from "../lib/block";
import Wallet from "../lib/wallet";
import Transaction from "../lib/transaction";
import TransactionType from "../lib/transactionType";
import TransactionOutput from "../lib/transactionOutput";
import Blockchain from "../lib/blockchain";

const BLOCKCHAIN_SERVER = process.env.BLOCKCHAIN_SERVER;
const minerWallet = new Wallet(process.env.MINER_WALLET);

let totalMined = 0;

function getRewardTx(
  blockInfo: BlockInfo,
  nextBlock: Block
): Transaction | undefined {
  let amount = 0;

  if (blockInfo.difficulty <= blockInfo.maxDifficulty)
    amount += Blockchain.getReward(blockInfo.difficulty);

  const fees = nextBlock.transactions
    .map((tx) => tx.getFee())
    .reduce((a, b) => a + b, 0);
  const feeCheck = nextBlock.transactions.length * blockInfo.feePexTx;

  if (fees < feeCheck) {
    console.log("Fee check failed!");
    setTimeout(() => {
      mine();
    }, 5000);
    return;
  }

  amount += fees;

  const txo = new TransactionOutput({
    toAddress: minerWallet.publicKey,
    amount,
  } as TransactionOutput);

  return Transaction.fromReward(txo);
}

async function mine() {
  const { data } = await axios.get(`${BLOCKCHAIN_SERVER}/blocks/next`);

  if (!data) {
    console.log("No tx found");
    return setTimeout(() => {
      mine();
    }, 5000);
  }

  const blockInfo = data as BlockInfo;
  const newBlock = Block.fromBlockInfo(blockInfo);

  const tx = getRewardTx(blockInfo, newBlock);
  if (!tx) return;

  newBlock.transactions.push(tx);

  newBlock.miner = minerWallet.publicKey;
  newBlock.hash = newBlock.getHash();

  console.log("Start mining..." + blockInfo.index);
  newBlock.mine(blockInfo.difficulty, minerWallet.publicKey);
  console.log("Block mined! sending to blockchain...");

  try {
    await axios.post(`${BLOCKCHAIN_SERVER}/blocks`, newBlock);
    console.log("Block sent to blockchain!");
    totalMined++;
    console.log(`Total mined: ${totalMined}`);
  } catch (err: any) {
    console.error(err.response ? err.response.data : err.message);
  }

  setTimeout(() => {
    mine();
  }, 1000);
}

mine();
