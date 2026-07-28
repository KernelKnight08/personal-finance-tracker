import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Activity,
  CreditCard,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  LayoutDashboard,
  Settings,
  Bell,
  Search,
  MessageSquare,
  X,
  PiggyBank,
  BarChart3,
  ChevronRight,
  Sparkles,
  PieChart as PieChartIcon,
  Download,
  Filter,
  MoreHorizontal,
  Tags,
  Check,
  Trash2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { parseBankSMS } from './utils/smsParser';

/* ── Initial Mock Data ────────────────────────── */
const seedTransactions = [
  { id: 1, name: 'Croma Retail',    category: 'Shopping',      amount: -15990, date: 'Jul 28, 2026', time: '2:45 PM',  type: 'expense', status: 'Completed' },
  { id: 2, name: 'Client Payment',  category: 'Freelance',     amount: 25000,  date: 'Jul 27, 2026', time: '10:20 AM', type: 'income',  status: 'Completed' },
  { id: 3, name: 'D-Mart',          category: 'Groceries',     amount: -4550,  date: 'Jul 26, 2026', time: '4:30 PM',  type: 'expense', status: 'Completed' },
  { id: 4, name: 'Disney+ Hotstar', category: 'Entertainment', amount: -899,   date: 'Jul 25, 2026', time: '9:00 AM',  type: 'expense', status: 'Completed' },
  { id: 5, name: 'Ola Cabs',        category: 'Transport',     amount: -350,   date: 'Jul 24, 2026', time: '8:15 PM',  type: 'expense', status: 'Completed' },
  { id: 6, name: 'Zomato',          category: 'Food',          amount: -1250,  date: 'Jul 23, 2026', time: '1:15 PM',  type: 'expense', status: 'Completed' },
  { id: 7, name: 'Salary Deposit',  category: 'Salary',        amount: 85000,  date: 'Jul 20, 2026', time: '12:00 PM', type: 'income',  status: 'Completed' },
  { id: 8, name: 'Reliance Fresh',  category: 'Groceries',     amount: -2200,  date: 'Jul 19, 2026', time: '6:30 PM',  type: 'expense', status: 'Completed' },
  { id: 9, name: 'Amazon India',    category: 'Shopping',      amount: -4500,  date: 'Jul 18, 2026', time: '10:00 AM', type: 'expense', status: 'Completed' },
  { id: 10, name: 'Electricity Bill',category: 'Utilities',    amount: -3200,  date: 'Jul 15, 2026', time: '9:00 AM',  type: 'expense', status: 'Pending' },
  { id: 11, name: 'Jio Recharge',   category: 'Utilities',     amount: -749,   date: 'Jul 12, 2026', time: '2:30 PM',  type: 'expense', status: 'Completed' },
  { id: 12, name: 'BookMyShow',     category: 'Entertainment', amount: -1100,  date: 'Jul 10, 2026', time: '8:45 PM',  type: 'expense', status: 'Completed' },
];

const seedBudgets = [
  { id: 1, category: 'Groceries', limit: 10000 },
  { id: 2, category: 'Shopping', limit: 15000 },
  { id: 3, category: 'Entertainment', limit: 3000 },
  { id: 4, category: 'Transport', limit: 4000 },
  { id: 5, category: 'Food', limit: 5000 }
];

const defaultCategories = [
  { name: 'Shopping', color: '#a855f7' },
  { name: 'Groceries', color: '#22c55e' },
  { name: 'Entertainment', color: '#e11d48' },
  { name: 'Transport', color: '#f59e0b' },
  { name: 'Food', color: '#0ea5e9' },
  { name: 'Utilities', color: '#6366f1' },
  { name: 'Salary', color: '#22c55e' },
  { name: 'Freelance', color: '#14b8a6' },
  { name: 'Unknown', color: '#94a3b8' },
  { name: 'Other', color: '#64748b' }
];

