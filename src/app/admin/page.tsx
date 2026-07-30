'use client';

import { useState, useEffect } from 'react';
import { Lock, LogOut, Package, ShoppingBag, CheckCircle, Clock, AlertCircle, Plus, Edit2, ToggleLeft, ToggleRight, Filter, Search, IndianRupee, RefreshCw } from 'lucide-react';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: number;
  customerName: string;
  note?: string;
  totalAmount: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  itemsJson: string;
  createdAt: string;
}

interface Item {
  id: string;
  name: string;
  price: number;
  active: boolean;
  sortOrder: number;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');
  
  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  
  // Orders filter
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Item Modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemNameInput, setItemNameInput] = useState('');
  const [itemPriceInput, setItemPriceInput] = useState('');

  useEffect(() => {
    const savedAuth = localStorage.getItem('scubasravan_admin_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      fetchDashboardData();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();

      if (data.success) {
        setIsAuthenticated(true);
        localStorage.setItem('scubasravan_admin_auth', 'true');
        fetchDashboardData();
      } else {
        setLoginError(data.error || 'Invalid password');
      }
    } catch (err) {
      setLoginError('Login request failed');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('scubasravan_admin_auth');
    setPasswordInput('');
  };

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      const [ordersRes, itemsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/items'),
      ]);
      const ordersData = await ordersRes.json();
      const itemsData = await itemsRes.json();

      if (ordersData.success) setOrders(ordersData.orders);
      if (itemsData.success) setItems(itemsData.items);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleToggleItemActive = async (item: Item) => {
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleActive', id: item.id }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, active: data.item.active } : i))
        );
      }
    } catch (err) {
      console.error('Failed to toggle item state:', err);
    }
  };

  const openSaveItemModal = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setItemNameInput(item.name);
      setItemPriceInput(item.price.toString());
    } else {
      setEditingItem(null);
      setItemNameInput('');
      setItemPriceInput('');
    }
    setIsItemModalOpen(true);
  };

  const handleSaveItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemNameInput.trim() || !itemPriceInput) return;

    try {
      const payload = editingItem
        ? { action: 'update', id: editingItem.id, name: itemNameInput.trim(), price: parseFloat(itemPriceInput) }
        : { action: 'create', name: itemNameInput.trim(), price: parseFloat(itemPriceInput) };

      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        fetchDashboardData();
        setIsItemModalOpen(false);
      }
    } catch (err) {
      console.error('Error saving item:', err);
    }
  };

  // Password Protection Login View
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0d0d0d]">
        <div className="w-full max-w-sm p-6 rounded-3xl bg-[#161616] border border-gray-800 shadow-2xl animate-fade-in">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 mx-auto flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-extrabold text-white">ScubaSravan Admin</h1>
            <p className="text-xs text-gray-400 mt-1">Enter password to access dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs text-center">
                {loginError}
              </div>
            )}

            <div>
              <input
                type="password"
                required
                placeholder="Admin Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#0d0d0d] border border-gray-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white text-sm outline-none transition-all placeholder:text-gray-600 text-center tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-600 active:scale-98 text-black font-bold text-sm shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all flex items-center justify-center gap-2"
            >
              {loggingIn ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                'Unlock Dashboard'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  // Analytics Metrics
  const totalRevenue = orders
    .filter((o) => o.status === 'paid' || o.status === 'completed')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const paidCount = orders.filter((o) => o.status === 'paid').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0d0d]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 glass-nav px-4 py-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold shadow-[0_0_12px_rgba(20,184,166,0.2)]">
              S
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                ScubaSravan Admin
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/30">
                  Dashboard
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="p-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 text-xs flex items-center gap-1.5 transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-red-950/60 hover:border-red-500/30 text-gray-300 hover:text-red-300 border border-transparent text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-[#161616] border border-gray-800">
            <div className="text-gray-400 text-xs font-medium flex items-center justify-between mb-1">
              <span>Total Orders</span>
              <ShoppingBag className="w-4 h-4 text-gray-500" />
            </div>
            <p className="text-xl font-black text-white">{orders.length}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#161616] border border-amber-500/20">
            <div className="text-amber-400/80 text-xs font-medium flex items-center justify-between mb-1">
              <span>Pending Payment</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-black text-amber-300">{pendingCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#161616] border border-teal-500/20">
            <div className="text-teal-400/80 text-xs font-medium flex items-center justify-between mb-1">
              <span>Paid Orders</span>
              <CheckCircle className="w-4 h-4 text-teal-400" />
            </div>
            <p className="text-xl font-black text-teal-300">{paidCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#161616] border border-emerald-500/20">
            <div className="text-emerald-400/80 text-xs font-medium flex items-center justify-between mb-1">
              <span>Total Revenue</span>
              <IndianRupee className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-black text-emerald-300">₹{totalRevenue}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-3">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-teal-500 text-black shadow-[0_0_15px_rgba(20,184,166,0.25)]'
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'bg-teal-500 text-black shadow-[0_0_15px_rgba(20,184,166,0.25)]'
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Inventory ({items.length})</span>
          </button>
        </div>

        {/* Orders Tab Content */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#161616] p-3 rounded-2xl border border-gray-800">
              {/* Status Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {['all', 'pending', 'paid', 'completed', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize shrink-0 transition-all ${
                      statusFilter === st
                        ? 'bg-gray-800 text-teal-300 border border-teal-500/40'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer or #ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-48 pl-8 pr-3 py-1.5 rounded-xl bg-[#0d0d0d] border border-gray-800 text-xs text-white outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center bg-[#161616] rounded-2xl border border-gray-800 text-gray-500 text-xs">
                No orders match the selected criteria.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  let itemsList: OrderItem[] = [];
                  try {
                    itemsList = JSON.parse(order.itemsJson);
                  } catch (e) {
                    itemsList = [];
                  }

                  const formattedDate = new Date(order.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  });

                  return (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl bg-[#161616] border border-gray-800/90 hover:border-gray-700 transition-all space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-500/30">
                            #{order.id}
                          </span>
                          <h3 className="text-sm font-bold text-white">{order.customerName}</h3>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-gray-500">{formattedDate}</span>
                          {/* Status Dropdown */}
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-xl outline-none border transition-all cursor-pointer ${
                              order.status === 'pending'
                                ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                                : order.status === 'paid'
                                ? 'bg-teal-950/60 text-teal-300 border-teal-500/40'
                                : order.status === 'completed'
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                                : 'bg-red-950/60 text-red-300 border-red-500/40'
                            }`}
                          >
                            <option value="pending">⏳ Pending</option>
                            <option value="paid">💳 Paid</option>
                            <option value="completed">✅ Completed</option>
                            <option value="cancelled">❌ Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Items & Total */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="sm:col-span-2 space-y-1 bg-[#101010] p-3 rounded-xl border border-gray-800/60">
                          <span className="text-[11px] text-gray-500 font-semibold uppercase block mb-1">
                            Ordered Items
                          </span>
                          {itemsList.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-gray-300">
                              <span>
                                {item.name} <strong className="text-teal-400">×{item.quantity}</strong>
                              </span>
                              <span className="text-gray-400">₹{item.subtotal}</span>
                            </div>
                          ))}
                        </div>

                        <div className="bg-[#101010] p-3 rounded-xl border border-gray-800/60 flex flex-col justify-between">
                          <div>
                            <span className="text-[11px] text-gray-500 font-semibold uppercase block mb-1">
                              Note / Instructions
                            </span>
                            <p className="text-gray-300 italic text-[11px]">
                              {order.note ? `"${order.note}"` : 'No instructions provided'}
                            </p>
                          </div>
                          <div className="pt-2 border-t border-gray-800 mt-2 flex justify-between items-center font-bold text-sm text-white">
                            <span>Total</span>
                            <span className="text-teal-400">₹{order.totalAmount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Inventory Tab Content */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Manage Services & Pricing
              </h2>
              <button
                onClick={() => openSaveItemModal()}
                className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(20,184,166,0.2)] transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add New Item</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    item.active
                      ? 'bg-[#161616] border-gray-800'
                      : 'bg-[#121212] border-gray-900 opacity-60'
                  }`}
                >
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.name}</h3>
                    <p className="text-sm font-semibold text-teal-400 mt-0.5">₹{item.price}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleItemActive(item)}
                      className={`p-2 rounded-xl border transition-all ${
                        item.active
                          ? 'bg-teal-950/60 text-teal-300 border-teal-500/40'
                          : 'bg-gray-900 text-gray-500 border-gray-800'
                      }`}
                      title={item.active ? 'Disable Item' : 'Enable Item'}
                    >
                      {item.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={() => openSaveItemModal(item)}
                      className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-all"
                      title="Edit Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#161616] border border-gray-800 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white">
                {editingItem ? 'Edit Service Item' : 'Add New Service Item'}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItemSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chemistry Lab Record"
                  value={itemNameInput}
                  onChange={(e) => setItemNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0d0d] border border-gray-800 focus:border-teal-500 text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Price in ₹
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 50"
                  value={itemPriceInput}
                  onChange={(e) => setItemPriceInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0d0d] border border-gray-800 focus:border-teal-500 text-white text-xs outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-black text-xs font-bold shadow-[0_0_12px_rgba(20,184,166,0.3)]"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
