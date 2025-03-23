import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import authRoutes from '../routes/authRoute';
import userModel from '../models/userModel';
import { comparePassword, hashPassword } from '../helpers/authHelper';
import dotenv from 'dotenv';

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

describe('Login API Integration Tests', () => {

    it('should hash the password correctly when creating a user', async () => {
        const password = 'password123';
        const hashedPassword = await hashPassword(password);
    
        await userModel.create({
          name: 'John Doe',
          email: 'john@example.com',
          password: hashedPassword,
          phone: '1234567890',
          address: '123 Main St',
          answer: 'Blue',
        });
    
        const user = await userModel.findOne({ email: 'john@example.com' });
        expect(user).toBeTruthy();
        expect(user.password).not.toBe(password);
    
        const isMatch = await comparePassword(password, user.password);
        expect(isMatch).toBe(true);
  });
  
  it('should login a user successfully', async () => {
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
      .post('/api/v1/auth/login')
      .send({
        email: 'john@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('login successfully');
    expect(response.body.user).toHaveProperty('_id');
    expect(response.body.user.email).toBe('john@example.com');
    expect(response.body).toHaveProperty('token');
  });

  it('should show error message if email is not registered', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'notregistered@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Email is not registerd');
  });

  it('should show error message if password is incorrect', async () => {
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
      .post('/api/v1/auth/login')
      .send({
        email: 'john@example.com',
        password: 'wrongpassword',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid Password');
  });

  it('should show error message if email or password is missing', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: '',
        password: '',
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid email or password');
  });
});