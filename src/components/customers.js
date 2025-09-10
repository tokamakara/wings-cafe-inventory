import React, { useState } from "react";

export default function Customers({ customers, addCustomer, updateCustomer, deleteCustomer }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  function handleAddOrUpdate() {
    // Validation
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
  }

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div>
      <h1>Customers</h1>

      <div className="card">
        <h3>{editingId ? "Update customer" : "Add new customer"}</h3>
        <div className="form-row">
          <input
            placeholder="Name"
            value={form.name}
            onChange={e => {
              const sanitized = e.target.value.replace(/\d/g, ""); // Remove digits
              setForm({ ...form, name: sanitized });
            }}
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={e => {
              const sanitized = e.target.value.replace(/[^\d]/g, ""); // Keep digits only
              setForm({ ...form, phone: sanitized });
            }}
          />
          <button className="btn primary" onClick={handleAddOrUpdate}>
            {editingId ? "Save changes" : "Add customer"}
          </button>
          {editingId && (
            <button
              className="btn ghost"
              onClick={() => {
                setEditingId(null);
                setForm({ name: "", email: "", phone: "" });
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Customer list</h3>
        <input
          style={{ marginBottom: 10, padding: 6, width: "100%" }}
          placeholder="Search customers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <table className="table">
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
                  <button className="btn ghost" onClick={() => startEdit(c)}>
                    Update
                  </button>
                  <button
                    className="btn danger"
                    onClick={() => {
                      if (window.confirm("Delete customer?")) deleteCustomer(c.id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
