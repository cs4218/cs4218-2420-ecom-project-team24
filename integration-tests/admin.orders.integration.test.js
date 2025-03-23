import request from "supertest";
import app from "../server.js";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import Category from "../models/categoryModel.js";
import bcrypt from "bcrypt";
import slugify from "slugify";

const hashedPassword = await bcrypt.hash("admin@test.com", 10);

// code adapted from https://chatgpt.com/share/67df0798-33d4-8013-b7f0-3915a1021025
describe("Admin Orders Flow (Integration Test)", () => {
  let token;
  let orderId;
  let adminId;
  let testProduct;

  beforeAll(async () => {
    let admin = await User.create({
      name: "Test Admin",
      email: "admin2@test.com",
      password: hashedPassword,
      phone: "1234567890",
      address: "123 Admin Street",
      answer: "football",
      role: 1,
    });
    adminId = admin._id;

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "admin2@test.com",
      password: "admin@test.com",
    });

    token = res.body?.token;
    if (!token) throw new Error("Login failed - no token received");

    const testCategory = await Category.create({
      name: "Test Category",
      slug: slugify("Test Category"),
    });

    testProduct = await Product.create({
      name: "Test Product",
      slug: slugify("Test Product"),
      description: "Test product description",
      price: 100,
      category: testCategory._id,
      quantity: 1,
      shipping: true,
      photo: {
        data: Buffer.from(""),
        contentType: "image/png",
      },
    });

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

    console.log("GET /all-orders response body:", res.body);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]._id).toBe(orderId.toString());
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
