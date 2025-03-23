import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { searchProductController } from "../../controllers/productController";

const productCollection = "products";
const categoryCollection = "category";

let mongod;
var categoryId = new mongoose.Types.ObjectId();

const generateMockProducts = (count) => {
    const products = [];
    for (let i = 1; i <= count; i++) {
      products.push({
        _id: new mongoose.Types.ObjectId(),
        name: `Product${i}`,
        slug: `slug-${i}`,
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

const mockProducts = generateMockProducts(3);

const res = {
    send: jest.fn(),
    set: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
}

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URL = mongod.getUri();
    await mongoose.connect(mongod.getUri());
    await mongoose.connection.db.createCollection(categoryCollection);
    await mongoose.connection.db.collection(categoryCollection).insertOne({
        name: "mockCategory1",
        _id: categoryId
    });

    await mongoose.connection.db.createCollection(productCollection);
    await mongoose.connection.db.collection(productCollection).insertMany(mockProducts);
    await mongoose.connection.db.collection(productCollection).insertOne({
        _id: new mongoose.Types.ObjectId(),
        name: `unnamed`,
        slug: `slug-4`,
        description: `Description of product 4`,
        price: (5) * 10,
        quantity: (5) * 10,
        category: {
            _id: categoryId,
            name: 'mockCategory1',
        },
        shipping: true
    });
}, 20000);

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
}, 20000);

describe("SW - Search integration test with database", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    const reqBuilder = (keyword) => {
        return {
            params: {
                keyword: keyword
            }
        }
    }

    it("Should retrieve products from DB successfully with name keyword", async () => {
        const searchReq = reqBuilder("Product1");
        await searchProductController(searchReq, res);
        expect(res.json.mock.calls[0][0]).toHaveLength(1);
    });

    it("Should retrieve products from DB successfully with description keyword", async () => {
        const searchReq = reqBuilder("Description of product 2");
        await searchProductController(searchReq, res);
        expect(res.json.mock.calls[0][0]).toHaveLength(1);
    });

    it("Should retrieve products from DB successfully with name or description keyword", async () => {
        const searchReq = reqBuilder("product");
        await searchProductController(searchReq, res);
        expect(res.json.mock.calls[0][0]).toHaveLength(4);
    });

    it("Should not return search results if wrong keyword is searched", async () => {
        const searchReq = reqBuilder("keywordthatdoesntexist");
        await searchProductController(searchReq, res);
        expect(res.json.mock.calls[0][0]).toHaveLength(0);
    });

    it("Should not return search results if search operation fails", async () => {
        const searchReq = reqBuilder(undefined);
        await searchProductController(searchReq, res);
        expect(res.json).not.toBeCalled();
    });
});
