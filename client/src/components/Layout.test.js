import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import this to extend Jest matchers
import Layout from './Layout';

// Mock components
jest.mock('./Header', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('./Footer', () => () => <div data-testid="mock-footer">Footer</div>);
jest.mock('react-helmet', () => ({
  Helmet: ({ children }) => <div data-testid="mock-helmet">{children}</div>,
}));
jest.mock('react-hot-toast', () => ({
  Toaster: () => <div data-testid="mock-toaster">Toaster</div>,
}));

describe('Layout Component', () => {
  const defaultProps = {
    title: "Ecommerce app - shop now",
    description: "mern stack project",
    keywords: "mern,react,node,mongodb",
    author: "Techinfoyt",
  };

  beforeEach(() => {
    // Clear the document head before each test
    document.head.innerHTML = '';
  });

  // TEST #1
  it('renders Helmet with correct meta tags and title', () => {
    render(<Layout {...defaultProps}>Test Children</Layout>);
    
    expect(document.title).toBe(defaultProps.title);
    expect(document.querySelector('meta[name="description"]').content).toBe(defaultProps.description);
    expect(document.querySelector('meta[name="keywords"]').content).toBe(defaultProps.keywords);
    expect(document.querySelector('meta[name="author"]').content).toBe(defaultProps.author);
  });

  // TEST #2
  it('renders Header and Footer components', () => {
    render(<Layout {...defaultProps}>Test Children</Layout>);
    
    const header = screen.getByTestId('mock-header');
    const footer = screen.getByTestId('mock-footer');
    expect(header).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
  });

  // TEST #3
  it('renders Toaster component', () => {
    render(<Layout {...defaultProps}>Test Children</Layout>);
    
    const toaster = screen.getByTestId('mock-toaster');
    expect(toaster).toBeInTheDocument();
  });

  // TEST #4
  it('renders children prop correctly', () => {
    render(<Layout {...defaultProps}>Test Children</Layout>);
    
    const children = screen.getByText('Test Children');
    expect(children).toBeInTheDocument();
  });

  // TEST #5
  it('applies default props correctly', () => {
    render(<Layout>Test Children</Layout>);
    
    expect(document.title).toBe(defaultProps.title);
    expect(document.querySelector('meta[name="description"]').content).toBe(defaultProps.description);
    expect(document.querySelector('meta[name="keywords"]').content).toBe(defaultProps.keywords);
    expect(document.querySelector('meta[name="author"]').content).toBe(defaultProps.author);
  });
});