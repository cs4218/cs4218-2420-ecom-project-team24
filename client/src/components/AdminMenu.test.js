import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { BrowserRouter } from "react-router-dom";
import AdminMenu from "./AdminMenu";

// Helper function to render component with Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe("AdminMenu Component", () => {
  beforeEach(() => {
    // Clear any mocks if added in future
    jest.clearAllMocks();
  });

  // TEST #1: Basic rendering
  it("renders the admin menu with title", () => {
    renderWithRouter(<AdminMenu />);
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  // TEST #2: Navigation links presence
  it("renders all navigation links with correct paths", () => {
    renderWithRouter(<AdminMenu />);
    
    const links = [
      { text: "Create Category", path: "/dashboard/admin/create-category" },
      { text: "Create Product", path: "/dashboard/admin/create-product" },
      { text: "Products", path: "/dashboard/admin/products" },
      { text: "Orders", path: "/dashboard/admin/orders" }
    ];

    links.forEach(link => {
      const navLink = screen.getByText(link.text);
      expect(navLink).toBeInTheDocument();
      expect(navLink.getAttribute("href")).toBe(link.path);
    });
  });

  // TEST #3: CSS classes
  it("has correct CSS classes for styling", () => {
    renderWithRouter(<AdminMenu />);
    
    const menuList = screen.getByRole("list", { name: /admin panel/i });
    expect(menuList).toHaveClass("dashboard-menu", "list-group");
    
    const navLinks = screen.getAllByRole("link");
    navLinks.forEach(link => {
      expect(link).toHaveClass("list-group-item", "list-group-item-action");
    });
  });

  // TEST #4: Accessibility
  it("has accessible navigation elements", () => {
    renderWithRouter(<AdminMenu />);
    
    const navLinks = screen.getAllByRole("link");
    expect(navLinks).toHaveLength(4); // Checking exact number of navigation links
    
    navLinks.forEach(link => {
      expect(link).toBeVisible();
      expect(link).toHaveAttribute("href");
    });
  });

  // TEST #5: Component structure
  it("renders with correct nested structure", () => {
    renderWithRouter(<AdminMenu />);
    
    // Check navigation container
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("text-center");
    expect(nav).toHaveAttribute("data-testid", "admin-menu-container");

    // Check heading
    const title = screen.getByRole("heading", { name: /admin panel/i, level: 4 });
    expect(title).toBeInTheDocument();
    
    // Check list and list items
    const menuList = screen.getByRole("list", { name: /admin panel/i });
    expect(menuList).toHaveClass("dashboard-menu", "list-group");
    
    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(4);
    
    const navLinks = screen.getAllByRole("link");
    navLinks.forEach(link => {
      expect(link).toHaveAttribute("href");
    });
  });
});
