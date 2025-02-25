import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminMenu from "./AdminMenu";

// Code from https://chatgpt.com/share/67bd91a1-65c8-8013-ab56-a4318718716c

describe("AdminMenu Component", () => {
  test("renders the Admin Panel heading", () => {
    render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );

    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  test("renders all navigation links in admin panel", () => {
    render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );

    expect(screen.getByText("Create Category")).toBeInTheDocument();
    expect(screen.getByText("Create Product")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
  });

  test("ensure that navigation links have correct paths", () => {
    render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );

    expect(screen.getByText("Create Category")).toHaveAttribute(
      "href",
      "/dashboard/admin/create-category"
    );
    expect(screen.getByText("Create Product")).toHaveAttribute(
      "href",
      "/dashboard/admin/create-product"
    );
    expect(screen.getByText("Products")).toHaveAttribute(
      "href",
      "/dashboard/admin/products"
    );
    expect(screen.getByText("Orders")).toHaveAttribute(
      "href",
      "/dashboard/admin/orders"
    );
  });
});
