import React, { useState } from "react";

export default function Reports({ sales, transactions, products, salesByPeriod }) {
  const [period, setPeriod] = useState("daily");

  const filteredSales = salesByPeriod(period);

  const totalSales = filteredSales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div>
      <h1>Reports</h1>

      <div className="card">
        <div className="filters">
          <label>Sales Period:</label>
          <select value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <h3>Sales Report</h3>
        {filteredSales.length === 0 ? <p className="small">No sales recorded for this period.</p> :
          <table className="table">
            <thead>
              <tr>
                <th>ID</th><th>Customer</th><th>Items</th><th>Total (LSL)</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map(s => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.customerId || "Walk-in"}</td>
                  <td>
                    <ul>
                      {s.items.map(i => (
                        <li key={i.productId}>{i.units} × {i.name}</li>
                      ))}
                    </ul>
                  </td>
                  <td>{s.total.toFixed(2)}</td>
                  <td>{new Date(s.date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
        <p><strong>Total Sales for period: LSL {totalSales.toFixed(2)}</strong></p>
      </div>

      <div className="card">
        <h3>All Transactions</h3>
        {transactions.length === 0 ? <p className="small">No transactions recorded.</p> :
          <table className="table">
            <thead>
              <tr><th>Type</th><th>Product</th><th>Quantity</th><th>Note</th><th>Date</th></tr>
            </thead>
            <tbody>
              {transactions.slice().reverse().map(tx => {
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
        }
      </div>
    </div>
  );
}
