import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import SearchInput from "./SearchInput";

// Mocking axios.get
jest.mock("axios");

const mockSetValues = jest.fn();

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "", results: [] }, mockSetValues]),
}));

describe("SearchInput Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TEST #1
  it("renders search input form", () => {
    const { getByPlaceholderText, getByRole } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<SearchInput />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByPlaceholderText("Search")).toBeInTheDocument();
    expect(getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  // TEST #2
  it("should allow typing in the search input", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<SearchInput />} />
        </Routes>
      </MemoryRouter>
    );

    const searchInput = getByPlaceholderText("Search");
    fireEvent.change(searchInput, { target: { value: "test keyword" } });
    expect(mockSetValues).toHaveBeenCalledWith({ keyword: "test keyword", results: [] });
  });

  // TEST #3
  it("should handle search submission successfully", async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ id: 1, name: "Product 1" }, { id: 2, name: "Product 2" }],
    });

    const { getByPlaceholderText, getByRole } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<SearchInput />} />
        </Routes>
      </MemoryRouter>
    );

    const searchInput = getByPlaceholderText("Search");
    fireEvent.change(searchInput, { target: { value: "test keyword" } });
    fireEvent.click(getByRole("button", { name: /search/i }));

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/");
  });

  // TEST #4
  it("should handle search submission failure", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network Error"));
    console.log = jest.fn(); // Mock console.log

    const { getByPlaceholderText, getByRole } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<SearchInput />} />
        </Routes>
      </MemoryRouter>
    );

    const searchInput = getByPlaceholderText("Search");
    fireEvent.change(searchInput, { target: { value: "test keyword" } });
    fireEvent.click(getByRole("button", { name: /search/i }));

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(console.log).toHaveBeenCalledWith(new Error("Network Error"));
  });
});