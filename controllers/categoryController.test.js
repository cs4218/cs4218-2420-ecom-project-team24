import { jest } from '@jest/globals'
import {
  createCategoryController,
  updateCategoryController,
  categoryController,
  singleCategoryController,
  deleteCategoryController
} from './categoryController.js'
import categoryModel from '../models/categoryModel.js'
import slugify from 'slugify'

// Mock dependencies
jest.mock('../models/categoryModel.js') // Mock all categoryModel functions and properties
jest.mock('slugify', () =>
  jest.fn(name => name.toLowerCase().replace(/\s+/g, '-'))
) // Mock slugify function

describe('Category Controller Tests', () => {
  let req, res

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock request and response objects
    req = {
      body: { name: 'Electronics' },
      params: { id: 'category123', slug: 'electronics' }
    }

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    }
  })

  describe('Create Category Controller', () => {
    test('should return error when name is missing', async () => {
      req.body.name = ''
      await createCategoryController(req, res)
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.send).toHaveBeenCalledWith({ message: 'Name is required' })
    })

    test('should return error when category already exists', async () => {
      categoryModel.findOne = jest
        .fn()
        .mockResolvedValue({ name: 'Electronics' })
      await createCategoryController(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: 'Category Already Exisits'
      })
    })

    test('should create a new category successfully', async () => {
      categoryModel.findOne = jest.fn().mockResolvedValue(null)
      categoryModel.prototype.save = jest.fn().mockResolvedValue(req.body)
      await createCategoryController(req, res)
      expect(categoryModel.prototype.save).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: 'new category created',
        category: req.body
      })
    })
  })
})
