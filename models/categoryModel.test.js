import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Category from "./categoryModel";

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

describe("Category Model Unit Tests", () => {
  // Test schema definition
  describe("Schema Definition", () => {
    // TEST #1
    it("should have the correct fields", () => {
      const fields = Object.keys(Category.schema.paths);
      expect(fields).toContain("name");
      expect(fields).toContain("slug");
      expect(fields).toContain("_id");
      expect(fields).toContain("__v"); // Mongoose version key
      expect(fields).toHaveLength(4); // _id, name, slug, __v
    });

    // TEST #2
    it("should enforce correct field types", () => {
      expect(Category.schema.paths.name.instance).toBe("String");
      expect(Category.schema.paths.slug.instance).toBe("String");
    });

    // TEST #3
    it("should convert slug to lowercase", async () => {
      const category = new Category({
        name: "Test Category",
        slug: "TEST-CATEGORY"
      });
      await category.save();
      expect(category.slug).toBe("test-category");
    });

    // TEST #4
    it("should handle special characters in slug", async () => {
      const category = new Category({
        name: "Test & Category",
        slug: "TEST & CATEGORY"
      });
      await category.save();
      expect(category.slug).toBe("test & category");
    });
  });

  // Test model validation
  describe("Model Validation", () => {
    // TEST #5
    it("should allow empty fields", async () => {
      const category = new Category({});
      await category.validate();
      expect(category.name).toBeUndefined();
      expect(category.slug).toBeUndefined();
    });

    // TEST #6
    it("should accept valid category data", async () => {
      const category = new Category({
        name: "Electronics",
        slug: "electronics"
      });
      const err = await category.validate();
      expect(err).toBeUndefined();
    });

    // TEST #7
    it("should accept category with only name", async () => {
      const category = new Category({
        name: "Electronics"
      });
      const err = await category.validate();
      expect(err).toBeUndefined();
    });

    // TEST #8
    it("should accept category with only slug", async () => {
      const category = new Category({
        slug: "electronics"
      });
      const err = await category.validate();
      expect(err).toBeUndefined();
    });
  });

  // Test model methods and properties
  describe("Model Methods and Properties", () => {
    // TEST #9
    it("should create a new category with valid data", async () => {
      const category = new Category({
        name: "Electronics",
        slug: "electronics"
      });
      await category.save();
      expect(category._id).toBeDefined();
      expect(category.name).toBe("Electronics");
      expect(category.slug).toBe("electronics");
    });

    // TEST #10
    it("should create category with minimal fields", async () => {
      const category = new Category({});
      await category.save();
      expect(category._id).toBeDefined();
      expect(category.name).toBeUndefined();
      expect(category.slug).toBeUndefined();
    });

    // TEST #11
    it("should handle null values", async () => {
      const category = new Category({
        name: null,
        slug: null
      });
      await category.save();
      expect(category._id).toBeDefined();
      expect(category.name).toBeNull();
      expect(category.slug).toBeNull();
    });

    // TEST #12
    it("should handle empty string values", async () => {
      const category = new Category({
        name: "",
        slug: ""
      });
      await category.save();
      expect(category._id).toBeDefined();
      expect(category.name).toBe("");
      expect(category.slug).toBe("");
    });
  });
});