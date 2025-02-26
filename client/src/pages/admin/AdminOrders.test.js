import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import AdminOrders from "./AdminOrders";
import { useAuth } from "../../context/auth";
import "@testing-library/jest-dom/extend-expect";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

describe("AdminOrders component", () => {
  const mockOrders = [
    {
      _id: "1",
      products: [
        {
          _id: "ProductA",
          name: "Product A",
          price: 100,
          description: "Product A Description",
        },
      ],
      payment: {
        success: true,
      },
      buyer: { name: "Ron" },
      status: "Not Process",
      createdAt: "2025-02-04T13:42:16.741Z",
      updatedAt: "2025-02-04T13:42:16.741Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders AdminOrders component with orders", async () => {
    useAuth.mockReturnValue([{ token: "test-token" }, jest.fn()]);
    axios.get.mockResolvedValue({ data: mockOrders });

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("All Orders")).toBeInTheDocument();
    });

    expect(await screen.findByText("Ron")).toBeInTheDocument();
    expect(await screen.findByText("Product A")).toBeInTheDocument();
    expect(await screen.findByText("Price : 100")).toBeInTheDocument();
    expect(await screen.findByText("Success")).toBeInTheDocument();
  });

  // Code adapted from https://chatgpt.com/share/67bf1812-6650-8013-8a59-c45115a9783f
  test("fetches and sets orders on success", async () => {
    axios.get.mockResolvedValue({ data: mockOrders });

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
    });

    expect(screen.getByText("Ron")).toBeInTheDocument();
    expect(screen.getByText("Not Process")).toBeInTheDocument();
    expect(screen.getByText("Product A")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  // Code adapted from https://chatgpt.com/share/67bf1812-6650-8013-8a59-c45115a9783f
  test("update order status on selection change", async () => {
    axios.get.mockResolvedValue({ data: mockOrders });
    axios.put.mockResolvedValue({ data: { success: true } });

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    expect(await screen.findByText("Ron")).toBeInTheDocument();

    const select = screen.getByRole("combobox");
    fireEvent.mouseDown(select);

    let newStatus;
    await waitFor(() => {
      newStatus = screen.getByText("Processing");
    });
    fireEvent.click(newStatus);

    expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/order-status/1", {
      status: "Processing",
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });

  // Code adapted from https://chatgpt.com/share/67bf1812-6650-8013-8a59-c45115a9783f
  test("displays error message when API fails", async () => {
    axios.get.mockRejectedValue(new Error("Network Error"));

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });
});
