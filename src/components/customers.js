import React, { useState } from "react";
import "./Customers.css";

export default function Customers({ customers, addCustomer, updateCustomer, deleteCustomer }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  function handleAddOrUpdate() {
    if (!form.name || !form.email || !form.phone) {
      alert("Please fill all fields.");
      return;
    }
    if (/\d/.test(form.name)) {
      alert("Customer name cannot contain numbers.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      alert("Invalid email format.");
      return;
    }
    if (!/^\d+$/.test(form.phone)) {
      alert("Phone number should contain only digits.");
      return;
    }

    const payload = { name: form.name, email: form.email, phone: form.phone };
    if (editingId) {
      updateCustomer(editingId, payload);
      setEditingId(null);
    } else {
      addCustomer(payload);
    }
    setForm({ name: "", email: "", phone: "" });
  }

  function startEdit(c) {
    setEditingId(c.id);
    setForm({ name: c.name, email: c.email, phone: c.phone });
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  return (
    <div className="customers">
      <h1>Customers</h1>

      <div className="card customer-list-card">
        <h3>Customer List</h3>
        <input
          className="search-input"
          placeholder="Search customers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="table-wrap">
          <table className="table" aria-label="Customer list">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>
                    <button className="btn ghost" onClick={() => startEdit(c)}>Update</button>
                    <button className="btn danger" onClick={() => {
                      if (window.confirm("Delete customer?")) deleteCustomer(c.id);
                    }}>Delete</button>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="4" className="small">No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card add-customer-card">
        <h3>{editingId ? "Update Customer" : "Add New Customer"}</h3>
        <div className="form-row">
          <input
            placeholder="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value.replace(/\d/g, "") })}
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value.replace(/[^\d]/g, "") })}
          />
          <div className="form-buttons">
            <button className="btn primary" onClick={handleAddOrUpdate}>
              {editingId ? "Save Changes" : "Add Customer"}
            </button>
            {editingId && (
              <button
                className="btn ghost"
                onClick={() => setEditingId(null) || setForm({ name: "", email: "", phone: "" })}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