const defaultRules = {
  'croma retail': 'Shopping',
  'd-mart': 'Groceries',
  'disney+ hotstar': 'Entertainment',
  'ola cabs': 'Transport',
  'zomato': 'Food',
  'reliance fresh': 'Groceries',
  'amazon india': 'Shopping',
  'electricity bill': 'Utilities',
  'jio recharge': 'Utilities',
  'bookmyshow': 'Entertainment'
};

const PALETTE = ['#a855f7', '#22c55e', '#e11d48', '#f59e0b', '#0ea5e9', '#6366f1', '#14b8a6', '#ec4899', '#8b5cf6', '#ef4444'];

const formatINR = (value) => {
  return value.toLocaleString('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    maximumFractionDigits: 0
  });
};

/* ── Custom Hook for LocalStorage Backend ─────── */
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue];
}

/* ── Custom Tooltip ───────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip" style={{ padding: '0.75rem 1rem' }}>
      <p style={{ fontSize: '0.75rem', color: 'hsl(var(--fg-muted))', marginBottom: '0.5rem' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: '0.8125rem', fontWeight: 600, color: p.color || p.fill }}>
          {p.name}: {formatINR(p.value)}
        </p>
      ))}
    </div>
  );
}

/* ── App ──────────────────────────────────────── */
function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Modals
  const [smsOpen, setSmsOpen]   = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  
  // Inputs
  const [smsText, setSmsText]   = useState('');
  const [smsErr, setSmsErr]     = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(PALETTE[0]);
  const [newBudgetCat, setNewBudgetCat] = useState('');
  const [newBudgetLimit, setNewBudgetLimit] = useState('');

  // "Backend" State via LocalStorage
  const [transactions, setTransactions] = useLocalStorage('fintrack_txs', seedTransactions);
  const [budgets, setBudgets] = useLocalStorage('fintrack_budgets', seedBudgets);
  const [categories, setCategories] = useLocalStorage('fintrack_cats', defaultCategories);
  const [merchantRules, setMerchantRules] = useLocalStorage('fintrack_rules', defaultRules);
  const [balance, setBalance] = useLocalStorage('fintrack_real_balance', 180000);

  useEffect(() => {
    setCategories(prev => {
      if (!prev.find(c => c.name === 'Unknown')) {
        return [...prev, { name: 'Unknown', color: '#94a3b8' }];
      }
      return prev;
    });
  }, [setCategories]);

  // Derived Financial State
  const income = transactions.filter(t => t.type === 'income').reduce((acc, tx) => acc + tx.amount, 0);
  const expense = Math.abs(transactions.filter(t => t.type === 'expense').reduce((acc, tx) => acc + tx.amount, 0));
  const savings = income - expense;

  // Calculate expenses by category
  const expensesByCategory = useMemo(() => {
    const expenseTxs = transactions.filter(t => t.type === 'expense');
    const totals = expenseTxs.reduce((acc, tx) => {
      const cat = tx.category || 'Unknown';
      acc[cat] = (acc[cat] || 0) + Math.abs(tx.amount);
      return acc;
    }, {});
    
    const sorted = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({ name, amount }));
      
    const totalCalc = sorted.reduce((sum, item) => sum + item.amount, 0);
    return { list: sorted, total: totalCalc };
  }, [transactions]);

  // Merge Budgets with actual spend
  const enrichedBudgets = useMemo(() => {
    return budgets.map(b => {
      const spent = expensesByCategory.list.find(cat => cat.name === b.category)?.amount || 0;
      const remaining = b.limit - spent;
      const percent = Math.min((spent / b.limit) * 100, 100);
      return { ...b, spent, remaining, percent };
    }).sort((a, b) => b.percent - a.percent);
  }, [budgets, expensesByCategory]);

  const chartData = useMemo(() => [
    { name: 'Feb', income: 85000, expense: 52000 },
    { name: 'Mar', income: 92000, expense: 41000 },
    { name: 'Apr', income: 85000, expense: 63000 },
    { name: 'May', income: 105000, expense: 48000 },
    { name: 'Jun', income: 85000, expense: 55000 },
    { name: 'Jul', income, expense }
  ], [income, expense]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => 
      tx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transactions, searchQuery]);

  const getCategoryColor = (catName) => {
    const cat = categories.find(c => c.name === catName);
    return cat ? cat.color : '#94a3b8'; // default Unknown color
  };

  /* ── Business Logic ── */
  const handleSmsImport = () => {
    setSmsErr('');
    const result = parseBankSMS(smsText);
    if (!result || result.error) {
      setSmsErr(result?.error || 'Could not parse SMS. Check format.');
      return;
    }

    // Auto-categorize based on memory (merchant rules)
    const merchantKey = (result.merchant || '').toLowerCase();
    const inferredCategory = merchantRules[merchantKey] || (result.type === 'income' ? 'Income' : 'Unknown');
    
    const newTxAmount = result.type === 'expense' ? -result.amount : result.amount;

    // Cross-check and enforce Available Balance from SMS
    if (result.balance !== null && result.balance !== undefined) {
      setBalance(result.balance); // Absolute truth
    } else {
      setBalance(prev => prev + newTxAmount); // Fallback to ledger math
    }

    const newTx = {
      id: Date.now(),
      name: result.merchant || 'Bank Transaction',
      category: inferredCategory,
      amount: newTxAmount,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: 'Just now',
      type: result.type,
      status: 'Completed'
    };

    setTransactions(prev => [newTx, ...prev]);
    setSmsText('');
    setSmsOpen(false);
  };

  const handleCategoryChange = (txId, merchantName, newCategory) => {
    // 1. Update the transaction
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, category: newCategory } : t));
    
    // 2. Train the program (Remember it for next time)
    if (merchantName) {
      setMerchantRules(prev => ({ ...prev, [merchantName.toLowerCase()]: newCategory }));
    }
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    
    // Check if it already exists
    if (!categories.find(c => c.name.toLowerCase() === newCatName.toLowerCase())) {
      setCategories(prev => [...prev, { name: newCatName.trim(), color: newCatColor }]);
    }
    
    setNewCatName('');
    setCatModalOpen(false);
  };

  const handleDeleteCategory = (catName) => {
    if (catName === 'Other' || catName === 'Unknown') return; // Cannot delete fallback categories

    // 1. Remove category from list
    setCategories(prev => prev.filter(c => c.name !== catName));
    
    // 2. Reassign transactions to 'Unknown'
    setTransactions(prev => prev.map(t => t.category === catName ? { ...t, category: 'Unknown' } : t));
    
    // 3. Remove budget if it exists for this category
    setBudgets(prev => prev.filter(b => b.category !== catName));
    
    // 4. Update merchant rules to 'Unknown'
    setMerchantRules(prev => {
      const newRules = { ...prev };
      Object.keys(newRules).forEach(merchant => {
        if (newRules[merchant] === catName) {
          newRules[merchant] = 'Unknown';
        }
      });
      return newRules;
    });
  };

  const handleAddBudget = () => {
    if (!newBudgetCat || !newBudgetLimit) return;
    const limitNum = parseFloat(newBudgetLimit);
    if (isNaN(limitNum) || limitNum <= 0) return;

    setBudgets(prev => {
      const existing = prev.find(b => b.category === newBudgetCat);
      if (existing) {
        return prev.map(b => b.category === newBudgetCat ? { ...b, limit: limitNum } : b);
      }
      return [...prev, { id: Date.now(), category: newBudgetCat, limit: limitNum }];
    });
    
    setBudgetModalOpen(false);
    setNewBudgetCat('');
    setNewBudgetLimit('');
  };

  const handleDeleteBudget = (id) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  /* ── RENDER DASHBOARD ── */
  const renderDashboard = () => (
    <div className="page-content anim-in">
      <div className="stats-row">
        <div className="card anim-delay-1">
          <div className="icon-ring primary"><IndianRupee size={22} /></div>
          <div className="card-title">Total Balance</div>
          <div className="stat-number">{formatINR(balance)}</div>
          <span className="stat-trend up"><TrendingUp size={12} /> +2.5%</span>
        </div>
        <div className="card anim-delay-2">
          <div className="icon-ring emerald"><ArrowUpRight size={22} /></div>
          <div className="card-title">Income</div>
          <div className="stat-number">{formatINR(income)}</div>
          <span className="stat-trend up"><TrendingUp size={12} /> Live</span>
        </div>
        <div className="card anim-delay-3">
          <div className="icon-ring rose"><ArrowDownRight size={22} /></div>
          <div className="card-title">Expenses</div>
          <div className="stat-number">{formatINR(expense)}</div>
          <span className="stat-trend down"><TrendingDown size={12} /> Live</span>
        </div>
        <div className="card anim-delay-4">
          <div className="icon-ring amber"><PiggyBank size={22} /></div>
          <div className="card-title">Savings</div>
          <div className="stat-number">{formatINR(savings)}</div>
          <span className="stat-trend up"><TrendingUp size={12} /> Healthy</span>
        </div>
      </div>

      <div className="dashboard-row anim-delay-5" style={{ gridTemplateColumns: '1fr' }}>
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} className="text-primary" /> Income vs Expenses
            </h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e11d48" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#e11d48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#22c55e" strokeWidth={2.5} fill="url(#gIncome)" />
                <Area type="monotone" dataKey="expense" name="Expense" stroke="#e11d48" strokeWidth={2.5} fill="url(#gExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── RENDER TRANSACTIONS ── */
  const renderTransactions = () => (
    <div className="page-content anim-in">
      <div className="card">
        <div className="card-header" style={{ marginBottom: '1.5rem', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', margin: 0 }}>All Transactions</h3>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="search-box" style={{ display: 'flex' }}>
              <Search size={16} />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '200px' }} />
            </div>
          </div>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th><th>Merchant</th><th>Category (Click to Edit)</th><th>Status</th><th style={{ textAlign: 'right' }}>Amount</th><th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(tx => (
                <tr key={tx.id}>
                  <td><div style={{ fontWeight: 500 }}>{tx.date}</div><div style={{ fontSize: '0.75rem', color: 'hsl(var(--fg-muted))' }}>{tx.time}</div></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className={`tx-avatar ${tx.type}`} style={{ width: 32, height: 32 }}>{tx.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}</div>
                      <span style={{ fontWeight: 500 }}>{tx.name}</span>
                    </div>
                  </td>
                  <td>
                    {/* Inline Category Editor */}
                    <select 
                      className="input-field" 
                      style={{ 
                        padding: '0.25rem 0.5rem', 
                        fontSize: '0.75rem', 
                        width: 'auto',
                        background: 'hsla(var(--surface-raised), 0.5)'
                      }}
                      value={tx.category}
                      onChange={(e) => handleCategoryChange(tx.id, tx.name, e.target.value)}
                    >
                      {categories.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span style={{ color: tx.status === 'Completed' ? 'hsl(var(--emerald))' : 'hsl(var(--amber))', fontWeight: 500, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <span style={{ display: 'block', width: 6, height: 6, borderRadius: '50%', background: tx.status === 'Completed' ? 'hsl(var(--emerald))' : 'hsl(var(--amber))' }} />
                      {tx.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }} className={tx.type === 'income' ? 'text-emerald' : ''}>
                    {tx.type === 'income' ? '+' : ''}{formatINR(tx.amount)}
                  </td>
                  <td style={{ textAlign: 'center' }}><button className="btn-icon" style={{ padding: '0.25rem' }}><MoreHorizontal size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* ── RENDER BUDGETS ── */
  const renderBudgets = () => (
    <div className="page-content anim-in">
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PiggyBank size={20} className="text-primary" /> Budget Management
          </h3>
          <button className="btn btn-primary" onClick={() => {
            setNewBudgetCat(categories.length > 0 ? categories[0].name : '');
            setBudgetModalOpen(true);
          }}>
            <Plus size={16} /> New Budget
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {enrichedBudgets.map(budget => {
            const isOver = budget.percent >= 100;
            const isWarning = budget.percent >= 85 && !isOver;
            const barColor = isOver ? 'hsl(var(--rose))' : isWarning ? 'hsl(var(--amber))' : 'hsl(var(--emerald))';
            
            return (
              <div key={budget.id} className="card" style={{ padding: '1.25rem', background: 'hsla(var(--bg), 0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: getCategoryColor(budget.category) }} />
                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>{budget.category}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="badge" style={{ background: barColor, color: '#fff', border: 'none' }}>
                      {budget.percent.toFixed(0)}% Used
                    </span>
                    <button className="btn-icon" style={{ padding: '0.25rem', color: 'hsl(var(--rose))' }} onClick={() => handleDeleteBudget(budget.id)} title="Remove Budget">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8125rem' }}>
                  <span className="text-muted">Spent: <strong style={{ color: 'hsl(var(--fg))' }}>{formatINR(budget.spent)}</strong></span>
                  <span className="text-muted">Limit: <strong style={{ color: 'hsl(var(--fg))' }}>{formatINR(budget.limit)}</strong></span>
                </div>

                <div className="progress-bg" style={{ height: 8 }}>
                  <div className="progress-bar" style={{ width: `${budget.percent}%`, backgroundColor: barColor }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* ── RENDER CATEGORIES ── */
  const renderCategories = () => (
    <div className="page-content anim-in">
      <div className="card">
        <div className="card-header" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Tags size={20} className="text-primary" /> Expense Categories
          </h3>
          <button className="btn btn-primary" onClick={() => setCatModalOpen(true)}>
            <Plus size={16} /> Add Category
          </button>
        </div>
        
        <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '2rem' }}>
          When you change a transaction's category on the Transactions page, the app automatically learns that merchant and applies the correct category for future SMS imports.
        </p>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Color Tag</th>
                <th style={{ textAlign: 'right' }}>Total Historical Spend</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, idx) => {
                const amount = expensesByCategory.list.find(e => e.name === cat.name)?.amount || 0;
                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{cat.name}</td>
                    <td>
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.25rem 0.625rem', background: 'hsla(var(--border), 0.5)', borderRadius: '9999px', fontSize: '0.75rem'
                      }}>
                        <span style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', background: cat.color }} />
                        {cat.color}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatINR(amount)}</td>
                    <td style={{ textAlign: 'center' }}>
                      {(cat.name !== 'Other' && cat.name !== 'Unknown') && (
                        <button 
                          className="btn-icon" 
                          style={{ padding: '0.25rem', color: 'hsl(var(--rose))' }} 
                          onClick={() => handleDeleteCategory(cat.name)}
                          title="Delete Category"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* ── RENDER ANALYTICS ── */
  const renderAnalytics = () => (
    <div className="page-content anim-in">
      <div className="dashboard-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Monthly Cash Flow</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Expense Distribution</h3>
          </div>
          <div className="chart-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expensesByCategory.list} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={2} dataKey="amount" stroke="none">
                  {expensesByCategory.list.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      {/* ═══ LIVE BACKGROUND ═══ */}
      <div className="live-bg">
        <div className="live-blob blob-1" />
        <div className="live-blob blob-2" />
        <div className="live-blob blob-3" />
      </div>

      {/* ═══ SIDEBAR ═══ */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.jpg" alt="FinTrack" />
          <span className="sidebar-brand-text">FinTrack</span>
        </div>

        <div className="sidebar-nav">
          <span className="nav-group-label">Menu</span>
          <div className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
            <LayoutDashboard size={18} /> Dashboard
          </div>
          <div className={`nav-link ${currentView === 'transactions' ? 'active' : ''}`} onClick={() => setCurrentView('transactions')}>
            <CreditCard size={18} /> Transactions
          </div>
          <div className={`nav-link ${currentView === 'categories' ? 'active' : ''}`} onClick={() => setCurrentView('categories')}>
            <Tags size={18} /> Categories
          </div>
          <div className={`nav-link ${currentView === 'budgets' ? 'active' : ''}`} onClick={() => setCurrentView('budgets')}>
            <PiggyBank size={18} /> Budgets
          </div>
          <div className={`nav-link ${currentView === 'analytics' ? 'active' : ''}`} onClick={() => setCurrentView('analytics')}>
            <BarChart3 size={18} /> Analytics
          </div>
        </div>
      </aside>

      {/* ═══ MAIN ═══ */}
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <div className="hide-mobile" style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="topbar-title" style={{ textTransform: 'capitalize' }}>{currentView}</span>
            </div>
          </div>
          <div className="topbar-right">
            <button className="btn btn-outline hide-mobile" onClick={() => setSmsOpen(true)}>
              <MessageSquare size={14} /> Parse SMS
            </button>
            <button className="btn btn-primary live-glow live-pulse" onClick={() => setSmsOpen(true)}>
              <Plus size={14} /> <span className="hide-mobile">Add</span>
            </button>
          </div>
        </header>

        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'transactions' && renderTransactions()}
        {currentView === 'budgets' && renderBudgets()}
        {currentView === 'categories' && renderCategories()}
        {currentView === 'analytics' && renderAnalytics()}
      </div>

      {/* ═══ SMS MODAL ═══ */}
      {smsOpen && (
        <div className="modal-overlay" onClick={() => setSmsOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={18} className="text-primary" /> Parse Bank SMS
                </h3>
                <button className="modal-close" onClick={() => setSmsOpen(false)}><X size={18} /></button>
              </div>
            </div>
            <div className="modal-body">
              <textarea
                className="textarea-field"
                placeholder="e.g. Debited Rs.500 from A/c XX1234 on 28-07-26 by Zomato"
                value={smsText}
                onChange={e => setSmsText(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setSmsOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSmsImport}><Sparkles size={14} /> Process SMS</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ADD CATEGORY MODAL ═══ */}
      {catModalOpen && (
        <div className="modal-overlay" onClick={() => setCatModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-top">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Create Category</h3>
                <button className="modal-close" onClick={() => setCatModalOpen(false)}><X size={18} /></button>
              </div>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', marginBottom: '0.5rem', color: 'hsl(var(--fg-muted))' }}>Category Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Subscriptions" 
                  value={newCatName} 
                  onChange={e => setNewCatName(e.target.value)} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', marginBottom: '0.5rem', color: 'hsl(var(--fg-muted))' }}>Pick a Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {PALETTE.map(color => (
                    <div 
                      key={color} 
                      onClick={() => setNewCatColor(color)}
                      style={{
                        width: 32, height: 32, borderRadius: '50%', background: color, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: newCatColor === color ? '2px solid white' : '2px solid transparent'
                      }}
                    >
                      {newCatColor === color && <Check size={16} color="white" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setCatModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddCategory}>Save Category</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ADD BUDGET MODAL ═══ */}
      {budgetModalOpen && (
        <div className="modal-overlay" onClick={() => setBudgetModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-top">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Set Budget</h3>
                <button className="modal-close" onClick={() => setBudgetModalOpen(false)}><X size={18} /></button>
              </div>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', marginBottom: '0.5rem', color: 'hsl(var(--fg-muted))' }}>Category</label>
                <select className="input-field" value={newBudgetCat} onChange={e => setNewBudgetCat(e.target.value)}>
                  {categories.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', marginBottom: '0.5rem', color: 'hsl(var(--fg-muted))' }}>Monthly Limit (₹)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="e.g. 5000" 
                  value={newBudgetLimit} 
                  onChange={e => setNewBudgetLimit(e.target.value)} 
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setBudgetModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddBudget}>Save Budget</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
