import React from "react";
import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { useSearch, SearchProvider } from "./search"; // Adjust import path

// Mock Component to test context
const TestComponent = () => {
  const [search, setSearch] = useSearch();

  const handleUpdateSearch = () => {
    setSearch({ keyword: "test", results: ["result1"] });
  };

  return (
    <div>
      <p data-testid="keyword">{search.keyword}</p>
      <p data-testid="results">{search.results.length}</p>
      <button data-testid="update-search" onClick={handleUpdateSearch}>
        Update Search
      </button>
    </div>
  );
};

const renderTestComponent = () => {
  return render(
    <SearchProvider>
      <TestComponent />
    </SearchProvider>
  );
}

describe("SearchContext", () => {
  it("should render the provider and provide default values", () => {
    renderTestComponent();

    expect(screen.getByTestId("keyword").textContent).toBe(""); 
    expect(screen.getByTestId("results").textContent).toBe("0"); 
  });

  it("should update the search keyword", () => {
    renderTestComponent();

 
    act(() => {
      screen.getByTestId("update-search").click();
    });

    expect(screen.getByTestId("keyword").textContent).toBe("test"); 
  });

  it("should update the search results", () => {
    renderTestComponent();

    // Click button to update context
    act(() => {
      screen.getByTestId("update-search").click();
    });

    expect(screen.getByTestId("results").textContent).toBe("1"); // Results should have one item
  });
});