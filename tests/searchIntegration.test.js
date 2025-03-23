// import { beforeEach, describe, expect, test } from "@jest/globals";
import mongoose, { Types } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import categoryModel from "../models/categoryModel";
import productModel from "../models/productModel";
import { searchProductController } from "../controllers/productController";
import SearchInput from "../client/src/components/Form/SearchInput";

const productCollection = "test-products";
const categoryCollection = "test-category";

let mongoServer;
var categoryId = new mongoose.Types.ObjectId();

const generateMockProducts = (count) => {
    const products = [];
    for (let i = 1; i <= count; i++) {
      products.push({
        _id: new mongoose.Types.ObjectId(),
        name: `Product${i}`,
        slug: `product-${i}`,
        description: `Description of product ${i}`,
        price: (i + 1) * 10,
        quantity: (i + 1) * 10,
        category: {
            _id: categoryId,
            name: 'mockCategory1',
        },
        shipping: true
      });
    }
    return products;
};

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGO_URL = mongoServer.getUri();
    await mongoose.connect(mongoServer.getUri());
    await mongoose.connection.db.createCollection(categoryCollection);
    await mongoose.connection.db.collection(categoryCollection).insertOne({
        name: "mockCategory1",
        _id: categoryId
    });

    await mongoose.connection.db.createCollection(productCollection);
    await mongoose.connection.db.collection(productCollection).insertMany(generateMockProducts(3));
}, 20000);

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
}, 20000);

describe("SW - Search integration test with database", () => {

    const reqBuilder = (keyword) => {
        return {
            params: {
                keyword: keyword
            }
        }
    }

    it("Should make search API call when search is executed", async () => {

    });

    it("Should retrieve products from DB successfully with name keyword", async () => {

    });

    it("Should retrieve products from DB successfully with description keyword", async () => {

    });

    it("Should not return search results if wrong keyword is searched", async () => {

    });

    it("Should not return search results if search operation fails", async () => {

    });

    it("Should navigate to search results page when search is executed", async () => {

    });
});
