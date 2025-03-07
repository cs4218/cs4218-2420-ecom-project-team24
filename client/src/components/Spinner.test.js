import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import Spinner from './Spinner';
import { useNavigate, useLocation } from 'react-router-dom';

// Mock useNavigate and useLocation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

describe('Spinner Component', () => {
  let navigateMock;
  let locationMock;

  beforeEach(() => {

    jest.clearAllMocks();

    // Mock navigate function
    navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock);

    // Mock location object
    locationMock = { pathname: '/current-path' };
    useLocation.mockReturnValue(locationMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // TEST #1
  it('renders correctly with initial count', () => {
    render(
      <Router>
        <Spinner />
      </Router>
    );

    expect(screen.getByText('redirecting to you in 3 second')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  // TEST #2
  it('decrements the count every second and navigates when count reaches 0', () => {
    jest.useFakeTimers();

    render(
      <Router>
        <Spinner />
      </Router>
    );

    expect(screen.getByText('redirecting to you in 3 second')).toBeInTheDocument();

    // Fast-forward 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText('redirecting to you in 2 second')).toBeInTheDocument();

    // Fast-forward 1 more second
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText('redirecting to you in 1 second')).toBeInTheDocument();

    // Fast-forward 1 more second
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(navigateMock).toHaveBeenCalledWith('/login', { state: '/current-path' });

    jest.useRealTimers();
  });

  // TEST #3
  it('navigates to the specified path when count reaches 0', () => {
    jest.useFakeTimers();

    render(
      <Router>
        <Spinner path="home" />
      </Router>
    );

    // Fast-forward 3 seconds
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(navigateMock).toHaveBeenCalledWith('/home', { state: '/current-path' });

    jest.useRealTimers();
  });
});