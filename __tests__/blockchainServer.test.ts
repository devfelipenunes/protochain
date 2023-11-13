import request from "supertest";
import { app } from "../src/server/blockchainServer";
import Block from "../src/lib/block";

jest.mock("../src/lib/block.ts");
jest.mock("../src/lib/blockchain.ts");

describe("BlockchainServer Tests", () => {
  test("GET /status", async () => {
    const response = await request(app).get("/status");

    expect(response.body.isValid.success).toEqual(true);
    expect(response.status).toEqual(200);
  });

  test("GET /blocks/:index", async () => {
    const response = await request(app).get("/blocks/0");

    expect(response.body.index).toEqual(0);
    expect(response.status).toEqual(200);
  });

  test("GET /blocks/:hash", async () => {
    const response = await request(app).get("/blocks/abc");

    expect(response.body.hash).toEqual("abc");
    expect(response.status).toEqual(200);
  });

  test("GET /blocks?:index - Should NOT get block", async () => {
    const response = await request(app).get("/blocks/abc");

    expect(response.status).toEqual(404);
  });

  test("POST /blocks - Should add block", async () => {
    const block = new Block({ index: 1 } as Block);

    const response = await request(app).post("/blocks").send(block);

    expect(response.body.success).toEqual(1);
    expect(response.status).toEqual(201);
  });

  test("POST /blocks - Should NOT add block (invalid)", async () => {
    const block = new Block({ index: -1 } as Block);

    const response = await request(app).post("/blocks").send(block);

    expect(response.status).toEqual(400);
  });
});
