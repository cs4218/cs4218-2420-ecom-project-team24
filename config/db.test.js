import { jest } from '@jest/globals'
import mongoose from 'mongoose'
import connectDB from './db.js'

// Mock mongoose
jest.mock('mongoose')

// Mock console.log to avoid actual logging
const originalConsoleLog = console.log
beforeAll(() => {
  console.log = jest.fn()
})

afterAll(() => {
  console.log = originalConsoleLog
})

describe('Database Connection', () => {
  // Save original environment
  const originalEnv = process.env

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()

    // Mock console.log
    console.log = jest.fn()

    // Mock process.env
    process.env = {
      ...originalEnv,
      MONGO_URL: 'mongodb://localhost:27017/test'
    }
  })

  afterEach(() => {
    // Restore process.env
    process.env = originalEnv
  })

  test('should connect to the database successfully', async () => {
    // Mock successful connection
    const mockConnection = {
      connection: {
        host: 'localhost'
      }
    }

    mongoose.connect.mockResolvedValue(mockConnection)

    // Call the function
    await connectDB()

    // Verify mongoose.connect was called with the correct URL
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL)

    // Verify success message was logged - we don't check the exact string due to color formatting
    expect(console.log).toHaveBeenCalled()
    expect(console.log.mock.calls[0][0]).toContain(
      `Connected To Mongodb Database ${mockConnection.connection.host}`
    )
  })

  test('should handle connection errors', async () => {
    // Mock connection error
    const mockError = new Error('Connection failed')
    mongoose.connect.mockRejectedValue(mockError)

    // Call the function
    await connectDB()

    // Verify error message was logged - we don't check the exact string due to color formatting
    expect(console.log).toHaveBeenCalled()
    expect(console.log.mock.calls[0][0]).toContain(
      `Error in Mongodb ${mockError}`
    )
  })

  test('should use MONGO_URL from environment variables', async () => {
    // Set a specific test URL
    const testUrl = 'mongodb://testserver:27017/testdb'
    process.env.MONGO_URL = testUrl

    // Mock successful connection
    mongoose.connect.mockResolvedValue({
      connection: { host: 'testserver' }
    })

    // Call the function
    await connectDB()

    // Verify mongoose.connect was called with the correct URL
    expect(mongoose.connect).toHaveBeenCalledWith(testUrl)
  })

  test('should handle missing MONGO_URL environment variable', async () => {
    // Remove MONGO_URL from environment
    delete process.env.MONGO_URL

    // Mock connection error that would occur with undefined URL
    const mockError = new Error('Invalid connection string')
    mongoose.connect.mockRejectedValue(mockError)

    // Call the function
    await connectDB()

    // Verify error was logged
    expect(console.log).toHaveBeenCalled()
    expect(console.log.mock.calls[0][0]).toContain(
      `Error in Mongodb ${mockError}`
    )
  })
})
