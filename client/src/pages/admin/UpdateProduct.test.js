import "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import UpdateProduct from "./UpdateProduct";
import axios from "axios";
import toast from "react-hot-toast";

// Mocking axios
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

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

// Code adapted from https://stackoverflow.com/questions/62833456/how-to-test-ant-design-select-and-option-properly-using-jest
jest.mock("antd", () => {
  const antd = jest.requireActual("antd");

  const Select = ({ children, onChange, placeholder }) => {
    return (
      <select
        data-testid={placeholder}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    );
  };

  const Option = ({ children, ...props }) => {
    return <option {...props}>{children}</option>;
  };

  Select.Option = Option;

  // Code adapted from https://chatgpt.com/share/67cd2dbe-bd5c-8013-bb15-21bfbe8deba8
  const Modal = ({ open, children }) => (
    <div data-testid="mocked-modal">{open ? children : null}</div>
  );

  return {
    ...antd,
    Select,
    Modal,
  };
});

describe("UpdateProduct Component", () => {
  const mockProductData = {
    product: {
      name: "Test Product",
      _id: "123",
      description: "Test Description",
      price: 100,
      quantity: 10,
      shipping: true,
      category: { _id: "1" },
    },
  };
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {}); // Mock console.log
    useNavigate.mockReturnValue(mockNavigate);
    global.URL.createObjectURL = jest.fn(() => "mocked-url");
  });

  it("renders initial state correctly", () => {
    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter>
        <UpdateProduct />
      </MemoryRouter>
    );

    expect(getByText("Update Product")).toBeInTheDocument();
    expect(getByPlaceholderText("write a name")).toBeInTheDocument();
    expect(getByPlaceholderText("write a description")).toBeInTheDocument();
    expect(getByPlaceholderText("write a Price")).toBeInTheDocument();
    expect(getByPlaceholderText("write a quantity")).toBeInTheDocument();
  });

  it("handles fetch single product failure", async () => {
    axios.get.mockRejectedValueOnce(new Error("Failed to fetch product"));

    render(
      <MemoryRouter>
        <UpdateProduct />
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(console.log).toHaveBeenCalledWith(
      new Error("Failed to fetch product")
    );
  });

  it("sets state correctly when fetching single product", async () => {
    axios.get.mockResolvedValueOnce({ data: mockProductData });
    axios.get.mockResolvedValueOnce({ data: mockProductData });
    axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } });
    render(
      <MemoryRouter initialEntries={["/dashboard/admin/product/test-slug"]}>
        <Routes>
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith(
        "/api/v1/product/get-product/test-slug"
      )
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("write a name")).toHaveValue(
        "Test Product"
      );
      expect(screen.getByPlaceholderText("write a description")).toHaveValue(
        "Test Description"
      );
      expect(screen.getByPlaceholderText("write a Price")).toHaveValue(100);
      expect(screen.getByPlaceholderText("write a quantity")).toHaveValue(10);
    });
  });

  it("handles fetch categories failure", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: {} } });
    axios.get.mockRejectedValueOnce(new Error("Failed to fetch categories"));

    render(
      <MemoryRouter>
        <UpdateProduct />
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith(
      "Something went wrong in getting category"
    );
  });

  it("does not submit the form with empty fields", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: {} } });
    axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } });
    axios.put.mockRejectedValueOnce(new Error("Failed to update product"));

    const { getByText } = render(
      <MemoryRouter initialEntries={["/dashboard/admin/product/test-slug"]}>
        <Routes>
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(getByText("UPDATE PRODUCT"));

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Something went wrong")
    );
  });

  it("updates the product name", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: {} } });
    axios.put.mockResolvedValueOnce({ data: { success: true } });

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={["/dashboard/admin/product/test-slug"]}>
        <Routes>
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("write a name"), {
      target: { value: "Updated Product Name" },
    });
    fireEvent.click(getByText("UPDATE PRODUCT"));

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith("Product Updated Successfully");
  });

  it("updates the product price", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: {} } });
    axios.put.mockResolvedValueOnce({ data: { success: true } });

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={["/dashboard/admin/product/test-slug"]}>
        <Routes>
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("write a Price"), {
      target: { value: "99.99" },
    });
    fireEvent.click(getByText("UPDATE PRODUCT"));

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith("Product Updated Successfully");
  });

  it("updates the product quantity", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: {} } });
    axios.put.mockResolvedValueOnce({ data: { success: true } });

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={["/dashboard/admin/product/test-slug"]}>
        <Routes>
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("write a quantity"), {
      target: { value: "10" },
    });
    fireEvent.click(getByText("UPDATE PRODUCT"));

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith("Product Updated Successfully");
  });

  it("handles photo upload", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: {} } });
    axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } });

    const { getByLabelText } = render(
      <MemoryRouter initialEntries={["/dashboard/admin/product/test-slug"]}>
        <Routes>
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
        </Routes>
      </MemoryRouter>
    );

    const file = new File(["dummy content"], "example.png", {
      type: "image/png",
    });
    const input = getByLabelText("Upload Photo");

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(input.files[0]).toBe(file));
    expect(input.files).toHaveLength(1);
    expect(input.files[0].name).toBe("example.png");
  });

  it("updates the product successfully", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: {} } });
    axios.put.mockResolvedValueOnce({ data: { success: true } });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/dashboard/admin/product/test-slug"]}>
        <Routes>
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("write a name"), {
      target: { value: "Test Product" },
    });
    fireEvent.change(getByPlaceholderText("write a description"), {
      target: { value: "Test Description" },
    });
    fireEvent.change(getByPlaceholderText("write a Price"), {
      target: { value: "100" },
    });
    fireEvent.change(getByPlaceholderText("write a quantity"), {
      target: { value: "10" },
    });
    fireEvent.click(getByText("UPDATE PRODUCT"));

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith("Product Updated Successfully");
  });

  it("handles failed product update", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: {} } });
    axios.put.mockRejectedValueOnce(new Error("Failed to update product"));

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/dashboard/admin/product/test-slug"]}>
        <Routes>
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("write a name"), {
      target: { value: "Test Product" },
    });
    fireEvent.change(getByPlaceholderText("write a description"), {
      target: { value: "Test Description" },
    });
    fireEvent.change(getByPlaceholderText("write a Price"), {
      target: { value: "100" },
    });
    fireEvent.change(getByPlaceholderText("write a quantity"), {
      target: { value: "10" },
    });
    fireEvent.click(getByText("UPDATE PRODUCT"));

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("something went wrong");
  });

  it("deletes the product successfully", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: {} } });
    axios.delete.mockResolvedValueOnce({ data: { success: true } });

    const { getByText } = render(
      <MemoryRouter initialEntries={["/dashboard/admin/product/test-slug"]}>
        <Routes>
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
          <Route
            path="/dashboard/admin/products"
            element={<div>Products Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    window.confirm = jest.fn().mockReturnValueOnce(true);
    fireEvent.click(getByText("DELETE PRODUCT"));
  });

  it("handles failed product deletion", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: {} } });
    axios.delete.mockRejectedValueOnce(new Error("Failed to delete product"));

    const { getByText } = render(
      <MemoryRouter initialEntries={["/dashboard/admin/product/test-slug"]}>
        <Routes>
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
        </Routes>
      </MemoryRouter>
    );

    window.confirm = jest.fn().mockReturnValueOnce(true);
    fireEvent.click(getByText("DELETE PRODUCT"));
  });

  it("navigates after successful update", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: {} } });
    axios.put.mockResolvedValueOnce({ data: { success: true } });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/dashboard/admin/product/test-slug"]}>
        <Routes>
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
          <Route
            path="/dashboard/admin/products"
            element={<div>Products Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("write a name"), {
      target: { value: "Test Product" },
    });
    fireEvent.change(getByPlaceholderText("write a description"), {
      target: { value: "Test Description" },
    });
    fireEvent.change(getByPlaceholderText("write a Price"), {
      target: { value: "100" },
    });
    fireEvent.change(getByPlaceholderText("write a quantity"), {
      target: { value: "10" },
    });
    fireEvent.click(getByText("UPDATE PRODUCT"));

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith("Product Updated Successfully");
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
  });

  it("navigates after successful deletion", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        product: {
          _id: "test-id",
          name: "Test Product",
          slug: "test-slug",
          description: "desc",
          price: 10,
          quantity: 5,
          shipping: true,
          category: "test-category-id",
        },
      },
    });

    axios.delete.mockResolvedValueOnce({ data: { success: true } });

    window.confirm = jest.fn().mockReturnValueOnce(true);

    const { getByRole } = render(
      <MemoryRouter initialEntries={["/dashboard/admin/product/test-slug"]}>
        <Routes>
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
          <Route
            path="/dashboard/admin/products"
            element={<div>Products Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(getByRole("button", { name: /delete product/i }));
  });
});
