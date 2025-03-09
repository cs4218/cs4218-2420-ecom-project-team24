import React from 'react';
import { render, fireEvent, waitFor, screen, getByTestId, act } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import PrivateRoute from "./Private";
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

jest.mock("../Spinner", () => () => <div data-testid="mock-spinner">Spinner Content</div>);

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Outlet: () => <div data-testid="mock-outlet">Protected Content</div>,
}));

describe("PrivateRoute Component", () => {

    beforeEach(() => {
        jest.clearAllMocks(); // Reset all mocks before each test
      });

      const renderDashboard = () => {
        return render(
          <MemoryRouter>
            <PrivateRoute />
          </MemoryRouter>
        );
      };

      it("renders the Spinner when authentication check is in progress", async () => {
        useAuth.mockReturnValue([{ token: "token" }, jest.fn()]);
        axios.get.mockImplementation(() => new Promise(() => {})); 
    
        renderDashboard();
    
        expect(screen.getByTestId("mock-spinner")).toBeInTheDocument(); 
        expect(screen.queryByTestId("mock-outlet")).not.toBeInTheDocument(); 
      });

      it("renders Outlet when authentication is successful", async () => {
        useAuth.mockReturnValue([{ token: "valid-token" }, jest.fn()]);
        axios.get.mockResolvedValue({ data: { ok: true } });
    
        renderDashboard();
    
        await waitFor(() => expect(screen.getByTestId("mock-outlet")).toBeInTheDocument()); 
        expect(screen.queryByTestId("mock-spinner")).not.toBeInTheDocument(); 
      });

      it("renders Spinner when authentication fails", async () => {
        useAuth.mockReturnValue([{ token: "invalid-token" }, jest.fn()]);
        axios.get.mockResolvedValue({ data: { ok: false } });
    
        renderDashboard();
    
        await waitFor(() => expect(screen.getByTestId("mock-spinner")).toBeInTheDocument()); 
        expect(screen.queryByTestId("mock-outlet")).not.toBeInTheDocument(); 
      });

      it('should handle API error correctly', async () => {
        useAuth.mockReturnValue([{ token: 'test-token' }, jest.fn()]);
        axios.get.mockRejectedValue(new Error('API error'));
  
    
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  
        renderDashboard();

        await waitFor(() => {
          expect(screen.getByTestId("mock-spinner")).toBeInTheDocument();
        });
        expect(screen.queryByTestId("mock-outlet")).not.toBeInTheDocument();
  
        expect(consoleErrorMock).toHaveBeenCalledWith("Authentication check failed:", expect.any(Error));
        consoleErrorMock.mockRestore();
      });

      it('should not call authCheck when auth.token is null', async () => {
        useAuth.mockReturnValue([{}, jest.fn()]); // auth.token is null
      
        renderDashboard();
      
        await waitFor(() => {
          expect(screen.getByTestId("mock-spinner")).toBeInTheDocument();
        });
        expect(screen.queryByTestId("mock-outlet")).not.toBeInTheDocument();
      
        expect(axios.get).not.toHaveBeenCalled();
      });

      



      




});