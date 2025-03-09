import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Profile from './Profile';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/auth';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mocks
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

jest.mock('axios');
jest.mock('react-hot-toast');

jest.mock('../../components/Layout', () => {
  return ({ children }) => <div data-testid="mock-layout">{children}</div>;
});

jest.mock('../../components/UserMenu', () => {
  return () => <div data-testid="mock-user-menu">User Menu</div>;
});

// Mock user data
const mockUser = {
  email: 'test@example.com',
  name: 'Test User',
  phone: '1234567890',
  address: '123 Test St',
};

describe('Profile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue([{ user: mockUser }, jest.fn()]);

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn().mockReturnValue(JSON.stringify({ user: mockUser })),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  // TEST #1
  it('renders Layout and UserMenu components', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
          <Routes>
            <Route path="/dashboard/user/profile" element={<Profile />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(screen.getByTestId('mock-layout')).toBeInTheDocument();
    expect(screen.getByTestId('mock-user-menu')).toBeInTheDocument();
  });

  // TEST #2
  it('fetches and displays user data correctly', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
          <Routes>
            <Route path="/dashboard/user/profile" element={<Profile />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(screen.getByPlaceholderText('Enter Your Name').value).toBe(mockUser.name);
    expect(screen.getByPlaceholderText('Enter Your Email').value).toBe(mockUser.email);
    expect(screen.getByPlaceholderText('Enter Your Phone').value).toBe(mockUser.phone);
    expect(screen.getByPlaceholderText('Enter Your Address').value).toBe(mockUser.address);
  });

  // TEST #3
  it('updates form inputs correctly', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
          <Routes>
            <Route path="/dashboard/user/profile" element={<Profile />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const nameInput = screen.getByPlaceholderText('Enter Your Name');
    const passwordInput = screen.getByPlaceholderText('Enter Your Password');
    const phoneInput = screen.getByPlaceholderText('Enter Your Phone');
    const addressInput = screen.getByPlaceholderText('Enter Your Address');

    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    fireEvent.change(passwordInput, { target: { value: 'newpassword' } });
    fireEvent.change(phoneInput, { target: { value: '0987654321' } });
    fireEvent.change(addressInput, { target: { value: '456 New St' } });

    expect(nameInput.value).toBe('New Name');
    expect(passwordInput.value).toBe('newpassword');
    expect(phoneInput.value).toBe('0987654321');
    expect(addressInput.value).toBe('456 New St');
  });

  // TEST #4
  it('submits the form correctly', async () => {
    const mockSetAuth = jest.fn();
    useAuth.mockReturnValue([{ user: mockUser }, mockSetAuth]);
  
    axios.put.mockResolvedValue({ data: { updatedUser: { ...mockUser, name: 'Updated Name' } } });
  
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
          <Routes>
            <Route path="/dashboard/user/profile" element={<Profile />} />
          </Routes>
        </MemoryRouter>
      );
    });
  
    const nameInput = screen.getByPlaceholderText('Enter Your Name');
    const passwordInput = screen.getByPlaceholderText('Enter Your Password');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    fireEvent.change(passwordInput, { target: { value: 'updatedpassword' } });
  
    const submitButton = screen.getByText('UPDATE');
    fireEvent.click(submitButton);
  
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  
    expect(axios.put).toHaveBeenCalledWith(
      '/api/v1/auth/profile',
      expect.objectContaining({
        updatedData: {
          name: 'Updated Name',
          password: 'updatedpassword',
        },
      })
    );
  
    await waitFor(() => expect(mockSetAuth).toHaveBeenCalledWith({
      user: { ...mockUser, name: 'Updated Name' },
    }));
  
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Profile Updated Successfully'));
  });

  // TEST #5
  it('handles form submission errors', async () => {
    axios.put.mockRejectedValueOnce(new Error('Something went wrong'));
  
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
          <Routes>
            <Route path="/dashboard/user/profile" element={<Profile />} />
          </Routes>
        </MemoryRouter>
      );
    });
  
    const nameInput = screen.getByPlaceholderText('Enter Your Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
  
    const submitButton = screen.getByText('UPDATE');
    fireEvent.click(submitButton);
  
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Something went wrong'));
  });

  // TEST #6
  it('disables the email input', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
          <Routes>
            <Route path="/dashboard/user/profile" element={<Profile />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const emailInput = screen.getByPlaceholderText('Enter Your Email');
    expect(emailInput).toBeDisabled();
  });

  // TEST #7
  it('shows error if name field is empty', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
          <Routes>
            <Route path="/dashboard/user/profile" element={<Profile />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const nameInput = screen.getByPlaceholderText('Enter Your Name');
    fireEvent.change(nameInput, { target: { value: '' } });

    const submitButton = screen.getByText('UPDATE');
    fireEvent.click(submitButton);

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Name field cannot be empty.'));
  });

  // TEST #8
  it('shows error if phone field is empty', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
          <Routes>
            <Route path="/dashboard/user/profile" element={<Profile />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const phoneInput = screen.getByPlaceholderText('Enter Your Phone');
    fireEvent.change(phoneInput, { target: { value: '' } });

    const submitButton = screen.getByText('UPDATE');
    fireEvent.click(submitButton);

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Phone field cannot be empty.'));
  });

  // TEST #9
  it('shows error if address field is empty', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
          <Routes>
            <Route path="/dashboard/user/profile" element={<Profile />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const addressInput = screen.getByPlaceholderText('Enter Your Address');
    fireEvent.change(addressInput, { target: { value: '' } });

    const submitButton = screen.getByText('UPDATE');
    fireEvent.click(submitButton);

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Address field cannot be empty.'));
  });

  // TEST #10
  it('shows error if password is less than 6 characters', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
          <Routes>
            <Route path="/dashboard/user/profile" element={<Profile />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const passwordInput = screen.getByPlaceholderText('Enter Your Password');
    fireEvent.change(passwordInput, { target: { value: '123' } });

    const submitButton = screen.getByText('UPDATE');
    fireEvent.click(submitButton);

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Password must be at least 6 characters long.'));
  });

  // TEST #11
  it('shows error if password contains whitespace', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
          <Routes>
            <Route path="/dashboard/user/profile" element={<Profile />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const passwordInput = screen.getByPlaceholderText('Enter Your Password');
    fireEvent.change(passwordInput, { target: { value: 'pass word' } });

    const submitButton = screen.getByText('UPDATE');
    fireEvent.click(submitButton);

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Password cannot contain whitespace.'));
  });

  // TEST #12
  it('shows error if no changes are detected', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/dashboard/user/profile"]}>
          <Routes>
            <Route path="/dashboard/user/profile" element={<Profile />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const submitButton = screen.getByText('UPDATE');
    fireEvent.click(submitButton);

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No changes detected. Please update at least one field before saving.'));
  });
});