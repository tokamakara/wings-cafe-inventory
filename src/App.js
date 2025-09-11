import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";   // ✅ Sidebar removed
import Dashboard from "./components/Dashboard";
import Inventory from "./components/Inventory";
import Sales from "./components/Sales";
import Customers from "./components/Customers";   // ✅ singular
import Reports from "./components/Reports";     // ✅ matches actual file name
import Footer from "./components/Footer"

const LS_KEY = "wings_cafe_db_v1";

// ✅ Default data (pre-seeded products & customers)
const defaultData = {
  products: [
      // Beverages
    { id: "b1", name: "Cappuccino", description: "Espresso with steamed milk and foam", category: "Beverage", price: 35, quantity: 30 },
    { id: "b2", name: "Latte", description: "Espresso with steamed milk", category: "Beverage", price: 40, quantity: 25 },
    { id: "b3", name: "Espresso", description: "Strong black coffee", category: "Beverage", price: 25, quantity: 20 },
    { id: "b4", name: "Americano", description: "Espresso with hot water", category: "Beverage", price: 30, quantity: 20 },
    { id: "b5", name: "Hot Chocolate", description: "Rich chocolate with steamed milk", category: "Beverage", price: 35, quantity: 15 },
    { id: "b6", name: "Green Tea", description: "Refreshing green tea", category: "Beverage", price: 20, quantity: 25 },
  
    // Food
    { id: "f1", name: "Blueberry Muffin", description: "Soft muffin with blueberries", category: "Food", price: 20, quantity: 20 },
    { id: "f2", name: "Croissant", description: "Buttery French pastry", category: "Food", price: 25, quantity: 25 },
    { id: "f3", name: "Ham & Cheese Sandwich", description: "Fresh sandwich with ham, cheese, and veggies", category: "Food", price: 50, quantity: 15 },
    { id: "f4", name: "Chicken Wrap", description: "Grilled chicken with lettuce and sauce", category: "Food", price: 55, quantity: 15 },
    { id: "f5", name: "Caesar Salad", description: "Fresh romaine with Caesar dressing", category: "Food", price: 45, quantity: 10 },
  
    // Desserts
    { id: "d1", name: "Chocolate Cake Slice", description: "Rich chocolate cake slice", category: "Dessert", price: 35, quantity: 10 },
    { id: "d2", name: "Cheesecake Slice", description: "Creamy cheesecake with biscuit base", category: "Dessert", price: 40, quantity: 10 },
    { id: "d3", name: "Ice Cream Scoop", description: "Vanilla or chocolate ice cream", category: "Dessert", price: 15, quantity: 20 },

    // Snacks
    { id: "s1", name: "French Fries", description: "Crispy golden fries", category: "Snack", price: 25, quantity: 20 },
    { id: "s2", name: "Onion Rings", description: "Fried onion rings with dip", category: "Snack", price: 30, quantity: 15 },
    { id: "s3", name: "Mozzarella Sticks", description: "Cheesy fried sticks", category: "Snack", price: 35, quantity: 15 }

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

// ✅ Load data from localStorage or merge with defaults
function loadData() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      localStorage.setItem(LS_KEY, JSON.stringify(defaultData));
      return defaultData;
    }
    const saved = JSON.parse(raw);

    // Merge products
    const mergedProducts = defaultData.products.map(def => {
      const existing = saved.products?.find(p => p.id === def.id);
      return existing ? { ...def, ...existing } : def;
    });
    const userProducts = saved.products?.filter(p => !defaultData.products.find(d => d.id === p.id)) || [];

    // Merge customers
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
    console.error("⚠️ Failed loading data", e);
    localStorage.setItem(LS_KEY, JSON.stringify(defaultData));
    return defaultData;
  }
}

