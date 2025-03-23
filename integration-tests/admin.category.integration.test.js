import request from "supertest";
import app from "../server.js";
import mongoose from "mongoose";

// code adapted from https://chatgpt.com/share/67df0798-33d4-8013-b7f0-3915a1021025
describe("Admin Category Flow (Integration Test)", () => {
  let token;
  let categoryId;
  let originalCategoryName;

  beforeAll(async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "cs4218@test.com",
      password: "cs4218@test.com",
    });
    token = res.body?.token;
    if (!token) throw new Error("Login failed - no token received");
  });

  it("should create a category", async () => {
    originalCategoryName = `Integration Category ${Date.now()}`;

    const res = await request(app)
      .post("/api/v1/category/create-category")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: originalCategoryName });

    console.log("🚀 Create category response body:", res.body);

    expect(res.statusCode).toBe(201);
    expect(res.body?.category?.name).toBe(originalCategoryName);

    categoryId = res.body.category._id;
  });

  it("should update the category name", async () => {
    const updatedName = `${originalCategoryName} Updated`;

    const res = await request(app)
      .put(`/api/v1/category/update-category/${categoryId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: updatedName });

    console.log("Update category response body:", res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body?.category?.name).toBe(updatedName);
  });

  it("should fetch the category list and find the new category", async () => {
    const updatedName = `${originalCategoryName} Updated`;
    const res = await request(app)
      .get("/api/v1/category/get-category")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    console.log("🧾 get-category response:", res.body);
    const names = res.body.category.map((c) => c.name);
    expect(names).toContain(updatedName);
  });

  it("should delete the category", async () => {
    const res = await request(app)
      .delete(`/api/v1/category/delete-category/${categoryId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

  it("should fetch the category list and not show the deleted category", async () => {
    const getRes = await request(app)
      .get("/api/v1/category/get-category")
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.statusCode).toBe(200);
    const names = getRes.body.category.map((c) => c.name);

    const deletedName = `${originalCategoryName} Updated`;
    expect(names).not.toContain(deletedName);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  }, 20000);
});
