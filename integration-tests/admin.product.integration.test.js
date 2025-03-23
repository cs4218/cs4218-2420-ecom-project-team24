import request from "supertest";
import app from "../server.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";

const hashedPassword = await bcrypt.hash("admin@test.com", 10);

// code adapted from https://chatgpt.com/share/67df0798-33d4-8013-b7f0-3915a1021025
describe("Admin Product Flow (Integration Test)", () => {
  let token;
  let productId;
  let originalProductName = `Integration Product ${Date.now()}`;
  let updatedProductName = `${originalProductName} Updated`;

  beforeAll(async () => {
    await User.create({
      name: "Test Admin",
      email: "admin@test.com",
      password: hashedPassword,
      phone: "1234567890",
      address: "123 Admin Street",
      answer: "football",
      role: 1,
    });

    // Login with test credentials
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "admin@test.com",
      password: "admin@test.com",
    });

    token = res.body?.token;
    if (!token) throw new Error("Login failed - no token received");
  });

  it("should create a product", async () => {
    const res = await request(app)
      .post("/api/v1/product/create-product")
      .set("Authorization", `Bearer ${token}`)
      .field("name", originalProductName)
      .field("description", "This is a test product.")
      .field("price", "99.99")
      .field("category", "64301b1f29ccca0a0868f7c1")
      .field("quantity", "10")
      .field("shipping", "1")
      .attach("photo", path.resolve("./tests/data/sample.png"));

    console.log("Create product response:", res.body);

    expect(res.statusCode).toBe(201);
    expect(res.body?.products?.name).toBe(originalProductName);

    productId = res.body.products._id;
  });

  it("should update the product", async () => {
    const res = await request(app)
      .put(`/api/v1/product/update-product/${productId}`)
      .set("Authorization", `Bearer ${token}`)
      .field("name", updatedProductName)
      .field("description", "Updated product description.")
      .field("price", "149.99")
      .field("category", "64301b1f29ccca0a0868f7c1")
      .field("quantity", "5")
      .field("shipping", "0");

    console.log("📝 Update product response:", res.body);

    expect(res.statusCode).toBe(201);
    expect(res.body?.products?.name).toBe(updatedProductName);
  });

  it("should fetch product list and include updated product", async () => {
    const res = await request(app).get("/api/v1/product/get-product");
    expect(res.statusCode).toBe(200);

    const productNames = res.body.products.map((p) => p.name);
    console.log("🧾 Product names list:", productNames);
    expect(productNames).toContain(updatedProductName);
  });

  it("should delete the product", async () => {
    const res = await request(app)
      .delete(`/api/v1/product/delete-product/${productId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

  it("should fetch product list and not show deleted product", async () => {
    const res = await request(app).get("/api/v1/product/get-product");
    expect(res.statusCode).toBe(200);

    const productNames = res.body.products.map((p) => p.name);
    expect(productNames).not.toContain(updatedProductName);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  }, 20000);
});
