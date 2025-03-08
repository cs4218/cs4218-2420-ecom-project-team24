import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Order from "./orderModel";

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

describe("Order Model Unit Tests", () => {
  it("should have the correct fields and enforce correct field types", () => {
    const fields = Object.keys(Order.schema.paths);
    expect(fields).toContain("products");
    expect(fields).toContain("payment");
    expect(fields).toContain("buyer");
    expect(fields).toContain("status");
    expect(fields).toContain("_id");
    expect(fields).toContain("__v"); // Mongoose version key
    expect(fields).toContain("createdAt");
    expect(fields).toContain("updatedAt");
    expect(fields).toHaveLength(8); // _id, products, payment, buyer, status, __v, createdAt, updatedAt

    expect(Order.schema.paths.products.instance).toBe("Array");
    expect(Order.schema.paths.payment.instance).toBe("Mixed");
    expect(Order.schema.paths.buyer.instance).toBe("ObjectId");
    expect(Order.schema.paths.status.instance).toBe("String");
  });

  describe("Model Validation", () => {
    it("should accept valid order data", async () => {
      const order = new Order({
        products: [new mongoose.Types.ObjectId()],
        payment: { method: "Credit Card", amount: 100 },
        buyer: new mongoose.Types.ObjectId(),
        status: "Not Process",
      });
      const err = order.validateSync();
      expect(err).toBeUndefined();
    });

    it("should allow empty payment field", async () => {
      const order = new Order({
        products: [new mongoose.Types.ObjectId()],
        buyer: new mongoose.Types.ObjectId(),
        status: "Not Process",
      });
      const err = order.validateSync();
      expect(err).toBeUndefined();
    });

    it("should create an order without required fields", async () => {
      const order = new Order({
        status: "Not Process",
      });

      const savedOrder = await order.save();

      expect(savedOrder._id).toBeDefined();
      expect(savedOrder.status).toBe("Not Process");
    });
  });

  describe("Model Methods and Properties", () => {
    it("should create a new order with valid data", async () => {
      const validOrder = new Order({
        products: [new mongoose.Types.ObjectId()],
        payment: { method: "Credit Card", amount: 100 },
        buyer: new mongoose.Types.ObjectId(),
        status: "Not Process",
      });
      const savedOrder = await validOrder.save();

      expect(savedOrder._id).toBeDefined();
      expect(savedOrder.products.length).toBe(1);
      expect(savedOrder.payment.method).toBe("Credit Card");
      expect(savedOrder.payment.amount).toBe(100);
      expect(savedOrder.buyer).toBe(validOrder.buyer);
      expect(savedOrder.status).toBe("Not Process");
    });

    it("should update the status of an existing order", async () => {
      const order = new Order({
        products: [new mongoose.Types.ObjectId()],
        payment: { method: "Credit Card", amount: 100 },
        buyer: new mongoose.Types.ObjectId(),
        status: "Not Process",
      });
      const savedOrder = await order.save();

      savedOrder.status = "Shipped";
      const updatedOrder = await savedOrder.save();

      expect(updatedOrder.status).toBe("Shipped");
    });

    it("should delete an order from the database", async () => {
      const order = new Order({
        products: [new mongoose.Types.ObjectId()],
        payment: { method: "Credit Card", amount: 100 },
        buyer: new mongoose.Types.ObjectId(),
        status: "Not Process",
      });
      const savedOrder = await order.save();

      await Order.findByIdAndDelete(savedOrder._id);
      const deletedOrder = await Order.findById(savedOrder._id);

      expect(deletedOrder).toBeNull();
    });

    it("should create an order without any fields", async () => {
      const order = new Order({});
      const savedOrder = await order.save();

      expect(savedOrder._id).toBeDefined();
      expect(savedOrder.products).toEqual([]);
      expect(savedOrder.payment).toBeUndefined();
      expect(savedOrder.buyer).toBeUndefined();
      expect(savedOrder.status).toBe("Not Process");
    });
  });
});