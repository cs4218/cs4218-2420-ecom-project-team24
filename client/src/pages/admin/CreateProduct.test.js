import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  screen,
  within,
} from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import CreateProduct from "./CreateProduct";

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

describe("CreateProduct Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => "mocked-image-url");
  });

  test("should render the component correctly", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [{ _id: "1", name: "Electronics" }] },
    });

    render(
      <MemoryRouter>
        <CreateProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Create Product")).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText("write a name")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("write a description")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("write a Price")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("write a quantity")).toBeInTheDocument();
  });

  test("should display error message if fail to fetch categories", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <MemoryRouter>
        <CreateProduct />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Something wwent wrong in getting catgeory"
      )
    );
  });

  test("should handle successful product creation", async () => {
    axios.post.mockResolvedValueOnce({
      data: { success: true, message: "Product Created Successfully" },
    });

    const mockNav = jest.fn();

    render(
      <MemoryRouter>
        <CreateProduct />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("write a name"), {
      target: { value: "Laptop" },
    });
    fireEvent.change(screen.getByPlaceholderText("write a description"), {
      target: { value: "Gaming Laptop" },
    });
    fireEvent.change(screen.getByPlaceholderText("write a Price"), {
      target: { value: "1500" },
    });
    fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
      target: { value: "10" },
    });

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText("Upload Photo"), {
      target: { files: [file] },
    });

    const button = screen.getByText("CREATE PRODUCT");
    fireEvent.click(button);

    // Ensure axios.post is called
    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/product/create-product",
        expect.any(FormData)
      )
    );

    // Ensure success toast is shown
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Product Created Successfully")
    );

    // Ensure navigation occurs
    await waitFor(() =>
      expect(mockNav).toHaveBeenCalledWith("/dashboard/admin/products")
    );
  });

  // Code adapted from https://chatgpt.com/share/67bf2e53-6d8c-8013-8d32-0c59b0750c7a
  test("should allow selecting a category and shipping option", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [{ _id: "1", name: "Electronics" }] },
    });

    render(
      <MemoryRouter>
        <CreateProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Electronics")).toBeInTheDocument();
    });

    fireEvent.mouseDown(screen.getByPlaceholderText("Select a category"));

    const categoryOption = await screen.findByText("Electronics");
    fireEvent.click(categoryOption);

    await waitFor(() =>
      expect(
        within(screen.getByRole("combobox")).getByText("Electronics")
      ).toBeInTheDocument()
    );

    fireEvent.mouseDown(screen.getByPlaceholderText("Select Shipping"));

    const shippingOption = await screen.findByText("Yes");
    fireEvent.click(shippingOption);

    await waitFor(() =>
      expect(
        within(screen.getByRole("combobox")).getByText("Yes")
      ).toBeInTheDocument()
    );
  });

  test("should display error toast if API response returns true", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [{ _id: "1", name: "Electronics" }] },
    });

    axios.post.mockResolvedValueOnce({
      data: { success: true, message: "Product already exists" },
    });

    render(
      <MemoryRouter>
        <CreateProduct />
      </MemoryRouter>
    );

    const button = screen.getByText("CREATE PRODUCT");
    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Product already exists");
    });
  });
});
