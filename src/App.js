import React, { useEffect, useState } from "react";
import Sidebar from "./components/sidebar";
import Dashboard from "./components/dashboard";
import Inventory from "./components/inventory";
import Sales from "./components/sales";
import Customers from "./components/customers";
import Reports from "./components/reports";

const LS_KEY = "wings_cafe_db_v1";

// Default data
const defaultData = {
  products: [
    { id: "p1", name: "Cappuccino", description: "Creamy espresso + milk foam", category: "Beverage", price: 35, quantity: 20 },
    { id: "p2", name: "Blueberry Muffin", description: "Freshly baked", category: "Bakery", price: 20, quantity: 15 },
    { id: "p3", name: "Espresso", description: "Strong black coffee", category: "Beverage", price: 25, quantity: 10 },
  ],
  customers: [
    { id: "c1", name: "Thabo Mokoena", email: "mthabo@gmail.com", phone: "58000001" },
    { id: "c2", name: "Lerato Nthabeleng", email: "leratontha@gmail.com", phone: "58000002" },
    { id: "c3", name: "Mpho Tšepang", email: "mpho563@gamil.com", phone: "58000003" },
    { id: "c4", name: "Neo Kamohelo", email: "neokamohelo@gmail.com", phone: "58000004" },
  ],
  sales: [],
  transactions: []
};

// Load data from localStorage or merge with default
function loadData() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      localStorage.setItem(LS_KEY, JSON.stringify(defaultData));
      return defaultData;
    }
    const saved = JSON.parse(raw);

    const mergedProducts = defaultData.products.map(def => {
      const existing = saved.products?.find(p => p.id === def.id);
      return existing ? { ...def, ...existing } : def;
    });
    const userProducts = saved.products?.filter(p => !defaultData.products.find(d => d.id === p.id)) || [];

    const mergedCustomers = defaultData.customers.map(def => {
      const existing = saved.customers?.find(c => c.id === def.id);
      return existing ? { ...def, ...existing } : def;
    });
    const userCustomers = saved.customers?.filter(c => !defaultData.customers.find(d => d.id === c.id)) || [];

    const mergedData = {
      products: [...mergedProducts, ...userProducts],
      customers: [...mergedCustomers, ...userCustomers],
      sales: saved.sales || [],
      transactions: saved.transactions || []
    };
    localStorage.setItem(LS_KEY, JSON.stringify(mergedData));
    return mergedData;
  } catch (e) {
    console.error("Failed loading data", e);
    localStorage.setItem(LS_KEY, JSON.stringify(defaultData));
    return defaultData;
  }
}

function saveData(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export default function App() {
  const [module, setModule] = useState("dashboard");
  const [db, setDb] = useState(loadData());

  useEffect(() => {
    saveData(db);
  }, [db]);

  // Product management
  function addProduct(product) {
    const p = { ...product, id: "p" + Date.now() };
    setDb(prev => ({ ...prev, products: [...prev.products, p] }));
  }
  function updateProduct(id, updates) {
    const products = db.products.map(p => p.id === id ? { ...p, ...updates } : p);
    setDb({ ...db, products });
  }
  function deleteProduct(id) {
    const products = db.products.filter(p => p.id !== id);
    setDb({ ...db, products });
  }
  function restockProduct(id, quantity, note = "Restock") {
    if (quantity <= 0) return;
    const products = db.products.map(p => p.id === id ? { ...p, quantity: p.quantity + quantity } : p);
    setDb({ ...db, products });
  }

  // Sales
  function processSale(items, customerId = null) {
    if (!items || items.length === 0) return { success: false, message: "No items" };
    const productsMap = new Map(db.products.map(p => [p.id, p]));
    for (const it of items) {
      const p = productsMap.get(it.productId);
      if (!p) return { success: false, message: `Product ${it.productId} not found` };
      if (it.units <= 0) return { success: false, message: `Invalid units for ${p.name}` };
      if (it.units > p.quantity) return { success: false, message: `Insufficient stock for ${p.name}` };
    }
    const products = db.products.map(p => {
      const item = items.find(i => i.productId === p.id);
      if (item) return { ...p, quantity: p.quantity - item.units };
      return p;
    });

    const saleItems = items.map(i => {
      const p = productsMap.get(i.productId);
      return { productId: i.productId, name: p.name, units: i.units, price: p.price, lineTotal: p.price * i.units };
    });

    const total = saleItems.reduce((s, it) => s + it.lineTotal, 0);
    const sale = { id: "s" + Date.now(), items: saleItems, total, customerId, date: new Date().toISOString() };
    const sales = [...db.sales, sale];

    const transactions = [...db.transactions];
    saleItems.forEach(it => {
      transactions.push({ id: "t" + Date.now() + Math.random(), productId: it.productId, type: "sell", quantity: it.units, note: `Sold ${it.units}`, date: new Date().toISOString() });
    });

    setDb({ ...db, products, sales, transactions });
    return { success: true, sale };
  }

  // Customer management
  function addCustomer(customer) {
    const c = { ...customer, id: "c" + Date.now() };
    setDb({ ...db, customers: [...db.customers, c] });
  }
  function updateCustomer(id, updates) {
    const customers = db.customers.map(c => c.id === id ? { ...c, ...updates } : c);
    setDb({ ...db, customers });
  }
  function deleteCustomer(id) {
    setDb({ ...db, customers: db.customers.filter(c => c.id !== id) });
  }

  // Reporting
  function salesByPeriod(period) {
    const now = new Date();
    let filtered = db.sales;
    if (period === "daily") filtered = db.sales.filter(s => new Date(s.date).toDateString() === now.toDateString());
    else if (period === "weekly") {
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = db.sales.filter(s => new Date(s.date) >= weekAgo);
    } else if (period === "monthly") {
      filtered = db.sales.filter(s => new Date(s.date).getMonth() === now.getMonth() && new Date(s.date).getFullYear() === now.getFullYear());
    }
    return filtered;
  }

  const props = {
    products: db.products,
    customers: db.customers,
    sales: db.sales,
    transactions: db.transactions,
    addProduct,
    updateProduct,
    deleteProduct,
    restockProduct,
    processSale,
    addCustomer,
    updateCustomer, // ✅ pass this
    deleteCustomer,
    salesByPeriod,
    setModule
  };

  return (
    <div className="app">
      <Sidebar currentModule={module} setModule={setModule} />
      <main className="main">
        {module === "dashboard" && <Dashboard {...props} />}
        {module === "inventory" && <Inventory {...props} />}
        {module === "sales" && <Sales {...props} />}
        {module === "customers" && <Customers {...props} />}
        {module === "reports" && <Reports {...props} />}
      </main>
    </div>
  );
}
