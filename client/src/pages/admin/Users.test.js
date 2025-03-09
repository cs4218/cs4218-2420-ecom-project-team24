import React from 'react';
import { render, fireEvent, waitFor, screen, getByTestId, act } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import Users from "./Users";
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

jest.mock("../../hooks/useCategory", () => jest.fn(() => [])); 

jest.mock("../../components/Layout", () => jest.fn(({ children }) => <div data-testid="layout">{children}</div>));

jest.mock("../../components/AdminMenu", () => () => <div data-testid="admin-menu" />);

describe("Users Component", () => {

    const mockUsers = [
        { _id: "1", name: "Alice", email: "alice@example.com", phone: "1234567890", address: "123 St", role: 1 },
        { _id: "2", name: "Bob", email: "bob@example.com", phone: "0987654321", address: "456 Ave", role: 0 },
      ];

    it("fetches and displays all the information", async () => {
        
        axios.get.mockResolvedValueOnce({ data: mockUsers });
    
        render(
            <MemoryRouter>
            <Users />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Alice")).toBeInTheDocument();
            expect(screen.getByText("Bob")).toBeInTheDocument();
            expect(screen.getByText("alice@example.com")).toBeInTheDocument();
            expect(screen.getByText("1234567890")).toBeInTheDocument();
            expect(screen.getByText("456 Ave")).toBeInTheDocument();
        });

      });

      it("displays all users' information in the corresponding cells", async () => {
        axios.get.mockResolvedValueOnce({ data: mockUsers });

        render(
            <MemoryRouter>
            <Users />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId("user-name-0")).toHaveTextContent("Alice");
            expect(screen.getByTestId("user-email-0")).toHaveTextContent("alice@example.com");
            expect(screen.getByTestId("user-phone-0")).toHaveTextContent("1234567890");
            expect(screen.getByTestId("user-address-0")).toHaveTextContent("123 St");
            expect(screen.getByTestId("user-role-0")).toHaveTextContent("Admin");

            expect(screen.getByTestId("user-name-1")).toHaveTextContent("Bob");
            expect(screen.getByTestId("user-email-1")).toHaveTextContent("bob@example.com");
            expect(screen.getByTestId("user-phone-1")).toHaveTextContent("0987654321");
            expect(screen.getByTestId("user-address-1")).toHaveTextContent("456 Ave");
            expect(screen.getByTestId("user-role-1")).toHaveTextContent("User");
        });
      });

      it("handles error when fetching users and renders page with blank table", async () => {
        // Arrange: Mock the API call to throw an error
        axios.get.mockRejectedValueOnce(new Error("Error fetching users"));
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        render(
            <MemoryRouter>
            <Users />
            </MemoryRouter>
        );
    
        await waitFor(() => {
        expect(screen.getByText("All Users")).toBeInTheDocument();
        expect(screen.getByRole("table")).toBeInTheDocument();
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching users:", expect.any(Error));
        }
        );

        consoleErrorSpy.mockRestore();
      });

      it("renders Layout and AdminMenu components", () => {
        render(
            <MemoryRouter>
            <Users />
            </MemoryRouter>
        );
    
        expect(screen.getByTestId("layout")).toBeInTheDocument();
        expect(screen.getByTestId("admin-menu")).toBeInTheDocument();
      });

      it("displays the correct role for each user", async () => {
        axios.get.mockResolvedValueOnce({ data: mockUsers });

        render(
            <MemoryRouter>
            <Users />
            </MemoryRouter>
        );
    
        await waitFor(() => {
        expect(screen.getByTestId("user-role-0")).toHaveTextContent("Admin");
        expect(screen.getByTestId("user-role-1")).toHaveTextContent("User");
        }
        );
      });

      it("displays the correct role for each user", async () => {
        axios.get.mockResolvedValueOnce({ data: mockUsers });

        const { container } = render(
            <MemoryRouter>
            <Users />
            </MemoryRouter>
        );

        expect(container.querySelector(".container-fluid")).toBeInTheDocument();
        expect(container.querySelector(".row")).toBeInTheDocument();
        expect(container.querySelector(".col-md-3")).toBeInTheDocument();
        expect(container.querySelector(".col-md-9")).toBeInTheDocument();
        expect(container.querySelector(".table.table-bordered")).toBeInTheDocument();

    });

});