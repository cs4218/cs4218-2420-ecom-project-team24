import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import { useAuth, AuthProvider } from './auth';

// Mock axios
jest.mock('axios');

// Mock localStorage
const mockAuthData = {
  success: true,
  message: "login successfully",
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2EyMThkZWNmZGRmMWU1MzU4YWMiLCJpYXQiOjE3NDA4MjA0NjEsImV4cCI6MTc0MTQyNTI2MX0.2ttj_AZMsqyTkSjMiVWyJ7P2Pvyz_tzUGiD0cm6c36w",
  user: {
    _id: "67a218decf4efddf1e5358ac",
    name: "Test User",
    email: "testuser@example.com",
    address: "1 Computing Drive",
    answer: "password is testuser@example.com",
    createdAt: "2025-02-04T13:40:46.071Z",
    updatedAt: "2025-03-01T11:39:31.745Z",
    phone: "81234567",
    role: 0,
    __v: 0,
  },
};

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn((key) => {
      if (key === 'auth') {
        return null;
      }
      return JSON.stringify(mockAuthData);
    }),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

const renderWithAuthProvider = (Component) => {
    return render(
      <AuthProvider>
        {Component}
      </AuthProvider>
    );
  };

describe('AuthProvider and useAuth', () => {
  beforeEach(() => {
    localStorage.getItem.mockClear();
    localStorage.removeItem.mockClear();
    axios.defaults.headers.common['Authorization'] = '';
  });

  it('should provide auth context with default values', () => {
    localStorage.getItem.mockImplementation(() => null);

    const TestComponent = () => {
      const [auth] = useAuth();
      return (
        <div>
          <p data-testid="user">{auth.user ? auth.user.name : 'No user'}</p>
          <p data-testid="token">{auth.token}</p>
        </div>
      );
    };

    renderWithAuthProvider(<TestComponent />);

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByTestId('token')).toHaveTextContent('');
  });

  it('should load auth data from localStorage and set axios default header', async () => {
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'auth') {
        return JSON.stringify(mockAuthData);
      }
      return null;
    });

    const TestComponent = () => {
      const [auth] = useAuth();
      return (
        <div>
          <p data-testid="user">{auth.user ? auth.user.name : 'No user'}</p>
          <p data-testid="token">{auth.token}</p>
        </div>
      );
    };

    renderWithAuthProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
      expect(screen.getByTestId('token')).toHaveTextContent(mockAuthData.token);
      expect(axios.defaults.headers.common['Authorization']).toBe(mockAuthData.token);
    });
  });

  it('should update auth context and localStorage when setAuth is called', async () => {
    localStorage.getItem.mockImplementation(() => null);

    const TestComponent = () => {
      const [auth, updateAuth] = useAuth();
      return (
        <div>
          <p data-testid="user">{auth.user ? auth.user.name : 'No user'}</p>
          <p data-testid="token">{auth.token}</p>
          <button
            onClick={() =>
              act(() => {
                updateAuth({
                  user: mockAuthData.user,
                  token: mockAuthData.token,
                });
              })
            }
          >
            Set Auth
          </button>
        </div>
      );
    };

    renderWithAuthProvider(<TestComponent />);

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByTestId('token')).toHaveTextContent('');

    screen.getByText('Set Auth').click();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
      expect(screen.getByTestId('token')).toHaveTextContent(mockAuthData.token);
      expect(axios.defaults.headers.common['Authorization']).toBe(mockAuthData.token);
    });
  });
});