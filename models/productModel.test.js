import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Products from "./productModel";
import Category from "./categoryModel"; // Ensure you have a categoryModel.js file

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Products Model Unit Tests", () => {
  let category;

  beforeEach(async () => {
    category = new Category({
      name: "Test Category",
      slug: "test-category",
    });
    await category.save();
  });

  // TEST #1
  it("should have the correct fields and enforce correct field types", () => {
    const fields = Object.keys(Products.schema.paths);
    expect(fields).toContain("name");
    expect(fields).toContain("slug");
    expect(fields).toContain("description");
    expect(fields).toContain("price");
    expect(fields).toContain("category");
    expect(fields).toContain("quantity");
    expect(fields).toContain("photo.data");
    expect(fields).toContain("photo.contentType");
    expect(fields).toContain("shipping");
    expect(fields).toContain("_id");
    expect(fields).toContain("__v"); // Mongoose version key
    expect(fields).toContain("createdAt");
    expect(fields).toContain("updatedAt");
    expect(fields).toHaveLength(13); // _id, name, slug, description, price, category, quantity, photo.data, photo.contentType, shipping, __v, createdAt, updatedAt

    expect(Products.schema.paths.name.instance).toBe("String");
    expect(Products.schema.paths.slug.instance).toBe("String");
    expect(Products.schema.paths.description.instance).toBe("String");
    expect(Products.schema.paths.price.instance).toBe("Number");
    expect(Products.schema.paths.category.instance).toBe("ObjectId");
    expect(Products.schema.paths.quantity.instance).toBe("Number");
    expect(Products.schema.paths["photo.data"].instance).toBe("Buffer");
    expect(Products.schema.paths["photo.contentType"].instance).toBe("String");
    expect(Products.schema.paths.shipping.instance).toBe("Boolean");
  });

  describe("Model Validation", () => {
    // TEST #2
    it("should accept valid product data", async () => {
      const product = new Products({
        name: "Test Product",
        slug: "test-product",
        description: "This is a test product",
        price: 100,
        category: category._id,
        quantity: 10,
        shipping: true,
      });
      const err = product.validateSync();
      expect(err).toBeUndefined();
    });

    // TEST #3
    it("should require a name", async () => {
      const product = new Products({
        slug: "test-product",
        description: "This is a test product",
        price: 100,
        category: category._id,
        quantity: 10,
        shipping: true,
      });
      const err = product.validateSync();
      expect(err.errors.name).toBeDefined();
    });

    // TEST #4
    it("should require a slug", async () => {
      const product = new Products({
        name: "Test Product",
        description: "This is a test product",
        price: 100,
        category: category._id,
        quantity: 10,
        shipping: true,
      });
      const err = product.validateSync();
      expect(err.errors.slug).toBeDefined();
    });

    // TEST #5
    it("should require a description", async () => {
      const product = new Products({
        name: "Test Product",
        slug: "test-product",
        price: 100,
        category: category._id,
        quantity: 10,
        shipping: true,
      });
      const err = product.validateSync();
      expect(err.errors.description).toBeDefined();
    });

    // TEST #6
    it("should require a price", async () => {
      const product = new Products({
        name: "Test Product",
        slug: "test-product",
        description: "This is a test product",
        category: category._id,
        quantity: 10,
        shipping: true,
      });
      const err = product.validateSync();
      expect(err.errors.price).toBeDefined();
    });

    // TEST #7
    it("should require a category", async () => {
      const product = new Products({
        name: "Test Product",
        slug: "test-product",
        description: "This is a test product",
        price: 100,
        quantity: 10,
        shipping: true,
      });
      const err = product.validateSync();
      expect(err.errors.category).toBeDefined();
    });

    // TEST #8
    it("should require a quantity", async () => {
      const product = new Products({
        name: "Test Product",
        slug: "test-product",
        description: "This is a test product",
        price: 100,
        category: category._id,
        shipping: true,
      });
      const err = product.validateSync();
      expect(err.errors.quantity).toBeDefined();
    });

    // TEST #9
    it("should allow creating a product without optional fields", async () => {
      const product = new Products({
        name: "Test Product",
        slug: "test-product",
        description: "This is a test product",
        price: 100,
        category: category._id,
        quantity: 10,
      });
      const savedProduct = await product.save();

      expect(savedProduct._id).toBeDefined();
      expect(savedProduct.name).toBe("Test Product");
      expect(savedProduct.slug).toBe("test-product");
      expect(savedProduct.description).toBe("This is a test product");
      expect(savedProduct.price).toBe(100);
      expect(savedProduct.category).toBe(product.category);
      expect(savedProduct.quantity).toBe(10);
      expect(savedProduct.shipping).toBeUndefined();
    });
  });

  describe("Model Methods and Properties", () => {
    // TEST #10
    it("should create a new product with valid data", async () => {
      const validProduct = new Products({
        name: "Test Product",
        slug: "test-product",
        description: "This is a test product",
        price: 100,
        category: category._id,
        quantity: 10,
        shipping: true,
      });
      const savedProduct = await validProduct.save();

      expect(savedProduct._id).toBeDefined();
      expect(savedProduct.name).toBe("Test Product");
      expect(savedProduct.slug).toBe("test-product");
      expect(savedProduct.description).toBe("This is a test product");
      expect(savedProduct.price).toBe(100);
      expect(savedProduct.category).toBe(validProduct.category);
      expect(savedProduct.quantity).toBe(10);
      expect(savedProduct.shipping).toBe(true);
    });

    // TEST #11
    it("should update the quantity of an existing product", async () => {
      const product = new Products({
        name: "Test Product",
        slug: "test-product",
        description: "This is a test product",
        price: 100,
        category: category._id,
        quantity: 10,
        shipping: true,
      });
      const savedProduct = await product.save();

      savedProduct.quantity = 20;
      const updatedProduct = await savedProduct.save();

      expect(updatedProduct.quantity).toBe(20);
    });

    // TEST #12
    it("should delete a product from the database", async () => {
      const product = new Products({
        name: "Test Product",
        slug: "test-product",
        description: "This is a test product",
        price: 100,
        category: category._id,
        quantity: 10,
        shipping: true,
      });
      const savedProduct = await product.save();

      await Products.findByIdAndDelete(savedProduct._id);
      const deletedProduct = await Products.findById(savedProduct._id);

      expect(deletedProduct).toBeNull();
    });
  });
});