import React from 'react';
import { render, fireEvent, waitFor, screen, getByTestId } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import Dashboard from "./Dashboard";
import { useAuth } from "../../context/auth";

jest.mock('axios');
jest.mock('react-hot-toast');

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
  }));

  jest.mock('../../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
  }));
    
jest.mock('../../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
  }));

jest.mock("../../hooks/useCategory", () => jest.fn(() => [])); // can remove

jest.mock("../../components/Layout", () => jest.fn(({ children }) => <div data-testid="layout">{children}</div>));
jest.mock("../../components/UserMenu", () => jest.fn(() => <div data-testid="user-menu">User Menu</div>));

describe("Dashboard Component", () => {

    const renderDashboard = (auth) => {
        useAuth.mockReturnValue([auth]);
        return render(
          <MemoryRouter>
            <Dashboard />
          </MemoryRouter>
        );
      };

    beforeEach(() => {
        jest.clearAllMocks();
      });

    it("should render the Dashboard component without errors", () => {
        const mockUser = {
            name: "John Doe",
            email: "john@example.com",
            address: "123 Main St",
          };
        renderDashboard({ token: "token", user: mockUser });
        expect(screen.getByTestId("layout")).toBeInTheDocument();
        expect(screen.getByTestId("user-menu")).toBeInTheDocument();
    });

    it("it should render the user information properly", () => {
        const mockUser = {
            name: "John Doe",
            email: "john@example.com",
            address: "NUS Street",
          };
        renderDashboard({ token: "token", user: mockUser }); 
        
        expect(screen.getByTestId("name")).toHaveTextContent("John Doe");
        expect(screen.getByTestId("email")).toHaveTextContent("john@example.com");
        expect(screen.getByTestId("address")).toHaveTextContent("NUS Street");

    });

    it("should handle absence of user data by rendering empty fields when auth is null", () => {
        renderDashboard(null); 
        
        expect(screen.getByTestId("name")).toHaveTextContent("");
        expect(screen.getByTestId("email")).toHaveTextContent("");
        expect(screen.getByTestId("address")).toHaveTextContent("");

    });

    it("should handle the absence of individual fields", () => {
        const mockUser = {
            name: "John Doe",
            email: null,
            address: "NUS Street",
          };
        renderDashboard({token: "token", user: mockUser}); 
        
        expect(screen.getByTestId("name")).toHaveTextContent("John Doe");
        expect(screen.getByTestId("email")).toHaveTextContent("");
        expect(screen.getByTestId("address")).toHaveTextContent("NUS Street");

    });

    test("applies correct CSS classes to layout and content containers", () => {
        const mockUser = {
            name: "John Doe",
            email: "john@example.com",
            address: "NUS Street",
          };
        renderDashboard({ token: "token", user: mockUser });

        const { container } = renderDashboard({ token: "token", user: mockUser });
      
        expect(container.querySelector(".container-fluid")).toBeInTheDocument();
        expect(container.querySelector(".dashboard")).toBeInTheDocument();
        expect(container.querySelector(".row")).toBeInTheDocument();
        expect(container.querySelector(".col-md-3")).toBeInTheDocument();
        expect(container.querySelector(".col-md-9")).toBeInTheDocument();
        expect(container.querySelector(".card.w-75.p-3")).toBeInTheDocument();
      });

      
});