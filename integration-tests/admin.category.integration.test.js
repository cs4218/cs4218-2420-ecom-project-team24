import request from "supertest";
import app from "../server.js";
import mongoose from "mongoose";

describe("Admin Category Flow (Integration Test)", () => {
  let token;
  let categoryId;

  beforeAll(async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "cs4218@test.com",
      password: "cs4218@test.com",
    });
    token = res.body?.token;
    if (!token) throw new Error("Login failed - no token received");
  });

  it("should create a category", async () => {
    const res = await request(app)
      .post("/api/v1/category/create-category")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Integration Category" });

    expect(res.statusCode).toBe(201);
    expect(res.body?.category?.name).toBe("Integration Category");
    categoryId = res.body.category._id;
  });

  afterAll(async () => {
    await mongoose.disconnect();
  }, 20000);
});