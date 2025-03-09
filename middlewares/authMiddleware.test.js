import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { requireSignIn, isAdmin } from "./authMiddleware.js";

jest.mock("jsonwebtoken");
jest.mock("../models/userModel.js");

// code adapted from https://chatgpt.com/share/67cd79ab-67e4-8013-920c-5cea58cd0418
describe("Auth Middleware Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: "Bearer validToken",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  describe("requireSignIn", () => {
    test("should verify token and attach user to request", async () => {
      JWT.verify.mockReturnValue({ _id: "12345", role: 0 });

      await requireSignIn(req, res, next);

      expect(JWT.verify).toHaveBeenCalledWith(
        "Bearer validToken",
        process.env.JWT_SECRET
      );
      expect(req.user).toEqual({ _id: "12345", role: 0 });
      expect(next).toHaveBeenCalled();
    });

    test("should return error if token is invalid", async () => {
      jest.spyOn(console, "log").mockImplementation(() => {});

      JWT.verify.mockImplementation(() => {
        throw new Error("Invalid Token");
      });

      await requireSignIn(req, res, next);

      expect(console.log).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("isAdmin", () => {
    beforeEach(() => {
      req.user = { _id: "12345" };
    });

    test("should allow access for admin users", async () => {
      userModel.findById.mockResolvedValue({ _id: "12345", role: 1 });

      await isAdmin(req, res, next);

      expect(userModel.findById).toHaveBeenCalledWith("12345");
      expect(next).toHaveBeenCalled();
    });

    test("should deny access for non-admin users", async () => {
      userModel.findById.mockResolvedValue({ _id: "12345", role: 0 });

      await isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "UnAuthorized Access",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should handle errors in isAdmin middleware", async () => {
      userModel.findById.mockRejectedValue(new Error("Database error"));

      await isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: expect.any(Error),
        message: "Error in admin middleware",
      });
    });
  });
});
