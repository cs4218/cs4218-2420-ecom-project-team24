import React from 'react';
import { render, fireEvent, waitFor, screen, getByTestId } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import UserMenu from './UserMenu';

describe('UserMenu Component', () => {

    const renderUserMenu = () => {
            return render(
              <MemoryRouter>
                <UserMenu />
              </MemoryRouter>
            );
          };


    it('should render the dashboard heading', () => {
      const { getByText } = renderUserMenu();
      expect(getByText('Dashboard')).toBeInTheDocument();
    });
  
    it('should render the Profile link', () => {
        renderUserMenu();

        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Profile').closest('a')).toHaveAttribute('href', '/dashboard/user/profile');
    });
  
    it('should render the Orders link', () => {
        renderUserMenu();

        expect(screen.getByText('Orders')).toBeInTheDocument();
        expect(screen.getByText('Orders').closest('a')).toHaveAttribute('href', '/dashboard/user/orders');
    });

    it("should apply the correct CSS classes to the NavLinks", () => {
        const { getByText } = renderUserMenu()
        const profileLink = getByText("Profile");
        const ordersLink = getByText("Orders");
      
        // Check for correct list-group-item and action classes
        expect(profileLink).toHaveClass("list-group-item");
        expect(profileLink).toHaveClass("list-group-item-action");
        expect(ordersLink).toHaveClass("list-group-item");
        expect(ordersLink).toHaveClass("list-group-item-action");
    });
  });