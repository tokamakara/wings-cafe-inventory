import React, { useState, useEffect, useRef } from "react";
import Notification from "./Notification";
import "./Sales.css";

export default function Sales({ products, processSale, customers }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sellQty, setSellQty] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [search, setSearch] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const searchRef = useRef(null);

  // Filter products dynamically based on search input
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSearch(product.name);
    setDropdownVisible(false);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) {
      setNotification({ type: "error", message: "Select a product first." });
      return;
    }

    const qty = Number(sellQty);
    if (!qty || qty <= 0) {
      setNotification({ type: "error", message: "Enter a valid quantity." });
      return;
    }

    const existingInCart = cart.find(item => item.productId === selectedProduct.id);
    const currentInCartQty = existingInCart ? existingInCart.units : 0;
    const availableStock = selectedProduct.quantity - currentInCartQty;

    if (qty > availableStock) {
      setNotification({ type: "error", message: `Insufficient stock for "${selectedProduct.name}".` });
      return;
    }

    if (existingInCart) {
      setCart(prev =>
        prev.map(item =>
          item.productId === selectedProduct.id
            ? { ...item, units: item.units + qty, line: (item.units + qty) * item.price }
            : item
        )
      );
    } else {
      setCart(prev => [
        ...prev,
        { productId: selectedProduct.id, name: selectedProduct.name, units: qty, price: selectedProduct.price, line: qty * selectedProduct.price }
      ]);
    }

    setSellQty("");
    setSearch("");
    setSelectedProduct(null);
  };

  const removeFromCart = pid => {
    setCart(prev => prev.filter(item => item.productId !== pid));
  };

  const updateCartQty = (pid, val) => {
    const product = products.find(p => p.id === pid);
    if (!product) return;

    if (val === "") {
      setCart(prev => prev.map(item => item.productId === pid ? { ...item, units: "" } : item));
      return;
    }

    const qty = Number(val);
    if (qty > product.quantity) {
      setNotification({ type: "error", message: `Insufficient stock for "${product.name}".` });
      return;
    }

    if (qty <= 0) {
      removeFromCart(pid);
      return;
    }

    setCart(prev =>
      prev.map(item =>
        item.productId === pid ? { ...item, units: qty, line: qty * item.price } : item
      )
    );
  };

  const handleSell = () => {
    if (!cart.length) {
      setNotification({ type: "error", message: "Add items to cart first." });
      return;
    }

    // Final stock check
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
      return;
    }

    setNotification({
      type: "success",
      message: `Sale recorded. Total: LSL ${result.sale.total.toFixed(2)}`
    });

    setCart([]);
    setSelectedCustomer("");
    setSearch("");
    setSelectedProduct(null);
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
        <div className="add-product-form" ref={searchRef}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setDropdownVisible(true);
            }}
            onFocus={() => setDropdownVisible(true)}
          />
          {dropdownVisible && filteredProducts.length > 0 && (
            <ul className="autocomplete-dropdown">
              {filteredProducts.map(p => (
                <li key={p.id} onClick={() => handleSelectProduct(p)}>
                  {p.name} ({p.quantity} available) - LSL {p.price.toFixed(2)}
                </li>
              ))}
            </ul>
          )}
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
