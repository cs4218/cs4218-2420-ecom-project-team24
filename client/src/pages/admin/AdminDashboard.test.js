import React from "react";
import { useAuth } from "../../context/auth";
import { cleanup, render, screen } from "@testing-library/react";
import AdminDashboard from "./AdminDashboard";

// Code adapted from https://chatgpt.com/share/67bd91a1-65c8-8013-ab56-a4318718716c

// mock to erase functionality of a module
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../components/AdminMenu", () => () => (
  <nav data-testid="admin-menu">Admin Menu</nav>
));
jest.mock("../../components/Layout", () => ({ children }) => (
  <div data-testid="layout">{children}</div>
));

describe("AdminDashboard Component", () => {
  const mockAuthUser = {
    user: {
      name: "John Tan",
      email: "john@email.com",
      phone: "98982211",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("render Admin Dashboard with user information correctly", () => {
    useAuth.mockReturnValue([mockAuthUser]);
    render(<AdminDashboard />);
    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(screen.getByTestId("admin-menu")).toBeInTheDocument();
    expect(screen.getByText("Admin Name : John Tan")).toBeInTheDocument();
    expect(
      screen.getByText("Admin Email : john@email.com")
    ).toBeInTheDocument();
    expect(screen.getByText("Admin Contact : 98982211")).toBeInTheDocument();
  });

  test("handles missing user data gracefully", () => {
    useAuth.mockReturnValue([{}]);
    render(<AdminDashboard />);
    expect(screen.getByText("Admin Name :")).toBeInTheDocument();
    expect(screen.getByText("Admin Email :")).toBeInTheDocument();
    expect(screen.getByText("Admin Contact :")).toBeInTheDocument();
  });

  test("handles completely missing auth state", () => {
    useAuth.mockReturnValue([null]);
    render(<AdminDashboard />);
    expect(screen.getByText("Admin Name :")).toBeInTheDocument();
    expect(screen.getByText("Admin Email :")).toBeInTheDocument();
    expect(screen.getByText("Admin Contact :")).toBeInTheDocument();
  });

  test("handles empty array return from useAuth", () => {
    useAuth.mockReturnValue([]);
    render(<AdminDashboard />);
    expect(screen.getByText("Admin Name :")).toBeInTheDocument();
    expect(screen.getByText("Admin Email :")).toBeInTheDocument();
    expect(screen.getByText("Admin Contact :")).toBeInTheDocument();
  });

  test("calls useAuth exactly once", () => {
    useAuth.mockReturnValue([mockAuthUser]);
    render(<AdminDashboard />);
    expect(useAuth).toHaveBeenCalledTimes(1);
  });
});
