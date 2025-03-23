import { MongoMemoryServer } from "mongodb-memory-server";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

let mongoServer;

export default async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  process.env.MONGO_URL = uri;

  global.__MONGOD__ = mongoServer;

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("🚀 In-memory MongoDB started for integration tests:", uri);
};
