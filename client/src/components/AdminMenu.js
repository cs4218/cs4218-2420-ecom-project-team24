import React from "react";
import { NavLink } from "react-router-dom";
const AdminMenu = () => {
  return (
    <>
      <nav className="text-center" data-testid="admin-menu-container">
        <h4>Admin Panel</h4>
        <ul className="list-group dashboard-menu" aria-label="Admin Panel">
          <li>
            <NavLink
              to="/dashboard/admin/create-category"
              className="list-group-item list-group-item-action"
            >
              Create Category
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/admin/create-product"
              className="list-group-item list-group-item-action"
            >
              Create Product
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/admin/products"
              className="list-group-item list-group-item-action"
            >
              Products
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/admin/orders"
              className="list-group-item list-group-item-action"
            >
              Orders
            </NavLink>
          </li>
          {/* <li>
            <NavLink
              to="/dashboard/admin/users"
              className="list-group-item list-group-item-action"
            >
              Users
            </NavLink>
          </li> */}
        </ul>
      </nav>
    </>
  );
};

export default AdminMenu;
