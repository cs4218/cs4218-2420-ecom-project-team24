import { jest } from '@jest/globals'

import * as categoryController from './categoryController.js'
import categoryModel from '../models/categoryModel.js'

// Mock all the model methods
jest
  .spyOn(categoryModel, 'findOne')
  .mockImplementation(() => Promise.resolve(null))
jest
  .spyOn(categoryModel, 'findByIdAndUpdate')
  .mockImplementation(() => Promise.resolve(null))
jest.spyOn(categoryModel, 'find').mockImplementation(() => Promise.resolve([]))
jest
  .spyOn(categoryModel, 'findByIdAndDelete')
  .mockImplementation(() => Promise.resolve(null))
jest.spyOn(categoryModel.prototype, 'save').mockImplementation(function () {
  return Promise.resolve(this)
})

describe('Category Controller Tests', () => {
  let req, res

  // Cleanup after all tests
  afterAll(done => {
    jest.clearAllMocks()
    done()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    req = {
      body: {
        name: 'Test Category'
      },
      params: {
        id: '123',
        slug: 'test-category'
      }
    }

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    }
  })

  // CREATE CATEGORY
  describe('createCategoryController', () => {
    // TEST #1
    test('should return error if name is not provided', async () => {
      req.body.name = ''
      await categoryController.createCategoryController(req, res)
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.send).toHaveBeenCalledWith({ message: 'Name is required' })
    })

    // TEST #2
    test('should return message if category already exists', async () => {
      categoryModel.findOne.mockResolvedValue({ name: 'Test Category' })
      await categoryController.createCategoryController(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: 'Category Already Exisits'
      })
    })

    // TEST #3
    test('should create new category successfully', async () => {
      categoryModel.findOne.mockResolvedValue(null)
      const mockCategory = { name: 'Test Category', slug: 'test-category' }
      categoryModel.prototype.save.mockResolvedValue(mockCategory)

      await categoryController.createCategoryController(req, res)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: 'New category created',
        category: mockCategory
      })
    })

    // TEST #4
    test('should handle errors', async () => {
      categoryModel.findOne.mockRejectedValue(new Error('Database error'))
      await categoryController.createCategoryController(req, res)
      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  // UPDATE CATEGORY
  describe('updateCategoryController', () => {
    // TEST #1
    test('should update category successfully', async () => {
      const mockUpdatedCategory = {
        name: 'Updated Category',
        slug: 'updated-category'
      }
      categoryModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedCategory)

      await categoryController.updateCategoryController(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        messsage: 'Category Updated Successfully',
        category: mockUpdatedCategory
      })
    })

    // TEST #2
    test('should handle errors during update', async () => {
      categoryModel.findByIdAndUpdate.mockRejectedValue(
        new Error('Update error')
      )
      await categoryController.updateCategoryController(req, res)
      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  // GET ALL
  describe('categoryController', () => {
    // TEST #1
    test('should get all categories successfully', async () => {
      const mockCategories = [
        { name: 'Category 1', slug: 'category-1' },
        { name: 'Category 2', slug: 'category-2' }
      ]
      categoryModel.find.mockResolvedValue(mockCategories)

      await categoryController.categoryController(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: 'All Categories List',
        category: mockCategories
      })
    })

    // TEST #2
    test('should handle errors when getting all categories', async () => {
      categoryModel.find.mockRejectedValue(new Error('Database error'))
      await categoryController.categoryController(req, res)
      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  // SINGLE CATEGORY
  describe('singleCategoryController', () => {
    // TEST #1
    test('should get single category successfully', async () => {
      const mockCategory = { name: 'Test Category', slug: 'test-category' }
      categoryModel.findOne.mockResolvedValue(mockCategory)

      await categoryController.singleCategoryController(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: 'Got Single Category Successfully',
        category: mockCategory
      })
    })

    // TEST #2
    test('should handle errors when getting single category', async () => {
      categoryModel.findOne.mockRejectedValue(new Error('Not found'))
      await categoryController.singleCategoryController(req, res)
      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  // DELETE CATEGORY
  describe('deleteCategoryController', () => {
    // TEST #1
    test('should delete category successfully', async () => {
      categoryModel.findByIdAndDelete.mockResolvedValue({})

      await categoryController.deleteCategoryController(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: 'Categry Deleted Successfully'
      })
    })

    // TEST #2
    test('should handle errors during deletion', async () => {
      categoryModel.findByIdAndDelete.mockRejectedValue(
        new Error('Delete error')
      )
      await categoryController.deleteCategoryController(req, res)
      expect(res.status).toHaveBeenCalledWith(500)
    })
  })
})
