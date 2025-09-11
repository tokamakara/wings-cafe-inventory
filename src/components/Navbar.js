import React, { useState } from "react";
import "./Navbar.css";

export default function Navbar({ currentModule, setModule }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const items = [
    { id: "dashboard", label: "Dashboard" },
    { id: "inventory", label: "Inventory" },
    { id: "sales", label: "Sales" },
    { id: "customers", label: "Customers" },
    { id: "reports", label: "Reports" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <h2>Wings Cafe</h2>
          <button 
            className="menu-toggle"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        
        <div className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
          {items.map(it => (
            <button
              key={it.id}
              className={`nav-btn ${it.id === currentModule ? "active" : ""}`}
              onClick={() => {
                setModule(it.id);
                setIsMenuOpen(false);
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
        
        <div className="nav-contact small">
          Contact:<br />
          tokamakara4@gmail.com
        </div>
      </div>
    </nav>
  );
}
