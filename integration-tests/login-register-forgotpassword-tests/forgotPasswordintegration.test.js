import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import authRoutes from '../../routes/authRoute';
import userModel from '../../models/userModel';
import { hashPassword, comparePassword } from '../../helpers/authHelper';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Set up Express server
const app = express();
app.use(bodyParser.json());
app.use('/api/v1/auth', authRoutes);

// Set up MongoMemoryServer
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  process.env.MONGO_URL = uri;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await userModel.deleteMany({});
});

describe('Forgot Password API Integration Tests', () => {
  it('should reset the password successfully', async () => {
    // Pre-register a user
    const hashedPassword = await hashPassword('password123');
    await userModel.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      phone: '1234567890',
      address: '123 Main St',
      answer: 'Blue',
    });

    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({
        email: 'john@example.com',
        answer: 'Blue',
        newPassword: 'newpassword123',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Password Reset Successfully');

    // Verify that the password has been updated
    const user = await userModel.findOne({ email: 'john@example.com' });
    const isMatch = await comparePassword('newpassword123', user.password);
    expect(isMatch).toBe(true);
  });

  it('should show error message if email is missing', async () => {
    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({
        email: '',
        answer: 'Blue',
        newPassword: 'newpassword123',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Emai is required');
  });

  it('should show error message if answer is missing', async () => {
    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({
        email: 'john@example.com',
        answer: '',
        newPassword: 'newpassword123',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('answer is required');
  });

  it('should show error message if new password is missing', async () => {
    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({
        email: 'john@example.com',
        answer: 'Blue',
        newPassword: '',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('New Password is required');
  });

  it('should show error message if email or answer is incorrect', async () => {
    // Pre-register a user
    const hashedPassword = await hashPassword('password123');
    await userModel.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      phone: '1234567890',
      address: '123 Main St',
      answer: 'Blue',
    });

    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({
        email: 'john@example.com',
        answer: 'WrongAnswer',
        newPassword: 'newpassword123',
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Wrong Email Or Answer');
  });
});