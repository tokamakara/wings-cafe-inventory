import React, { useState } from "react";
import Notification from "./Notification";
import "./Inventory.css";

export default function Inventory({ products, addProduct, updateProduct, deleteProduct, restockProduct }) {
  const [form, setForm] = useState({ name: "", description: "", category: "", price: "", quantity: "" });
  const [editingId, setEditingId] = useState(null);
  const [notification, setNotification] = useState({ type: "", message: "" });

  function handleAddOrUpdate() {
    if (!form.name || !form.price || !form.quantity) {
      setNotification({ type: "error", message: "Please fill name, price, and quantity." });
      return;
    }
    if (isNaN(Number(form.price)) || Number(form.price) <= 0) {
      setNotification({ type: "error", message: "Price must be a positive number." });
      return;
    }
    if (isNaN(Number(form.quantity)) || Number(form.quantity) < 0) {
      setNotification({ type: "error", message: "Quantity must be zero or positive." });
      return;
    }
    if (!/^[A-Za-z\s]+$/.test(form.name)) {
      setNotification({ type: "error", message: "Product name must contain letters only." });
      return;
    }

    const payload = { 
      name: form.name, 
      description: form.description, 
      category: form.category, 
      price: Number(form.price), 
      quantity: Number(form.quantity) 
    };

    if (editingId) {
      updateProduct(editingId, payload);
      setNotification({ type: "success", message: `Product "${form.name}" updated successfully!` });
      setEditingId(null);
    } else {
      addProduct(payload);
      setNotification({ type: "success", message: `Product "${form.name}" added successfully!` });
    }

    setForm({ name: "", description: "", category: "", price: "", quantity: "" });
  }

  function startEdit(p) {
    setEditingId(p.id);
    setForm({ name: p.name, description: p.description, category: p.category, price: p.price, quantity: p.quantity });
    setNotification({ type: "", message: "" });
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  function handleRestockPrompt(p) {
    const qty = prompt(`Enter restock quantity for "${p.name}"`);
    const numQty = Number(qty);
    if (!numQty || numQty <= 0) {
      setNotification({ type: "error", message: "Invalid restock quantity." });
      return;
    }
    restockProduct(p.id, numQty);
    setNotification({ type: "success", message: `Restocked ${numQty} units for "${p.name}".` });
  }

  return (
    <div className="inventory">
      <h1>Inventory</h1>

      {/* Product Table */}
      <div className="card product-list-card">
        <h3>Product List</h3>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.description}</td>
                  <td>{p.category}</td>
                  <td>{p.price}</td>
                  <td>{p.quantity}</td>
                  <td>
                    <button className="btn ghost" onClick={() => startEdit(p)}>Update</button>
                    <button className="btn danger" onClick={() => { if(window.confirm("Delete product?")) deleteProduct(p.id); }}>Delete</button>
                    <button className="btn primary" onClick={() => handleRestockPrompt(p)}>Restock</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="6" className="small">No products available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notification */}
      {notification.message && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ type: "", message: "" })}
        />
      )}

      {/* Add / Update Form */}
      <div className="card add-product-card">
        <h3>{editingId ? "Update Product" : "Add New Product"}</h3>
        <div className="form-row">
          <input
            placeholder="Product name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value.replace(/[^A-Za-z\s]/g, "") })}
          />
          <input
            placeholder="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <input
            placeholder="Category"
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
          />
          <input
            placeholder="Price (LSL)"
            type="number"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value.replace(/[^\d.]/g, "") })}
          />
          <input
            placeholder="Initial quantity"
            type="number"
            value={form.quantity}
            onChange={e => setForm({ ...form, quantity: e.target.value.replace(/[^\d]/g, "") })}
          />
          <div className="form-buttons">
            <button className="btn primary" onClick={handleAddOrUpdate}>
              {editingId ? "Save" : "Add"}
            </button>
            {editingId && (
              <button className="btn ghost" onClick={() => setEditingId(null) || setForm({ name: "", description: "", category: "", price: "", quantity: "" })}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
