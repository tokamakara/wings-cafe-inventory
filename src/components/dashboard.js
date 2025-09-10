import React from "react";

export default function Dashboard({ products, sales, customers, transactions }) {
  // Totals
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  const lowStockCount = products.filter(p => p.quantity <= 5).length;

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stats-row">
        <div className="stat">
          <h3>Total Products</h3>
          <p>{totalProducts}</p>
        </div>
        <div className="stat">
          <h3>Total Stock Units</h3>
          <p>{totalStock}</p>
        </div>
        <div className="stat">
          <h3>Total Sales (LSL)</h3>
          <p>{totalSales.toFixed(2)}</p>
        </div>
        <div className="stat">
          <h3>Low Stock Alerts</h3>
          <p>{lowStockCount}</p>
        </div>
      </div>

      <div className="card">
        <h3>Recent Transactions</h3>
        {transactions.length === 0 ? <p className="small">No transactions recorded.</p> :
          <table className="table">
            <thead>
              <tr><th>Type</th><th>Product</th><th>Quantity</th><th>Note</th><th>Date</th></tr>
            </thead>
            <tbody>
              {transactions.slice(-10).reverse().map(tx => {
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
