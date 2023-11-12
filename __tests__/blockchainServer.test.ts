import request from "supertest";
import { app } from "../src/server/blockchainServer";

jest.mock("../src/lib/block.ts");

describe("BlockchainServer Tests", () => {
  test("GET /status", async () => {
    const response = await request(app).get("/status");

    expect(response.body.isValid.success).toEqual(true);
    expect(response.status).toEqual(200);
  });
});
