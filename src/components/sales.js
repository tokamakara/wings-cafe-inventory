import React, { useState, useEffect } from "react";
import Notification from "./Notification";
import "./Sales.css";

export default function Sales({ products, processSale, customers }) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [sellQty, setSellQty] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [search, setSearch] = useState("");

  // Filter products dynamically based on search input
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Only auto-select if nothing is selected yet
  useEffect(() => {
    if (!selectedProduct && filteredProducts.length > 0) {
      setSelectedProduct(filteredProducts[0].id);
    }
  }, [search, filteredProducts, selectedProduct]);

  const handleAddToCart = () => {
    if (!selectedProduct)
      return setNotification({ type: "error", message: "Select a product first." });

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const qty = Number(sellQty);
    if (!qty || qty <= 0)
      return setNotification({ type: "error", message: "Enter a valid quantity." });

    const existing = cart.find(item => item.productId === selectedProduct);
    if (existing) {
      const newQty = existing.units + qty;
      if (newQty > product.quantity)
        return setNotification({ type: "error", message: `Insufficient stock for "${product.name}".` });

      setCart(prev =>
        prev.map(item =>
          item.productId === selectedProduct
            ? { ...item, units: newQty, line: newQty * item.price }
            : item
        )
      );
    } else {
      setCart(prev => [
        ...prev,
        { productId: product.id, name: product.name, units: qty, price: product.price, line: qty * product.price }
      ]);
    }

    setSellQty("");
  };

  const removeFromCart = pid =>
    setCart(prev => prev.filter(item => item.productId !== pid));

  const updateCartQty = (pid, val) => {
    const product = products.find(p => p.id === pid);
    if (!product) return;

    if (val === "")
      return setCart(prev => prev.map(item => item.productId === pid ? { ...item, units: "" } : item));

    const qty = Number(val);
    if (qty > product.quantity)
      return setNotification({ type: "error", message: `Insufficient stock for "${product.name}".` });

    if (qty === 0) return removeFromCart(pid);

    setCart(prev =>
      prev.map(item =>
        item.productId === pid ? { ...item, units: qty, line: qty * item.price } : item
      )
    );
  };

  const handleSell = () => {
    if (!cart.length) return setNotification({ type: "error", message: "Add items to cart first." });

    for (const item of cart) {
      const product = products.find(p => p.id === item.productId);
      if (!product || item.units > product.quantity)
        return setNotification({ type: "error", message: `Insufficient stock for "${item.name}".` });
    }

    const items = cart.map(c => ({ productId: c.productId, units: c.units }));
    const result = processSale(items, selectedCustomer || null);

    if (!result.success)
      return setNotification({ type: "error", message: result.message || "Sale failed." });

    setNotification({ type: "success", message: `Sale recorded. Total: LSL ${result.sale.total.toFixed(2)}` });
    setCart([]);
    setSelectedCustomer("");
    setSearch("");
    setSelectedProduct("");
  };

  const total = cart.reduce((sum, item) => sum + (item.line || 0), 0);

  return (
    <div className="sales-page">
      <h1>Sales</h1>

      {notification.message && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ type: "", message: "" })}
        />
      )}

      {/* Add Product */}
      <div className="card add-product-card">
        <h3>Add Product to Cart</h3>
        <div className="add-product-form">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            value={selectedProduct}
            onChange={e => setSelectedProduct(e.target.value)}
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.quantity} available) - LSL {p.price.toFixed(2)}
                </option>
              ))
            ) : (
              <option value="">No matching products</option>
            )}
          </select>
          <input
            type="number"
            placeholder="Quantity"
            min="1"
            value={sellQty}
            onChange={e => setSellQty(e.target.value)}
          />
          <button className="btn primary" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>

      {/* Cart */}
      <div className="card cart-card">
        <h3>Cart</h3>
        {cart.length === 0 ? (
          <p className="small">No items in cart</p>
        ) : (
          <ul className="cart-list">
            {cart.map(item => (
              <li key={item.productId} className="cart-item">
                <div className="cart-item-info">
                  <span>{item.name} × </span>
                  <input
                    type="number"
                    min="0"
                    max={products.find(p => p.id === item.productId)?.quantity || item.units}
                    value={item.units}
                    onChange={e => updateCartQty(item.productId, e.target.value)}
                  />
                  <span> = LSL {(item.line || 0).toFixed(2)}</span>
                </div>
                <button
                  className="btn ghost small"
                  onClick={() => removeFromCart(item.productId)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="cart-summary">
          <label>Customer (optional)</label>
          <select
            value={selectedCustomer}
            onChange={e => setSelectedCustomer(e.target.value)}
          >
            <option value="">Walk-in</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div className="total">
            <strong>Total: LSL {total.toFixed(2)}</strong>
          </div>

          <button className="btn primary" onClick={handleSell}>Sell</button>
        </div>
      </div>
    </div>
  );
}
