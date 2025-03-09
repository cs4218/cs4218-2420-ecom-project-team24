import React from 'react';
import { render, fireEvent, waitFor, screen, getByTestId, act } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import Orders from "./Orders";
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

jest.mock("../../components/UserMenu", () => jest.fn(() => <div data-testid="user-menu">User Menu</div>));

describe("Orders Component", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        
        // function to render Orders component by mocking useAuth hook
        const renderOrders = (authValue) => {
        useAuth.mockReturnValue([authValue]);
        return render(
            <MemoryRouter>
            <Orders />
            </MemoryRouter>
        );
        };
        
        const mockUser = { name: "John Doe" };

        const product1 = {
        _id: "product1",
        name: "Product A",
        description: "Product A description",
        price: 100,
        }

        const product2 = {
        _id: "product2",
        name: "Product B",
        description: "Product B description",
        price: 200,
        }

        const mockOrders1 = [
        {
            _id: "order1",
            status: "Completed",
            buyer: { name: "Alice" },
            createdAt: "2025-02-06T12:06:42.133Z",
            payment: { success: true },
            products: [product1],
        },
        ];

        const mockOrdersMultiple = [
        {
            _id: "order2",
            status: "Shipped",
            buyer: { name: "Bob" },
            createdAt: "2025-02-06T12:06:42.133Z",
            payment: { success: true },
            products: [product1, product2],
        },
        {
            _id: "order3",
            status: "Not Shipped",
            buyer: { name: "Bob" },
            createdAt: "2025-02-07T12:06:42.133Z",
            payment: { success: false },
            products: [product2],
        }
        ];

        it("renders the Orders component correctly", () => {
        useAuth.mockReturnValue([{ token: "token", user: mockUser }]);

        renderOrders({ token: "token", user: mockUser });

        expect(screen.getByTestId("layout")).toBeInTheDocument();
        expect(screen.getByTestId("user-menu")).toBeInTheDocument();
        expect(screen.getByText("All Orders")).toBeInTheDocument();
        });


        it("should call the API to fetch orders on mount", async () => {
        axios.get.mockResolvedValueOnce({ data: mockOrders1 });

        renderOrders({ token: "token", user: mockUser });
        
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders");
        });
        });


        it("fetches and displays orders when auth token is available", async () => {
        axios.get.mockResolvedValueOnce({ data: mockOrders1 });

        renderOrders({ token: "token", user: mockUser });

        await waitFor(() => {
            expect(screen.getByTestId("order-status-0")).toHaveTextContent(/^Completed$/);
            expect(screen.getByTestId("order-buyer-0")).toHaveTextContent(/^Alice$/); 
            expect(screen.getByTestId("order-index-0")).toHaveTextContent("1");
            expect(screen.getByTestId("order-payment-0")).toHaveTextContent(/^Success$/);
            expect(screen.getByTestId("order-quantity-0")).toHaveTextContent("1");
        });
    
    });


    it("renders correctly when there are no orders", async () => {
        axios.get.mockResolvedValueOnce({ data: [] });
    
        renderOrders({ token: "token", user: mockUser });
    
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });
    
        expect(screen.getByText("All Orders")).toBeInTheDocument();
    });
    

    it("fetches and displays multiple orders properly", async () => {
        axios.get.mockResolvedValueOnce({ data: mockOrdersMultiple });

        renderOrders({ token: "token", user: mockUser });

        await waitFor(() => {
            expect(screen.getByTestId("order-status-1")).toHaveTextContent(/^Not Shipped$/);
            expect(screen.getByTestId("order-product-name-product1-0")).toHaveTextContent(/^Product A$/);
            expect(screen.getByTestId("order-product-name-product2-1")).toHaveTextContent(/^Product B$/);
            expect(screen.getByTestId("order-buyer-0")).toHaveTextContent(/^Bob$/);
        });
    
    });

    it("handles missing order details gracefully", async () => {
        const incompleteOrders = [
          {
            _id: "order1",
            status: null,
            buyer: null,
            createdAt: "2025-02-07T12:06:42.133Z",
            payment: { success: false },
            products: [product1],
          },
        ];
        axios.get.mockResolvedValueOnce({ data: incompleteOrders });
    
        renderOrders({ token: "token", user: mockUser });
    
        await waitFor(() => {
          expect(axios.get).toHaveBeenCalled();
        });
        
        await waitFor(() => {
           expect(screen.getByTestId("order-status-0")).toHaveTextContent("");
           expect(screen.getByTestId("order-buyer-0")).toHaveTextContent(""); 
           expect(screen.getByTestId("order-payment-0")).toHaveTextContent(/^Failed$/);
           expect(screen.getByTestId("order-quantity-0")).toHaveTextContent("1");
        });

      });

    it("does not fetch orders when auth token is missing", async () => {
        renderOrders({ token: null, user: mockUser });
    
        await waitFor(() => {
            expect(axios.get).not.toHaveBeenCalled();
          });
      });



     


});

