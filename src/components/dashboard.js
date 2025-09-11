import React from "react";
import "./Dashboard.css";

export default function Dashboard({
  products = [],
  sales = [],
  customers = [],
  transactions = []
}) {
  // Totals (robust against missing/invalid numbers)
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
  const totalSales = sales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
  const lowStockCount = products.filter(p => (Number(p.quantity) || 0) <= 5).length;

  const recentTx = (transactions || []).slice(-10).reverse();

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="dashboard-stats-row stats-row">
        <div className="dashboard-stat stat">
          <h3>Total Products</h3>
          <p>{totalProducts.toLocaleString()}</p>
        </div>

        <div className="dashboard-stat stat">
          <h3>Total Stock Units</h3>
          <p>{totalStock.toLocaleString()}</p>
        </div>

        <div className="dashboard-stat stat">
          <h3>Total Sales (LSL)</h3>
          <p>LSL {totalSales.toFixed(2)}</p>
        </div>

        <div className="dashboard-stat stat">
          <h3>Low Stock Alerts</h3>
          <p>{lowStockCount}</p>
        </div>
      </div>

      <div className="card transactions-card">
        <h3>Recent Transactions</h3>

        {recentTx.length === 0 ? (
          <p className="small">No transactions recorded.</p>
        ) : (
          <div className="table-wrap">
            <table className="table" aria-label="Recent transactions">
              <caption className="sr-only">Recent transactions</caption>
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
                {recentTx.map(tx => {
                  const product = products.find(p => p.id === tx.productId);
                  return (
                    <tr key={tx.id} className={ (product && (product.quantity <= 5)) ? "low-stock-row" : "" }>
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
          </div>
        )}
      </div>
    </div>
  );
}
