import mongoose from 'mongoose'
import colors from 'colors'

// code adapted from https://chatgpt.com/share/67de7c9f-658c-8013-bf52-0f4e48431a31
const connectDB = async (customUri = null) => {
  try {
    const mongoUri = customUri || process.env.MONGO_URL

    if (!mongoUri) {
      throw new Error('Invalid connection string')
    }

    const conn = await mongoose.connect(mongoUri)

    console.log(`Connected To Mongodb Database ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.log(`Error in Mongodb ${error}`)
  }
}

export default connectDB
