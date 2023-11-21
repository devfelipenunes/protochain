import readline from "readline";
import Wallet from "../lib/wallet";
import dotenv from "dotenv";
import Transaction from "../lib/transaction";
import TransactionType from "../lib/transactionType";
import TransactionInput from "../lib/transactionInput";
import axios from "axios";
import TransactionOutput from "../lib/transactionOutput";
dotenv.config();

const BLOCKCHAIN_SERVER = process.env.BLOCKCHAIN_SERVER;

let myWalletPub = "";
let myWalletPriv = "";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function menu() {
  setTimeout(() => {
    console.clear();

    if (myWalletPub) {
      console.log("You are connected with: " + myWalletPub);
    } else {
      console.log("No wallet connected");
    }

    console.log("1 - Create a new wallet");
    console.log("2 - Recover wallet");
    console.log("3 - Balance");
    console.log("4 - Send Tx");
    console.log("5 - Search tx");

    rl.question("Choose your option: ", (answer) => {
      switch (answer) {
        case "1":
          createWallet();
          break;
        case "2":
          recoverWallet();
          break;
        case "3":
          getBalance();
          break;
        case "4":
          sendTx();
          break;
        case "5":
          searchTx();
          break;
        default: {
          console.log("Invalid option");
          menu();
        }
      }
    });
  }, 1000);
}

function preMenu() {
  rl.question(`Press any key to continue...`, (answer) => {
    menu();
  });
}

function createWallet() {
  console.clear();
  const wallet = new Wallet();
  console.log("Your new wallet ");
  console.log(wallet);

  myWalletPub = wallet.publicKey;
  myWalletPriv = wallet.privateKey;
  preMenu();
}

function recoverWallet() {
  console.clear();
  rl.question(`What is   private key or WIF? `, (wifOrPrivateKey) => {
    console.log("wifOrPrivateKey", wifOrPrivateKey);

    const wallet = new Wallet(wifOrPrivateKey);
    console.log(`Your recoverd wallet `);
    console.log(wallet);

    myWalletPub = wallet.publicKey;
    myWalletPriv = wallet.privateKey;
    preMenu();
  });
}

async function getBalance() {
  console.clear();

  if (!myWalletPub) {
    console.log("You don't have a wallet");
    return preMenu();
  }

  const { data } = await axios.get(
    `${BLOCKCHAIN_SERVER}/wallets/${myWalletPub}`
  );

  console.log("Balance: " + data.balance);
  preMenu();
}

function sendTx() {
  console.clear();

  if (!myWalletPub) {
    console.log("You don't have a wallet");
    return preMenu();
  }

  console.log(`Your wallet is ${myWalletPub}`);

  rl.question(`To Wallet: `, (toWallet) => {
    if (toWallet.length < 66) {
      console.log("Invalid address");
      return preMenu();
    }
    rl.question(`Amount: `, async (amountStr) => {
      const amount = parseInt(amountStr);

      if (!amount) {
        console.log("Invalid amount");
        return preMenu();
      }

      const walletResponse = await axios.get(
        `${BLOCKCHAIN_SERVER}/wallets/${myWalletPub}`
      );
      const balance = walletResponse.data.balance as number;
      const fee = walletResponse.data.fee as number;
      const utxo = walletResponse.data.utxo as TransactionOutput[];

      if (balance < amount + fee) {
        console.log("You don't have enough balance");
        return preMenu();
      }

      const txInputs = utxo.map((txo) => TransactionInput.fromTxo(txo));
      txInputs.forEach((txi, index, arr) => arr[index].sign(myWalletPriv));

      // trasação de transferencia
      const txOutputs = [] as TransactionOutput[];
      txOutputs.push(
        new TransactionOutput({
          toAddress: toWallet,
          amount,
        } as TransactionOutput)
      );

      // trasação de troco
      const remaningBalance = balance - amount - fee;
      txOutputs.push(
        new TransactionOutput({
          toAddress: myWalletPub,
          amount: remaningBalance,
        } as TransactionOutput)
      );

      const tx = new Transaction({
        txInputs,
        txOutputs,
      } as Transaction);

      tx.hash = tx.getHash();
      tx.txOutputs.forEach((txo, index, arr) => (arr[index].tx = tx.hash));

      console.log(tx);
      console.log("Remaining Balance" + remaningBalance);

      try {
        const txResponse = await axios.post(
          `${BLOCKCHAIN_SERVER}/transactions/`,
          tx
        );

        console.log(`Transcation accepted waiting the miners`);
        console.log(txResponse.data);
      } catch (err: any) {
        console.error(err.response ? err.response.data : err.message);
      }

      return preMenu();
    });
  });

  preMenu();
}

function searchTx() {
  console.clear();
  rl.question(`Hash: `, async (hash) => {
    const response = await axios.get(
      `${BLOCKCHAIN_SERVER}/transactions/${hash}`
    );
    console.log(response.data);
    return preMenu();
  });
}

menu();
