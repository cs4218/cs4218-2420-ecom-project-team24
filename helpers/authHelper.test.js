import bcrypt from "bcrypt";
import { hashPassword, comparePassword } from "./authHelper";

// code adapted from https://chatgpt.com/share/67cd811b-081c-8013-b107-816d4f9e6819
describe("Password Hashing and Comparison", () => {
  test("hashPassword should return a hashed password", async () => {
    const password = "mySecurePassword";
    const hashedPassword = await hashPassword(password);

    expect(hashedPassword).toBeDefined();
    expect(typeof hashedPassword).toBe("string");
    expect(hashedPassword).not.toBe(password);
  });

  test("comparePassword should return true for correct password", async () => {
    const password = "mySecurePassword";
    const hashedPassword = await hashPassword(password);

    const isMatch = await comparePassword(password, hashedPassword);
    expect(isMatch).toBe(true);
  });

  test("comparePassword should return false for incorrect password", async () => {
    const password = "mySecurePassword";
    const wrongPassword = "wrongPassword123";
    const hashedPassword = await hashPassword(password);

    const isMatch = await comparePassword(wrongPassword, hashedPassword);
    expect(isMatch).toBe(false);
  });

  test("hashPassword should throw an error when given no password", async () => {
    await expect(hashPassword(null)).rejects.toThrow();
  });
});
