import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import BlockInfo from "../lib/blockInfo";
import Block from "../lib/block";

const BLOCKCHAIN_SERVER = process.env.BLOCKCHAIN_SERVER;
const minerWallet = {
  privateKey: "123456",
  publicKey: `${process.env.MINER_WALLET}`,
};

console.log("logged as" + minerWallet.publicKey);

let totalMined = 0;

async function mine() {
  const { data } = await axios.get(`${BLOCKCHAIN_SERVER}/blocks/next`);
  console.log(data);
  const blockInfo = data as BlockInfo;
  const newBlock = Block.fromBlockInfo(blockInfo);
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
