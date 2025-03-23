import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import supertest from "supertest";
import categoryRoutes from "../../routes/categoryRoutes";
import productRoutes from "../../routes/productRoutes";
import Category from "../../models/categoryModel";
import Product from "../../models/productModel";

const app = express();
app.use(express.json());
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);

let mongoServer;
let server;
const PORT = 6062;

beforeAll(async () => {
  // Start in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  server = app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
  });

  // Seed categories
  const category1 = await Category.create({ name: "Category 1", slug: "category-1" });
  const category2 = await Category.create({ name: "Category 2", slug: "category-2" });

  // Seed products
  await Product.create({
    name: "Product 1",
    slug: "product-1",
    description: "Description 1",
    price: 25,
    category: category1._id, // Use the ObjectId of Category 1
    quantity: 10,
    shipping: true,
  });

  await Product.create({
    name: "Product 2",
    slug: "product-2",
    description: "Description 2",
    price: 50,
    category: category2._id, // Use the ObjectId of Category 2
    quantity: 5,
    shipping: false,
  });

  await Product.create({
    name: "Product 3",
    slug: "product-3",
    description: "Description 3",
    price: 150,
    category: category1._id, // Use the ObjectId of Category 1
    quantity: 8,
    shipping: true,
  });
});

afterAll(async () => {
  await server.close();
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("HomePage Backend Integration Tests", () => {
  it("should fetch all categories", async () => {
    const response = await supertest(app)
      .get("/api/v1/category/get-category")
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.category).toHaveLength(2); // Two categories seeded
    expect(response.body.category.map((c) => c.name)).toEqual(
      expect.arrayContaining(["Category 1", "Category 2"])
    );
  });

  it("should fetch all products", async () => {
    const response = await supertest(app)
      .get("/api/v1/product/get-product")
      .expect(200);

    expect(response.body.products).toHaveLength(3); // Three products seeded
    expect(response.body.products.map((p) => p.name)).toEqual(
      expect.arrayContaining(["Product 1", "Product 2", "Product 3"])
    );
  });

  it("should fetch the total product count", async () => {
    const response = await supertest(app)
      .get("/api/v1/product/product-count")
      .expect(200);

    expect(response.body.total).toBe(3); // Three products seeded
  });

  it("should fetch products by category", async () => {
    const category1 = await Category.findOne({ slug: "category-1" });

    const response = await supertest(app)
      .get(`/api/v1/product/product-category/${category1.slug}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.products).toHaveLength(2); // Products 1 and 3 belong to Category 1
    expect(response.body.products.map((p) => p.name)).toEqual(
      expect.arrayContaining(["Product 1", "Product 3"])
    );
  });

  it("should fetch a single product by slug", async () => {
    const response = await supertest(app)
      .get("/api/v1/product/get-product/product-1")
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.product.name).toBe("Product 1");
    expect(response.body.product.price).toBe(25);
  });
});