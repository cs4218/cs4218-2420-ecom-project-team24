import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import authRoutes from '../routes/authRoute';
import userModel from '../models/userModel';
import { registerController } from '../controllers/authController';

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

describe('Register API Integration Tests', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '1234567890',
        address: '123 Main St',
        answer: 'Blue',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('User Register Successfully');
    expect(response.body.user).toHaveProperty('_id');
    expect(response.body.user.name).toBe('John Doe');
    expect(response.body.user.email).toBe('john@example.com');

    // Verify that the user is actually saved in the database
    const user = await userModel.findOne({ email: 'john@example.com' });
    expect(user).toBeTruthy();
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
  });

  it('should show error message if registration fails due to existing user', async () => {
    // Pre-register a user to cause a registration failure
    await userModel.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
      phone: '1234567890',
      address: '123 Main St',
      answer: 'Blue',
    });

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        phone: '1234567890',
        address: '123 Main St',
        answer: 'Blue',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Already Register please login');

    // Verify that no additional user is created
    const users = await userModel.find({ email: 'jane@example.com' });
    expect(users.length).toBe(1);
  });

  it('should show error message if name is missing', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: '',
        email: 'delta@delta.com',
        password: 'NewPassword',
        phone: '90908080',
        address: 'Random Address',
        answer: 'Tennis',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Name is Required');

    // Verify that no user is created
    const user = await userModel.findOne({ email: 'delta@delta.com' });
    expect(user).toBeNull();
  });

  it('should show error message if password is missing', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'No Password',
        email: 'nopassword@example.com',
        password: '',
        phone: '1234567890',
        address: '123 Main St',
        answer: 'Blue',
      });
  
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Password is Required');
  
    // Verify that no user is created
    const user = await userModel.findOne({ email: 'nopassword@example.com' });
    expect(user).toBeNull();
  });
});