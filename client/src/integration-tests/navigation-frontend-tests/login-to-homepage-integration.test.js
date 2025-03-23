import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import "@testing-library/jest-dom/extend-expect";
import Login from "../../pages/Auth/Login";
import HomePage from "../../pages/HomePage"; 
import { AuthProvider } from "../../context/auth"; 
import { CartProvider } from "../../context/cart"; 
import { SearchProvider } from "../../context/search";
import toast from "react-hot-toast";

jest.mock("axios");
jest.mock("react-hot-toast");

describe("Login to Homepage Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("navigates to homepage on successful login and verifies homepage components", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        user: { id: 1, name: "John Doe", email: "test@example.com" },
        token: "mockToken",
      },
    });
  
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({
          data: {
            success: true,
            category: [
              { _id: "cat1", name: "Category 1" },
              { _id: "cat2", name: "Category 2" },
            ],
          },
        });
      }
  
      if (url.includes("/api/v1/product/product-list")) {
        return Promise.resolve({
          data: {
            success: true,
            products: [
              { _id: "1", name: "Product 1", price: 100, description: "Description 1", slug: "product-1" },
              { _id: "2", name: "Product 2", price: 200, description: "Description 2", slug: "product-2" },
            ],
          },
        });
      }
  
      return Promise.reject(new Error("Unknown API endpoint"));
    });
  
    const { getByPlaceholderText, getByText, findByText } = render(
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
            <MemoryRouter initialEntries={["/login"]}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<HomePage />} />
              </Routes>
            </MemoryRouter>
          </SearchProvider>
        </CartProvider>
      </AuthProvider>
    );
  
    // Fill in the form
    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" },
    });
  
    fireEvent.click(getByText("LOGIN"));
  
    // Wait for navigation to the homepage
    await waitFor(() => expect(getByText("All Products")).toBeInTheDocument());
  
    // Verify that the homepage components are rendered
    expect(await findByText("Product 1")).toBeInTheDocument();
    expect(await findByText("Product 2")).toBeInTheDocument();
  });
  
  it("shows error message for incorrect password and stays on login page", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        success: false,
        message: "Invalid password",
      },
    });
  
    const { getByPlaceholderText, getByText, findByText } = render(
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
            <MemoryRouter initialEntries={["/login"]}>
              <Routes>
                <Route path="/login" element={<Login />} />
              </Routes>
            </MemoryRouter>
          </SearchProvider>
        </CartProvider>
      </AuthProvider>
    );
  
    // Fill in the form with a valid email but incorrect password
    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "wrongpassword" },
    });
  
    fireEvent.click(getByText("LOGIN"));
  
    // Wait for the toast error message
    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Invalid password");
      });
  
    // Ensure the user stays on the login page
    expect(getByText("LOGIN FORM")).toBeInTheDocument();
  });
  
  it("shows error message for network/server error and stays on login page", async () => {
    axios.post.mockRejectedValueOnce(new Error("Network Error"));
  
    const { getByPlaceholderText, getByText, findByText } = render(
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
            <MemoryRouter initialEntries={["/login"]}>
              <Routes>
                <Route path="/login" element={<Login />} />
              </Routes>
            </MemoryRouter>
          </SearchProvider>
        </CartProvider>
      </AuthProvider>
    );
  
    // Fill in the form
    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" },
    });
  
    fireEvent.click(getByText("LOGIN"));
  
    // Wait for the toast error message
  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");
  });
  
    // Ensure the user stays on the login page
    expect(getByText("LOGIN FORM")).toBeInTheDocument();
  });

  it("should log out the user and redirect to the login page", async () => {
    // Set up the environment to mimic a logged-in user
    localStorage.setItem(
        "auth",
        JSON.stringify({
        token: "mockToken",
        user: {
            _id: "12345",
            name: "Test User",
            email: "test@example.com",
        },
        })
    );
    
    // Mock a successful logout response
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Logout successful",
      },
    });
  
    const { getByText } = render(
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
            <MemoryRouter initialEntries={["/"]}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </MemoryRouter>
          </SearchProvider>
        </CartProvider>
      </AuthProvider>
    );
  
    // Click the logout button (assuming it exists on the homepage)
    fireEvent.click(getByText("Logout"));
  
    // Wait for navigation to the login page
    await waitFor(() => expect(getByText("LOGIN FORM")).toBeInTheDocument());
  });

});
