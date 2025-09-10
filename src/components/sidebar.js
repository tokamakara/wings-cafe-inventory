import React from "react";

export default function Sidebar({ currentModule, setModule }) {
  const items = [
    { id: "dashboard", label: "Dashboard" },
    { id: "inventory", label: "Inventory" },
    { id: "sales", label: "Sales" },
    { id: "customers", label: "Customers" },
    { id: "reports", label: "Reports" },
  ];

  return (
    <aside className="sidebar">
      <h2>Wings Cafe</h2>
      {items.map(it => (
        <button
          key={it.id}
          className={`nav-btn ${it.id === currentModule ? "active" : ""}`}
          onClick={() => setModule(it.id)}
        >
          {it.label}
        </button>
      ))}
      <div style={{ marginTop: 18 }} className="small">Contact: tokamakara4@gmail.com</div>
    </aside>
  );
}
