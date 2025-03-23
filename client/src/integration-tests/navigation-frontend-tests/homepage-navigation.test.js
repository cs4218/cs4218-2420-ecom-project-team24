import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import HomePage from "../../pages/HomePage";
import About from "../../pages/About";
import Contact from "../../pages/Contact";
import Policy from "../../pages/Policy";
import CartPage from "../../pages/CartPage";
import Categories from "../../pages/Categories";
import axios from "axios";
import { AuthProvider } from "../../context/auth";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";
import "@testing-library/jest-dom";

// Mock axios
jest.mock('axios');

// Mock API Responses
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

  return Promise.reject(new Error(`Unexpected API call: ${url}`));
});

describe("Homepage Navigation Tests", () => {
  const renderWithProviders = (initialRoute = "/") => {
    return render(
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
            <MemoryRouter initialEntries={[initialRoute]}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/policy" element={<Policy />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/categories" element={<Categories />} />
              </Routes>
            </MemoryRouter>
          </SearchProvider>
        </CartProvider>
      </AuthProvider>
    );
  };

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks to prevent conflicts
  });

  it("navigates to About page when About button is clicked", async () => {
    renderWithProviders();
    fireEvent.click(screen.getByText("About"));

    await waitFor(() =>
      expect(screen.getByAltText("contactus")).toBeInTheDocument()
    );
  });

  it("navigates to Contact page when Contact Us button is clicked", async () => {
    renderWithProviders();
    fireEvent.click(screen.getByText("Contact"));

    await waitFor(() =>
      expect(screen.getByText("CONTACT US")).toBeInTheDocument()
    );
  });

  it("navigates to Privacy Policy page when Privacy Policy button is clicked", async () => {
    renderWithProviders();
    fireEvent.click(screen.getByText("Privacy Policy"));

    await waitFor(() => {
      const elements = screen.getAllByText("add privacy policy");
      expect(elements.length).toBeGreaterThan(0); 
    });
  });

  it("navigates to Cart page when Cart button is clicked", async () => {
    renderWithProviders();
    fireEvent.click(screen.getByText("Cart"));

    await waitFor(() =>
      expect(screen.getByText("Cart Summary")).toBeInTheDocument()
    );
  });

  it("navigates to Categories page when Categories button is clicked", async () => {
    renderWithProviders(); 
    fireEvent.click(screen.getByText("Categories")); 
  
    await waitFor(() =>
      expect(screen.getByText("All Categories")).toBeInTheDocument() 
    );
  });
});
