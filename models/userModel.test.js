import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "./userModel";

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

beforeEach(async () => {
  await User.deleteMany(); // Ensure a clean state before each test
});

describe("User Model Unit Tests", () => {
  // Test schema definition
  describe("Schema Definition", () => {

    it("should have the correct fields", () => {
      const fields = Object.keys(User.schema.paths);
      expect(fields).toContain("name");
      expect(fields).toContain("email");
      expect(fields).toContain("password");
      expect(fields).toContain("phone");
      expect(fields).toContain("address");
      expect(fields).toContain("answer");
      expect(fields).toContain("role");
      expect(fields).toContain("_id");
      expect(fields).toContain("__v"); // Mongoose version key
      expect(fields).toContain("createdAt");
      expect(fields).toContain("updatedAt");
      expect(fields).toHaveLength(11); // _id, name, email, password, phone, address, answer, role, __v, createdAt, updatedAt
    });


    it("should enforce correct field types", () => {
      expect(User.schema.paths.name.instance).toBe("String");
      expect(User.schema.paths.email.instance).toBe("String");
      expect(User.schema.paths.password.instance).toBe("String");
      expect(User.schema.paths.phone.instance).toBe("String");
      expect(User.schema.paths.address.instance).toBe("Mixed");
      expect(User.schema.paths.answer.instance).toBe("String");
      expect(User.schema.paths.role.instance).toBe("Number");
    });
  });

  // Test model validation
  describe("Model Validation", () => {
 
    it("should require a name", async () => {
      const user = new User({
        email: "test@example.com",
        password: "password123",
        phone: "1234567890",
        address: "123 Main St",
        answer: "test answer",
      });
      let err;
      try {
        await user.validate();
      } catch (error) {
        err = error;
      }
      expect(err.errors.name).toBeDefined();
    });


    it("should require an email", async () => {
      const user = new User({
        name: "Test User",
        password: "password123",
        phone: "1234567890",
        address: "123 Main St",
        answer: "test answer",
      });
      let err;
      try {
        await user.validate();
      } catch (error) {
        err = error;
      }
      expect(err.errors.email).toBeDefined();
    });


    it("should require a password", async () => {
      const user = new User({
        name: "Test User",
        email: "test@example.com",
        phone: "1234567890",
        address: "123 Main St",
        answer: "test answer",
      });
      let err;
      try {
        await user.validate();
      } catch (error) {
        err = error;
      }
      expect(err.errors.password).toBeDefined();
    });


    it("should require a phone", async () => {
      const user = new User({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        address: "123 Main St",
        answer: "test answer",
      });
      let err;
      try {
        await user.validate();
      } catch (error) {
        err = error;
      }
      expect(err.errors.phone).toBeDefined();
    });


    it("should require an address", async () => {
      const user = new User({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        phone: "1234567890",
        answer: "test answer",
      });
      let err;
      try {
        await user.validate();
      } catch (error) {
        err = error;
      }
      expect(err.errors.address).toBeDefined();
    });


    it("should require an answer", async () => {
      const user = new User({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        phone: "1234567890",
        address: "123 Main St",
      });
      let err;
      try {
        await user.validate();
      } catch (error) {
        err = error;
      }
      expect(err.errors.answer).toBeDefined();
    });

 
    it("should accept valid user data", async () => {
      const user = new User({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        phone: "1234567890",
        address: "123 Main St",
        answer: "test answer",
      });
      const err = await user.validate();
      expect(err).toBeUndefined();
    });


    it("should trim the name field", async () => {
      const user = new User({
        name: "  Test User  ",
        email: "test@example.com",
        password: "password123",
        phone: "1234567890",
        address: "123 Main St",
        answer: "test answer",
      });
      await user.save();
      expect(user.name).toBe("Test User");
    });

    it("should set the default role to 0", async () => {
        const user = new User({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
          phone: "1234567890",
          address: "123 Main St",
          answer: "test answer",
        });
        await user.save();
        expect(user.role).toBe(0);
      });
  });

  // Test model methods and properties
  describe("Model Methods and Properties", () => {
  
    it("should create a new user with minimal required data", async () => {
      const user = new User({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        phone: "1234567890",
        address: "123 Main St",
        answer: "test answer",
        role: 2,
      });
      await user.save();
      expect(user._id).toBeDefined();
      expect(user.name).toBe("Test User");
      expect(user.email).toBe("test@example.com");
      expect(user.password).toBe("password123");
      expect(user.phone).toBe("1234567890");
      expect(user.address).toBe("123 Main St");
      expect(user.answer).toBe("test answer");
      expect(user.role).toBe(2);
    });


    it("should update the role and phone of an existing user", async () => {
        const user = new User({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        phone: "1234567890",
        address: "123 Main St",
        answer: "test answer",
        });
        await user.save();

        user.role = 1;
        user.phone = "0987654321";
        await user.save();

        const updatedUser = await User.findById(user._id);
        expect(updatedUser.role).toBe(1);
        expect(updatedUser.phone).toBe("0987654321");
    });

    it("should delete an existing user", async () => {
        const user = new User({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        phone: "1234567890",
        address: "123 Main St",
        answer: "test answer",
        });
        await user.save();

        await User.findByIdAndDelete(user._id);

        const deletedUser = await User.findById(user._id);
        expect(deletedUser).toBeNull();
    });

    it("should not create user with duplicate email", async () => {
      const user1 = new User({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        phone: "1234567890",
        address: "123 Main St",
        answer: "test answer",
      });
      await user1.save();

      const user2 = new User({
        name: "Another User",
        email: "test@example.com",
        password: "password456",
        phone: "0987654321",
        address: "456 Another St",
        answer: "another answer",
      });

      let err;
      try {
        await user2.save();
      } catch (error) {
        err = error;
      }
      expect(err).toBeDefined();
      expect(err.code).toBe(11000); // Duplicate key error code
    });
  });
});