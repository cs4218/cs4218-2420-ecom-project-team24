import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import AdminMenu from "../../components/AdminMenu";
import axios from "axios";

const Users = () => {
  const [users, setUsers] = useState([]); // State to store users

  // Fetch users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("/api/v1/auth/all-users"); // api call not implemented yet, subject to change according to backend
        setUsers(data); // Update state with the fetched users
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []); // Empty dependency array means this runs once after the initial render

  return (
    <Layout title={"Dashboard - All Users"}>
      <div className="container-fluid m-3 p-3">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <h1>All Users</h1>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={user._id} data-testid={`user-${i}`}>
                    <td data-testid={`user-name-${i}`}>{user.name}</td>
                    <td data-testid={`user-email-${i}`}>{user.email}</td>
                    <td data-testid={`user-phone-${i}`}>{user.phone}</td>
                    <td data-testid={`user-address-${i}`}>{user.address}</td>
                    <td data-testid={`user-role-${i}`}>{user.role === 1 ? "Admin" : "User"}</td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Users;
