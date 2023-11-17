import TransactionInput from "../src/lib/transactionInput";
import Wallet from "../src/lib/wallet";

describe("TransactionInput", () => {
  let alice: Wallet;

  beforeAll(() => {
    alice = new Wallet();
  });

  test("Should be valid", () => {
    const wallet = new Wallet();
    expect(wallet.privateKey).toBeTruthy();
    expect(wallet.publicKey).toBeTruthy();
  });

  test("Should recover wallet (PK)", () => {
    const wallet = new Wallet();
    expect(wallet.privateKey).toEqual(alice.privateKey);
  });

  test("Should recover wallet (PK)", () => {
    const wallet = new Wallet(
      "5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ"
    );
    expect(wallet.publicKey).toBeTruthy();
    expect(wallet.privateKey).toBeTruthy();
  });
});
