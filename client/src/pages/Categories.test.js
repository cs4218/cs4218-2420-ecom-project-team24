import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { BrowserRouter } from "react-router-dom";
import Categories from "./Categories";

// Mock the Layout component
jest.mock("./../components/Layout", () => {
    const PropTypes = require('prop-types');
    const MockLayout = ({ children, title }) => {
        return <div data-testid="mock-layout" data-title={title}>{children}</div>;
    };
    
    MockLayout.propTypes = {
        children: PropTypes.node.isRequired,
        title: PropTypes.string.isRequired
    };
    
    return MockLayout;
});

// Mock the useCategory hook
jest.mock("../hooks/useCategory", () => {
    return jest.fn(() => [
        { _id: "1", name: "Electronics", slug: "electronics" },
        { _id: "2", name: "Clothing", slug: "clothing" },
        { _id: "3", name: "Books", slug: "books" }
    ]);
});

window.matchMedia =
    window.matchMedia ||
    function () {
        return {
        matches: false,
        addListener: function () {},
        removeListener: function () {},
    };
};

const renderWithRouter = (component) => {
    return render(component, { wrapper: BrowserRouter });
};

describe("Categories Component", () => {
    // TEST #1
    it("uses Layout component with correct title", () => {
        renderWithRouter(<Categories />);
        const layout = screen.getByTestId("mock-layout");
        expect(layout).toBeInTheDocument();
        expect(layout).toHaveAttribute("data-title", "All Categories");
    });

    // TEST #2
    it("renders container with correct Bootstrap classes", () => {
        renderWithRouter(<Categories />);
        
        // Using Testing Library's ByRole queries with test IDs
        const containerDiv = screen.getByRole("main", { name: /categories container/i });
        const rowDiv = screen.getByRole("list", { name: /categories list/i });
        
        expect(containerDiv).toBeInTheDocument();
        expect(containerDiv).toHaveClass("container");
        expect(rowDiv).toBeInTheDocument();
        expect(rowDiv).toHaveClass("row");
    });

    // TEST #3
    it("renders all category links with correct data", () => {
        renderWithRouter(<Categories />);
        const categoryLinks = screen.getAllByRole("link");
        
        expect(categoryLinks).toHaveLength(3);
        expect(categoryLinks[0]).toHaveTextContent("Electronics");
        expect(categoryLinks[1]).toHaveTextContent("Clothing");
        expect(categoryLinks[2]).toHaveTextContent("Books");
    });

    // TEST #4
    it("renders category links with correct URLs", () => {
        renderWithRouter(<Categories />);
        const categoryLinks = screen.getAllByRole("link");
        
        expect(categoryLinks[0]).toHaveAttribute("href", "/category/electronics");
        expect(categoryLinks[1]).toHaveAttribute("href", "/category/clothing");
        expect(categoryLinks[2]).toHaveAttribute("href", "/category/books");
    });

    // TEST #5
    it("applies correct Bootstrap classes to category columns", () => {
        renderWithRouter(<Categories />);
        
        // Using Testing Library's ByRole queries for list items
        const columns = screen.getAllByRole("listitem", { name: /category item/i });
        
        expect(columns).toHaveLength(3);
        columns.forEach(column => {
            expect(column).toHaveClass("col-md-6", "mt-5", "mb-3", "gx-3", "gy-3");
        });
    });

    // TEST #6
    it("applies correct styling to category links", () => {
        renderWithRouter(<Categories />);
        const links = screen.getAllByRole("link");
        
        links.forEach(link => {
            expect(link).toHaveClass("btn", "btn-primary");
        });
    });
});
