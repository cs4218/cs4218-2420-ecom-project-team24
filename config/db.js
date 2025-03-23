import mongoose from "mongoose";
import colors from "colors";

// code adapted from https://chatgpt.com/share/67de7c9f-658c-8013-bf52-0f4e48431a31
const connectDB = async (customUri = null) => {
  try {
    const mongoUri = customUri || process.env.MONGO_URL;

    if (!mongoUri) {
      throw new Error("MongoDB URI is missing");
    }

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(
      `Connected To MongoDB at ${conn.connection.host}`.bgMagenta.white
    );
  } catch (error) {
    console.log(`Error connecting to MongoDB: ${error}`.bgRed.white);
    process.exit(1);
  }
};

export default connectDB;