// ✅ Save to localStorage
function saveData(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export default function App() {
  const [module, setModule] = useState("dashboard");
  const [db, setDb] = useState(loadData());

  // Auto-save when db changes
  useEffect(() => {
    saveData(db);
  }, [db]);

  // ---------------- Product Management ----------------
  function addProduct(product) {
    const p = { ...product, id: "p" + Date.now() };
    setDb(prev => ({ ...prev, products: [...prev.products, p] }));
  }
  function updateProduct(id, updates) {
    const products = db.products.map(p => (p.id === id ? { ...p, ...updates } : p));
    setDb({ ...db, products });
  }
  function deleteProduct(id) {
    const products = db.products.filter(p => p.id !== id);
    setDb({ ...db, products });
  }
  function restockProduct(id, quantity, note = "Restock") {
    if (quantity <= 0) return;
    const products = db.products.map(p =>
      p.id === id ? { ...p, quantity: p.quantity + quantity } : p
    );
    setDb({ ...db, products });
  }

  // ---------------- Sales Management ----------------
  function processSale(items, customerId = null) {
    if (!items || items.length === 0) return { success: false, message: "No items" };

    const productsMap = new Map(db.products.map(p => [p.id, p]));
    for (const it of items) {
      const p = productsMap.get(it.productId);
      if (!p) return { success: false, message: `Product ${it.productId} not found` };
      if (it.units <= 0) return { success: false, message: `Invalid units for ${p.name}` };
      if (it.units > p.quantity) return { success: false, message: `Insufficient stock for ${p.name}` };
    }

    // Deduct stock
    const products = db.products.map(p => {
      const item = items.find(i => i.productId === p.id);
      return item ? { ...p, quantity: p.quantity - item.units } : p;
    });

    // Sale record
    const saleItems = items.map(i => {
      const p = productsMap.get(i.productId);
      return { productId: i.productId, name: p.name, units: i.units, price: p.price, lineTotal: p.price * i.units };
    });

    const total = saleItems.reduce((s, it) => s + it.lineTotal, 0);
    const sale = { id: "s" + Date.now(), items: saleItems, total, customerId, date: new Date().toISOString() };
    const sales = [...db.sales, sale];

    // Transactions
    const transactions = [...db.transactions];
    saleItems.forEach(it => {
      transactions.push({
        id: "t" + Date.now() + Math.random(),
        productId: it.productId,
        type: "sell",
        quantity: it.units,
        note: `Sold ${it.units}`,
        date: new Date().toISOString()
      });
    });

    setDb({ ...db, products, sales, transactions });
    return { success: true, sale };
  }

  // ---------------- Customer Management ----------------
  function addCustomer(customer) {
    const c = { ...customer, id: "c" + Date.now() };
    setDb({ ...db, customers: [...db.customers, c] });
  }
  function updateCustomer(id, updates) {
    const customers = db.customers.map(c => (c.id === id ? { ...c, ...updates } : c));
    setDb({ ...db, customers });
  }
  function deleteCustomer(id) {
    setDb({ ...db, customers: db.customers.filter(c => c.id !== id) });
  }

  // ---------------- Reporting ----------------
  function salesByPeriod(period) {
    const now = new Date();
    let filtered = db.sales;
    if (period === "daily") {
      filtered = db.sales.filter(s => new Date(s.date).toDateString() === now.toDateString());
    } else if (period === "weekly") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = db.sales.filter(s => new Date(s.date) >= weekAgo);
    } else if (period === "monthly") {
      filtered = db.sales.filter(s =>
        new Date(s.date).getMonth() === now.getMonth() &&
        new Date(s.date).getFullYear() === now.getFullYear()
      );
    }
    return filtered;
  }

  // ✅ Common props for all modules
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
    updateCustomer,
    deleteCustomer,
    salesByPeriod,
    setModule
  };

  return (
    <div className="app">
      <Navbar currentModule={module} setModule={setModule} />
      <main className="main">
        {module === "dashboard" && <Dashboard {...props} />}
        {module === "inventory" && <Inventory {...props} />}
        {module === "sales" && <Sales {...props} />}
        {module === "customers" && <Customers {...props} />}    
        {module === "reports" && <Reports {...props} />}   {/* ✅ fixed */}
      </main>
      <Footer /> {/* 👈 Footer added here, visible on all modules */}
    </div>
  );
}
