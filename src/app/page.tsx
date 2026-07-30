'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Minus, Check, ArrowRight, ExternalLink, Sparkles, FileText, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';

interface CatalogItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  active: boolean;
}

interface CartState {
  [itemId: string]: number;
}

interface OrderConfirmation {
  id: number;
  customerName: string;
  totalAmount: number;
  items: { name: string; price: number; quantity: number; subtotal: number }[];
  note?: string;
  famPayLink: string;
}

export default function Storefront() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartState>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState<OrderConfirmation | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/items');
      const data = await res.json();
      if (data.success) {
        setItems(data.items.filter((item: CatalogItem) => item.active));
      }
    } catch (err) {
      console.error('Error loading menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      const currentQty = prev[itemId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      const updated = { ...prev };
      if (newQty === 0) {
        delete updated[itemId];
      } else {
        updated[itemId] = newQty;
      }
      return updated;
    });
  };

  // Cart calculations
  const cartItemsList = items
    .filter((item) => cart[item.id] && cart[item.id] > 0)
    .map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: cart[item.id],
      subtotal: item.price * cart[item.id],
    }));

  const totalItemsCount = cartItemsList.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalAmount = cartItemsList.reduce((acc, curr) => acc + curr.subtotal, 0);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMessage('Please enter your name');
      return;
    }
    if (cartItemsList.length === 0) {
      setErrorMessage('Your cart is empty');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          note: note.trim(),
          items: cartItemsList,
          totalAmount,
        }),
      });

      const data = await res.json();

      if (data.success && data.order) {
        const orderData: OrderConfirmation = {
          id: data.order.id,
          customerName: data.order.customerName,
          totalAmount: data.order.totalAmount,
          items: cartItemsList,
          note: note.trim(),
          famPayLink: data.famPayLink,
        };

        // Open FamPay redirect link in new window
        window.open(data.famPayLink, '_blank');

        setOrderConfirmed(orderData);
        setIsCheckoutOpen(false);
        setCart({});
        setCustomerName('');
        setNote('');
      } else {
        setErrorMessage(data.error || 'Failed to place order. Please try again.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setErrorMessage('A network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetOrder = () => {
    setOrderConfirmed(null);
    setCart({});
  };

  return (
    <div className="min-h-screen flex flex-col pb-28">
      {/* Top Header / Branding */}
      <header className="sticky top-0 z-30 glass-nav px-4 py-4 sm:px-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold shadow-[0_0_12px_rgba(20,184,166,0.2)]">
              S
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                ScubaSravan
                <span className="inline-block w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              </h1>
              <p className="text-[11px] font-medium text-gray-400">Assignments & Records Written For You</p>
            </div>
          </div>
          
          <div className="px-2.5 py-1 rounded-full bg-teal-950/60 border border-teal-500/20 text-teal-300 text-xs font-medium flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-teal-400" />
            <span>Fast Turnaround</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-5 pb-6">
        {/* Banner Card */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#1c1c1c] to-[#151515] border border-gray-800 shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 mt-0.5">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-200">Handwritten Work & Diagrams</h2>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Select your assignments, record pages or diagrams below. Add notes during checkout for chapter details!
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation State View */}
        {orderConfirmed ? (
          <div className="animate-fade-in p-6 rounded-2xl bg-[#1a1a1a] border border-teal-500/30 text-center shadow-xl">
            <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-400 mx-auto flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(20,184,166,0.3)]">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-1">Thanks, {orderConfirmed.customerName}!</h2>
            <p className="text-xs text-teal-400 font-semibold mb-4">
              Order #{orderConfirmed.id} Placed Successfully
            </p>

            <div className="p-4 rounded-xl bg-[#121212] border border-gray-800 text-left mb-5 space-y-3">
              <div className="text-xs text-gray-400 border-b border-gray-800 pb-2 flex justify-between">
                <span>Items Ordered</span>
                <span className="font-semibold text-gray-300">Total: ₹{orderConfirmed.totalAmount}</span>
              </div>
              <div className="space-y-1.5">
                {orderConfirmed.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-gray-300">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="text-gray-400">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>
              {orderConfirmed.note && (
                <div className="pt-2 border-t border-gray-800 text-[11px] text-gray-400">
                  <span className="font-semibold text-gray-300">Note:</span> "{orderConfirmed.note}"
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs mb-5 flex items-start gap-2.5 text-left">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Next Step:</strong> Please complete your payment on FamPay. Click below if the payment window didn't open automatically.
              </span>
            </div>

            <div className="space-y-2.5">
              <a
                href={orderConfirmed.famPayLink}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-600 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all active:scale-[0.98]"
              >
                <span>Pay ₹{orderConfirmed.totalAmount} on FamPay</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={resetOrder}
                className="w-full py-2.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Place Another Order</span>
              </button>
            </div>
          </div>
        ) : (
          /* Catalog Items List */
          <div className="space-y-3.5">
            <div className="flex items-center justify-between px-1 mb-1">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Items</h2>
              <span className="text-[11px] text-gray-500">{items.length} items available</span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                <span>Loading available services...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="py-10 text-center bg-[#1a1a1a] rounded-2xl border border-gray-800 text-gray-400 text-xs">
                No active services at the moment. Please check back later.
              </div>
            ) : (
              items.map((item) => {
                const qty = cart[item.id] || 0;
                const isPerUnit = item.name.includes('(per page)') || item.name.includes('(1)') || item.name.includes('Diagram');
                
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl transition-all duration-200 border ${
                      qty > 0
                        ? 'bg-[#1e2624] border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.08)]'
                        : 'bg-[#1a1a1a] border-gray-800/80 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-teal-400">₹{item.price}</span>
                          {isPerUnit && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                              per unit
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Selector (+ / -) */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {qty > 0 ? (
                          <div className="flex items-center bg-[#121212] border border-teal-500/40 rounded-xl p-1 shadow-inner">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center active:scale-95 transition-all"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center font-bold text-sm text-teal-300">
                              {qty}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 rounded-lg bg-teal-500 hover:bg-teal-600 text-black flex items-center justify-center active:scale-95 transition-all"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-3.5 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Sticky Bottom Cart Bar */}
      {!orderConfirmed && totalItemsCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 glass-nav border-t border-teal-500/30 animate-slide-up">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-teal-500 text-black text-[10px] font-black flex items-center justify-center">
                  {totalItemsCount}
                </span>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium">Total Amount</p>
                <p className="text-lg font-black text-white">₹{totalAmount}</p>
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 active:scale-95 text-black font-bold text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(20,184,166,0.35)] transition-all"
            >
              <span>Checkout</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* Checkout Drawer / Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#161616] border border-gray-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                <h3 className="text-base font-bold text-white">Complete Your Order</h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCheckoutSubmit} className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Order Summary Box */}
              <div className="p-3.5 rounded-xl bg-[#101010] border border-gray-800 text-xs space-y-2">
                <span className="font-semibold text-gray-400 block mb-1">Order Summary</span>
                {cartItemsList.map((item) => (
                  <div key={item.id} className="flex justify-between text-gray-300">
                    <span>{item.name} <strong className="text-teal-400">×{item.quantity}</strong></span>
                    <span className="font-medium text-gray-400">₹{item.subtotal}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-800 flex justify-between text-sm font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-teal-400">₹{totalAmount}</span>
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Your Name <span className="text-teal-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0d0d] border border-gray-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white text-sm outline-none transition-all placeholder:text-gray-600"
                />
              </div>

              {/* Note / Instructions */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Instructions / Note <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Chapter name, diagram page number, or special deadlines"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0d0d] border border-gray-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white text-xs outline-none transition-all placeholder:text-gray-600 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-600 active:scale-98 disabled:opacity-50 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Place Order & Pay ₹{totalAmount}</span>
                      <ExternalLink className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-gray-500 text-center mt-2">
                  You will be redirected to FamPay to complete your payment.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
