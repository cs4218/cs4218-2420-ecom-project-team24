import React from 'react';
import { render, screen, fireEvent, waitFor, window } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { useSearch, SearchProvider } from "../../context/search";
import { useAuth, AuthProvider } from '../../context/auth';
import { useCart, CartProvider  } from '../../context/cart';
import SearchInput from '../../components/Form/SearchInput';
import Search from '../../pages/Search';

jest.mock('axios');

const count = 3;

const generateMockProducts = (count) => {
    const products = [];
    for (let i = 1; i <= count; i++) {
      products.push({
        _id: i.toString(),
        name: `Product${i}`,
        slug: `product-${i}`,
        description: `Description of product ${i}`,
        price: (i + 1) * 10,
        quantity: (i + 1) * 10,
        category: {
            _id: 1,
            name: 'mockCategory1',
        },
      });
    }
    return products;
};

const mockSearchResults = generateMockProducts(count);

axios.get.mockResolvedValue({
    data: mockSearchResults,
});

const renderSearchInput = () => {
    render(
        <MemoryRouter>
            <AuthProvider>
                <CartProvider>
                    <SearchProvider>
                        <Routes>
                            <Route path="/" element={<SearchInput />} />
                            <Route path="/search" element={<Search />} />
                        </Routes>
                    </SearchProvider>
                </CartProvider>
            </AuthProvider>
        </MemoryRouter>
    );
};

describe("SW - Search integration test with frontend", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("Should navigate to search results page upon successful search", async () => {
        renderSearchInput();
        const searchInput = screen.getByPlaceholderText("Search");
        fireEvent.change(searchInput, { target: { value: "somekeyword" } });
        fireEvent.click(screen.getByRole("button", { name: /search/i }));
        await waitFor(() => {
            expect(screen.getByText("Search Resuts")).toBeInTheDocument();
        });
    });

    it("After navigation, should display correct number of search results", async () => {
        renderSearchInput();
        const searchInput = screen.getByPlaceholderText("Search");
        fireEvent.change(searchInput, { target: { value: "somekeyword" } });
        fireEvent.click(screen.getByRole("button", { name: /search/i }));
        await waitFor(() => {
            expect(screen.getByText(new RegExp('Found ' + mockSearchResults.length.toString()))).toBeInTheDocument();
            expect(screen.queryAllByText(new RegExp('More Details'))).toHaveLength(mockSearchResults.length);
        });
    });

    it("After navigation, should display correct product details", async () => {
        renderSearchInput();
        const searchInput = screen.getByPlaceholderText("Search");
        fireEvent.change(searchInput, { target: { value: "somekeyword" } });
        fireEvent.click(screen.getByRole("button", { name: /search/i }));
        await waitFor(() => {
            for (let i = 0; i < count; i++) {
                expect(screen.getByText(new RegExp(mockSearchResults[i].name))).toBeInTheDocument();
                expect(screen.getByText(new RegExp(mockSearchResults[i].description))).toBeInTheDocument();
            }
        });
    });

    it("After navigation, search bar should still display searched keyword", async () => {
        renderSearchInput();
        const searchInput = screen.getByPlaceholderText("Search");
        fireEvent.change(searchInput, { target: { value: "somekeyword" } });
        fireEvent.click(screen.getByRole("button", { name: /search/i }));
        await waitFor(() => {
            const searchBar = screen.getByPlaceholderText(new RegExp('Search'));
            expect(searchBar).toHaveValue("somekeyword");
        });
    });

    it("After returning to homepage, search bar should still display searched keyword", async () => {
        renderSearchInput();
        const searchInput = screen.getByPlaceholderText("Search");
        fireEvent.change(searchInput, { target: { value: "somekeyword" } });
        fireEvent.click(screen.getByRole("button", { name: /search/i }));
        await waitFor(() => {
            const homePageButton = screen.getByText(new RegExp('Virtual Vault'));
            fireEvent.click(homePageButton);
        });

        await waitFor(() => {
            const searchBar = screen.getByPlaceholderText(new RegExp('Search'));
            expect(searchBar).toHaveValue("somekeyword");
        })
    });
});