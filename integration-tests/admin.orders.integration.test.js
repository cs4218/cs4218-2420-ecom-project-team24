import request from "supertest";
import app from "../server.js";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import Product from "../models/productModel.js"

const hashedPassword = await bcrypt.hash("admin@test.com", 10);

describe("Admin Orders Flow (Integration Test)", () => {
  let token;
  let orderId;
  let adminId;
  let testProduct;

  beforeAll(async () => {
    let admin = await User.create({
      name: "Test Admin",
      email: "admin@test.com",
      password: hashedPassword,
      phone: "1234567890",
      address: "123 Admin Street",
      answer: "football",
      role: 1,
    });
    adminId = admin._id;

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "admin@test.com",
      password: "admin@test.com",
    });

    token = res.body?.token;
    if (!token) throw new Error("Login failed - no token received");

    // Create a test product (mocked for order)
    testProduct = await Product.create({
      name: "Test Product",
      description: "Test product description",
      price: 100,
      category: "Test Category",
      quantity: 1,
      shipping: true,
      photo: {
        data: Buffer.from(""),
        contentType: "image/png",
      },
    });

    // Create test order
    const order = await Order.create({
      products: [testProduct],
      payment: {
        success: true,
        transaction: "test_txn_123",
      },
      buyer: adminId,
      status: "Processing",
    });

    orderId = order._id;
  });

  it("should fetch all orders", async () => {
    const res = await request(app)
      .get("/api/v1/auth/all-orders")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    orderId = res.body[0]._id;
  });

  it("should update the order status", async () => {
    const res = await request(app)
      .put(`/api/v1/auth/order-status/${orderId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "Shipped" });

    expect(res.statusCode).toBe(200);
    expect(res.body?.status).toBe("Shipped");
  });

  afterAll(async () => {
    await mongoose.disconnect();
  }, 20000);
});
