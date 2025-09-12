import React, { useState, useMemo } from "react";
import "./Reports.css";

export default function Reports({ sales, transactions, products, salesByPeriod }) {
  const [period, setPeriod] = useState("all"); // Default = All Time

  // Filtered sales for the chosen period
  const filteredSales = useMemo(() => {
    if (period === "all") return sales;
    return salesByPeriod(period);
  }, [sales, period, salesByPeriod]);

  const totalSales = filteredSales.reduce((sum, s) => sum + s.total, 0);

  // ---------------- Business Insights ----------------
  const topProducts = useMemo(() => {
    const productCount = {};
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        productCount[item.name] = (productCount[item.name] || 0) + item.units;
      });
    });
    return Object.entries(productCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // top 10
  }, [filteredSales]);

  const recentTransactions = useMemo(() => {
    return transactions
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [transactions]);

  const lowStock = useMemo(() => products.filter(p => p.quantity <= 5), [products]);

  // ---------------- Sales by Category ----------------
  const salesByCategory = useMemo(() => {
    const categoryRevenue = {};
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          categoryRevenue[product.category] = (categoryRevenue[product.category] || 0) + item.lineTotal;
        }
      });
    });
    return Object.entries(categoryRevenue)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // highest first
  }, [filteredSales, products]);

  return (
    <div>
      <h1>Business Reports</h1>

      {/* Filters */}
      <div className="filters">
        <label>Sales Period:</label>
        <select value={period} onChange={e => setPeriod(e.target.value)}>
          <option value="all">All Time</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {/* Sales Summary */}
      <div className="card sales-summary">
        <h3>Sales Summary</h3>
        <div className="sales-summary-grid">
          <div className="total-sales-col">
            <span>Total Sales:</span>
            <strong>LSL {totalSales.toFixed(2)}</strong>
          </div>
          <div className="top-products-col">
            <h4>Top Selling Products</h4>
            {topProducts.length === 0 ? (
              <p>No sales yet</p>
            ) : (
              <ul>
                {topProducts.map(([name, units]) => (
                  <li key={name}>
                    <span className="product-name">{name}</span>
                    <span className="units-sold">— {units} units sold</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Sales by Category */}
      <div className="card">
        <h3>Sales by Category</h3>
        {salesByCategory.length === 0 ? (
          <p>No sales for this period.</p>
        ) : (
          <ul>
            {salesByCategory.map(cat => (
              <li key={cat.name}>
                <span>{cat.name}</span>
                <span>LSL {cat.value.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h3>Recent Transactions</h3>
        {recentTransactions.length === 0 ? (
          <p>No recent transactions.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Note</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map(tx => {
                const product = products.find(p => p.id === tx.productId);
                return (
                  <tr key={tx.id}>
                    <td>{tx.type}</td>
                    <td>{product?.name || tx.productId}</td>
                    <td>{tx.quantity}</td>
                    <td>{tx.note}</td>
                    <td>{new Date(tx.date).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Low Stock Alert */}
      <div className="card low-stock">
        <h3>Low Stock Products</h3>
        {lowStock.length === 0 ? (
          <p>All products have sufficient stock.</p>
        ) : (
          <ul>
            {lowStock.map(p => (
              <li key={p.id}>{p.name} — {p.quantity} left</li>
            ))}
          </ul>
        )}
      </div>

      {/* Detailed Sales Table */}
      <div className="card">
        <h3>Detailed Sales</h3>
        {filteredSales.length === 0 ? (
          <p>No sales for this period.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total (LSL)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map(s => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.customerId || "Walk-in"}</td>
                  <td>
                    <ul>
                      {s.items.map(i => <li key={i.productId}>{i.units} × {i.name}</li>)}
                    </ul>
                  </td>
                  <td>{s.total.toFixed(2)}</td>
                  <td>{new Date(s.date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
