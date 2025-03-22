// code adapted from https://chatgpt.com/share/67de7c9f-658c-8013-bf52-0f4e48431a31
const { MongoMemoryServer } = require("mongodb-memory-server");
const dotenv = require("dotenv");
const { exec } = require("child_process");
const path = require("path");

dotenv.config();

let mongoServer;

module.exports = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  process.env.MONGO_URL = uri;

  global.__MONGOD__ = mongoServer;

  const backend = exec(
    `cross-env NODE_ENV=test MONGO_URL="${uri}" node server.js`,
    {
      cwd: path.resolve(__dirname),
    }
  );

  global.__BACKEND__ = backend;

  console.log("🚀 Test backend started with in-memory MongoDB.");
};