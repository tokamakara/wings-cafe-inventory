import React, { useState } from "react";
import Notification from "./Notification";

export default function Sales({ products, processSale, customers }) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [sellQty, setSellQty] = useState("");
  const [cart, setCart] = useState([]); // { productId, name, units, price, line }
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Add product to cart
  const handleAddToCart = () => {
    if (!selectedProduct) {
      setNotification({ type: "error", message: "Select a product first." });
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const qty = Number(sellQty);
    if (!qty || qty <= 0) {
      setNotification({ type: "error", message: "Enter a valid quantity." });
      return;
    }

    const existing = cart.find(item => item.productId === selectedProduct);
    if (existing) {
      const newQty = existing.units + qty;
      if (newQty > product.quantity) {
        setNotification({ type: "error", message: `Insufficient stock for "${product.name}".` });
        return;
      }
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
    setSelectedProduct("");
  };

  // Remove item from cart
  const removeFromCart = pid => {
    setCart(prev => prev.filter(item => item.productId !== pid));
  };

  // Update quantity directly in cart
  const updateCartQty = (pid, val) => {
    const product = products.find(p => p.id === pid);
    if (!product) return;

    if (val === "") {
      // temporarily allow empty input while typing
      setCart(prev =>
        prev.map(item =>
          item.productId === pid ? { ...item, units: "" } : item
        )
      );
      return;
    }

    const qty = Number(val);

    if (qty > product.quantity) {
      setNotification({ type: "error", message: `Insufficient stock for "${product.name}".` });
      return;
    }

    if (qty === 0) {
      removeFromCart(pid);
      return;
    }

    setCart(prev =>
      prev.map(item =>
        item.productId === pid ? { ...item, units: qty, line: qty * item.price } : item
      )
    );
  };

  // Process sale
  const handleSell = () => {
    if (cart.length === 0) {
      setNotification({ type: "error", message: "Add items to cart first." });
      return;
    }

    // Validate stock
    for (const item of cart) {
      const product = products.find(p => p.id === item.productId);
      if (!product || item.units > product.quantity) {
        setNotification({ type: "error", message: `Insufficient stock for "${item.name}".` });
        return;
      }
    }

    const items = cart.map(c => ({ productId: c.productId, units: c.units }));
    const result = processSale(items, selectedCustomer || null);

    if (!result.success) {
      setNotification({ type: "error", message: result.message || "Sale failed." });
    } else {
      setNotification({ type: "success", message: `Sale recorded. Total: LSL ${result.sale.total.toFixed(2)}` });
      setCart([]);
      setSelectedCustomer("");
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.line || 0), 0);

  return (
    <div>
      <h1>Sales</h1>

      {notification.message && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ type: "", message: "" })}
        />
      )}

      {/* Add Product to Cart */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Add Product to Cart</h3>
        <div className="flex" style={{ gap: 8, flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <input
              placeholder="Search products..."
              style={{ width: "100%", padding: 6, marginBottom: 6 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              style={{ width: "100%", padding: 8 }}
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
            >
              <option value="">Select product</option>
              {filteredProducts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.quantity} available) - LSL {p.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="number"
              placeholder="Quantity"
              min="1"
              style={{ padding: 8, width: 120 }}
              value={sellQty}
              onChange={e => setSellQty(e.target.value)}
            />
          </div>
          <div>
            <button className="btn primary" onClick={handleAddToCart}>Add to Cart</button>
          </div>
        </div>
      </div>

      {/* Cart */}
      <aside style={{ maxWidth: 500 }}>
        <h3>Cart</h3>
        <div className="card">
          {cart.length === 0 ? (
            <p className="small">No items in cart</p>
          ) : (
            <ul>
              {cart.map(item => (
                <li key={item.productId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div>
                    {item.name} × 
                    <input
                      type="number"
                      min="0"
                      max={products.find(p => p.id === item.productId)?.quantity || item.units}
                      value={item.units}
                      style={{ width: 60, marginLeft: 4 }}
                      onChange={e => updateCartQty(item.productId, e.target.value)}
                    />
                    = LSL {(item.line || 0).toFixed(2)}
                  </div>
                  <button className="btn ghost small" style={{ padding: "2px 6px" }} onClick={() => removeFromCart(item.productId)}>Remove</button>
                </li>
              ))}
            </ul>
          )}
          <div style={{ marginTop: 10 }}>
            <div className="small">Customer (optional)</div>
            <select style={{ width: "100%", padding: 8, marginTop: 6 }} value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}>
              <option value="">Walk-in</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div style={{ marginTop: 10 }}><strong>Total: LSL {total.toFixed(2)}</strong></div>
            <button className="btn primary" style={{ marginTop: 10 }} onClick={handleSell}>Sell</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
