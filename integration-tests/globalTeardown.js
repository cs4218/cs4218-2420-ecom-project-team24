import mongoose from "mongoose";

export default async () => {
  if (global.__MONGOD__) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await global.__MONGOD__.stop();
    console.log("🧹 In-memory MongoDB stopped after tests.");
  }
};
