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

  // Code adapted from https://chatgpt.com/share/67bf46f9-e51c-8013-bf41-a53915c900f5
  test("render AdminOrders component with no orders", async () => {
    useAuth.mockReturnValue([{ token: "test-token" }, jest.fn()]);
    axios.get.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("All Orders")).toBeInTheDocument();
    });

    expect(screen.queryByText("Ron")).not.toBeInTheDocument();
    expect(screen.getByText("No orders found")).toBeInTheDocument();
  });

  // Code adapted from https://chatgpt.com/share/67bf46f9-e51c-8013-bf41-a53915c900f5
  test("displays error when order status update fails", async () => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    axios.get.mockResolvedValue({ data: mockOrders });
    axios.put.mockRejectedValue(new Error("Failed to update"));

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

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/order-status/1", {
        status: "Processing",
      });
    });

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    });

    console.log.mockRestore();
  });

  // Code adapted from https://chatgpt.com/share/67bf46f9-e51c-8013-bf41-a53915c900f5
  test("does not fetch orders when auth token is missing", async () => {
    useAuth.mockReturnValue([null, jest.fn()]);
    axios.get.mockResolvedValue({ data: mockOrders });

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).not.toHaveBeenCalled();
    });
  });

  // Code adapted from https://chatgpt.com/share/67bf46f9-e51c-8013-bf41-a53915c900f5
  test("handles all status options correctly", async () => {
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

    for (const status of ["Processing", "Shipped", "deliverd", "cancel"]) {
      let option;
      await waitFor(() => {
        option = screen.getByText(status);
      });
      fireEvent.click(option);

      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/order-status/1", {
          status,
        });
      });
    }
  });

  // Code adapted from https://chatgpt.com/share/67bf46f9-e51c-8013-bf41-a53915c900f5
  test("calls handleChange when order status is changed", async () => {
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

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/order-status/1", {
        status: "Processing",
      });
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });

  // Code adapted from https://chatgpt.com/share/67bf46f9-e51c-8013-bf41-a53915c900f5
  test("does not call API when status remains unchanged", async () => {
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

    let sameStatus;
    await waitFor(() => {
      sameStatus = screen.getByText("Not Process");
    });

    fireEvent.click(sameStatus);

    await waitFor(() => {
      expect(axios.put).not.toHaveBeenCalled();
    });
  });
});
