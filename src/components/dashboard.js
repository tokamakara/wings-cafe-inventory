import React, { useState, useMemo } from "react";
import "./Dashboard.css";

// ✅ Beverages
import Pepsi from "../images/Pepsi.jpeg";
import Coca_Cola from "../images/Coca_Cola.jpeg";
import Reboost_Energy_Drink from "../images/Reboost_Energy_Drink.jpeg";
import Cappuccino from "../images/Cappuccino.jpeg";
import Green_Tea from "../images/Green_Tea.jpeg";
import Espresso from "../images/Espresso.jpeg";
import Americano from "../images/Americano.jpeg";
import Latte from "../images/Latte.jpeg";
import Hot_Chocolate from "../images/Hot_Chocolate.jpeg";
import Appletiser from "../images/Appletiser.jpeg";
import Mountain_Kingdom_Drops from "../images/Mountain_Kingdom_Drops.jpeg";

// ✅ Food
import Ham_and_Cheese_Sandwich from "../images/Ham_and_Cheese_Sandwich.jpeg";
import Croissant from "../images/Croissant.jpeg";
import Blueberry_Muffin from "../images/Blueberry_Muffin.jpeg";
import Chicken_Wrap from "../images/Chicken_Wrap.jpeg";
import Caesar_Salad from "../images/Caesar_Salad.jpeg";

// ✅ Snacks
import Mozzarella_Sticks from "../images/Mozzarella_Sticks.jpeg";
import Fries from "../images/Fries.jpeg";
import Onion_Rings from "../images/Onion_Rings.jpeg";

// ✅ Desserts
import Ice_Cream_Scoop from "../images/Ice_Cream_Scoop.jpeg";
import Cheesecake_Slice from "../images/Cheesecake_Slice.jpeg";
import Chocolate_Cake_Slice from "../images/Chocolate_Cake_Slice.jpeg";

// Map product names to images
const imagesMap = {
  Pepsi,
  Coca_Cola,
  Reboost_Energy_Drink,
  Cappuccino,
  Green_Tea,
  Espresso,
  Americano,
  Latte,
  Hot_Chocolate,
  Appletiser,
  Mountain_Kingdom_Drops,
  Ham_and_Cheese_Sandwich,
  Croissant,
  Blueberry_Muffin,
  Chicken_Wrap,
  Caesar_Salad,
  Mozzarella_Sticks,
  French_Fries: Fries,
  Onion_Rings,
  Ice_Cream_Scoop,
  Cheesecake_Slice,
  Chocolate_Cake_Slice,
};

export default function Dashboard({ products = [], sales = [] }) {
  const [salesPeriod, setSalesPeriod] = useState("daily"); // default = daily
  const [showLowStock, setShowLowStock] = useState(false); // toggle low stock list

  const filteredSales = useMemo(() => {
    const now = new Date();
    return sales.filter((s) => {
      const saleDate = new Date(s.date);
      switch (salesPeriod) {
        case "daily":
          return saleDate.toDateString() === now.toDateString();
        case "weekly": {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          return saleDate >= startOfWeek && saleDate <= now;
        }
        case "monthly":
          return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
        case "yearly":
          return saleDate.getFullYear() === now.getFullYear();
        case "all":
        default:
          return true;
      }
    });
  }, [sales, salesPeriod]);

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
  const totalSalesAmount = filteredSales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);

  const lowStockProducts = products.filter((p) => (Number(p.quantity) || 0) <= 5);

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Dashboard</h1>

      {/* ---------------- Sales Filter ---------------- */}
      <div className="sales-filter">
        <label>Sales Period:</label>
        <select value={salesPeriod} onChange={(e) => setSalesPeriod(e.target.value)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* ---------------- Stats Row ---------------- */}
      <div className="dashboard-stats-row">
        <div className="dashboard-stat">
          <h3>Total Products</h3>
          <p>{totalProducts}</p>
        </div>
        <div className="dashboard-stat">
          <h3>Total Stock Units</h3>
          <p>{totalStock}</p>
        </div>
        <div className="dashboard-stat">
          <h3>Total Sales (LSL)</h3>
          <p>LSL {totalSalesAmount.toFixed(2)}</p>
        </div>
        <div className="dashboard-stat">
          <div
            className="low-stock-list-container"
            onClick={() => setShowLowStock(!showLowStock)}
          >
            <h3 style={{ cursor: "pointer" }}>Low Stock Alerts</h3>
            <h6 style={{ margin: "0", color: "#ff4d4f", fontWeight: 400 }}>
              {showLowStock ? "click to hide" : "click to view"}
            </h6>
          </div>
          <p>{lowStockProducts.length}</p>

          <ul className={`low-stock-list ${showLowStock ? "show" : ""}`}>
            {lowStockProducts.map((p) => (
              <li key={p.id} className="low-stock-item">
                <span>{p.name}</span>
                <span>{p.quantity} left</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ---------------- Product Grid ---------------- */}
      <div className="dashboard-grid">
        {products.map((p) => {
          const key = p.name.replace(/\s/g, "_").replace("&", "and");
          const imgSrc = imagesMap[key];

          return (
            <div className="product-card" key={p.id}>
              {imgSrc && <img src={imgSrc} alt={p.name} className="product-image" />}
              <h3 className="product-name">{p.name}</h3>
              <p className="product-desc">{p.description}</p>
              <p className={`product-quantity ${p.quantity <= 5 ? "low" : ""}`}>
                {p.quantity} left
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
