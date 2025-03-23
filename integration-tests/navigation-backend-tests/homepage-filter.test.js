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
const PORT = 6061;

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
    category: category1._id,
    quantity: 10,
    shipping: true,
  });

  await Product.create({
    name: "Product 2",
    slug: "product-2",
    description: "Description 2",
    price: 50,
    category: category2._id,
    quantity: 5,
    shipping: false,
  });

  await Product.create({
    name: "Product 3",
    slug: "product-3",
    description: "Description 3",
    price: 150,
    category: category1._id,
    quantity: 8,
    shipping: true,
  });
});

afterAll(async () => {
  await server.close();
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("HomePage Filter Backend Integration Tests", () => {
  it("should filter products by category", async () => {
    const category1 = await Category.findOne({ slug: "category-1" });

    const response = await supertest(app)
      .post("/api/v1/product/product-filters")
      .send({
        checked: [category1._id], // Filter by Category 1
        radio: [], // No price filter
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.products).toHaveLength(2);
    expect(response.body.products.map((p) => p.name)).toEqual(
      expect.arrayContaining(["Product 1", "Product 3"])
    );
  });

  it("should filter products by price range $20 to $40", async () => {
    const response = await supertest(app)
      .post("/api/v1/product/product-filters")
      .send({
        checked: [], // No category filter
        radio: [20, 40], // Price range: $20 to $40
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.products).toHaveLength(1); 
    expect(response.body.products[0].name).toBe("Product 1");
  });

  it("should filter products by price range $40 to $60", async () => {
    const response = await supertest(app)
      .post("/api/v1/product/product-filters")
      .send({
        checked: [], // No category filter
        radio: [40, 60], // Price range: $40 to $60
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.products).toHaveLength(1);
    expect(response.body.products[0].name).toBe("Product 2");
  });

  it("should filter products by price range $100 or more", async () => {
    const response = await supertest(app)
      .post("/api/v1/product/product-filters")
      .send({
        checked: [], // No category filter
        radio: [100, 999], // Price range: $100 or more
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.products).toHaveLength(1); 
    expect(response.body.products[0].name).toBe("Product 3");
  });

  it("should filter products by category and price range $20 to $40", async () => {
    const category1 = await Category.findOne({ slug: "category-1" });

    const response = await supertest(app)
      .post("/api/v1/product/product-filters")
      .send({
        checked: [category1._id], // Filter by Category 1
        radio: [20, 40], // Price range: $20 to $40
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.products).toHaveLength(1); 
    expect(response.body.products[0].name).toBe("Product 1");
  });

  it("should return no products for a non-existing category and non-matching price range", async () => {
    const nonExistingCategoryId = new mongoose.Types.ObjectId(); // Generate a random ObjectId
  
    const response = await supertest(app)
      .post("/api/v1/product/product-filters")
      .send({
        checked: [nonExistingCategoryId], // Non-existing category
        radio: [1000, 2000], // Price range that doesn't match any product
      })
      .expect(200);
  
    expect(response.body.success).toBe(true);
    expect(response.body.products).toHaveLength(0); // No products should match
  });

  it("should return no products for a non-existing category", async () => {
    const nonExistingCategoryId = new mongoose.Types.ObjectId(); // Generate a random ObjectId
  
    const response = await supertest(app)
      .post("/api/v1/product/product-filters")
      .send({
        checked: [nonExistingCategoryId], // Non-existing category
        radio: [], // No price filter
      })
      .expect(200);
  
    expect(response.body.success).toBe(true);
    expect(response.body.products).toHaveLength(0); // No products should match
  });

  it("should return no products for a non-matching price range", async () => {
    const response = await supertest(app)
      .post("/api/v1/product/product-filters")
      .send({
        checked: [], // No category filter
        radio: [1000, 2000], // Price range that doesn't match any product
      })
      .expect(200);
  
    expect(response.body.success).toBe(true);
    expect(response.body.products).toHaveLength(0); // No products should match
  });

  it("should reset filters and return all products", async () => {
    const response = await supertest(app)
      .post("/api/v1/product/product-filters")
      .send({
        checked: [], // No category filter
        radio: [], // No price filter
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.products).toHaveLength(3); 
  });

  it("should return 400 for invalid request payload", async () => {
    const response = await supertest(app)
      .post("/api/v1/product/product-filters")
      .send({
        checked: "invalid-data", // Invalid data type for `checked`
        radio: "invalid-data", // Invalid data type for `radio`
      })
      .expect(400);
  
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Error WHile Filtering Products");
  });

});