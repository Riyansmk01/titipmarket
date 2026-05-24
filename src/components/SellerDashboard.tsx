import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Order, Store } from '../types';
import { apiUrl } from '../api';
import { LayoutDashboard, ShoppingBag, PlusCircle, Sparkles, TrendingUp, DollarSign, Package, AlertTriangle, Trash2, Bot, CheckCircle, ArrowUpRight, Megaphone, Loader2 } from 'lucide-react';

interface SellerDashboardProps {
  products: Product[];
  orders: Order[];
  onRefreshData: () => void;
}

export default function SellerDashboard({ products, orders, onRefreshData }: SellerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders' | 'campaign'>('stats');
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // New product form states
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('10');
  const [newCategory, setNewCategory] = useState('tech');
  const [newDesc, setNewDesc] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [aiBulletPoints, setAiBulletPoints] = useState<string[]>([]);
  const [glowingColor, setGlowingColor] = useState('rgba(255, 122, 0, 0.4)');
  const [custom3D, setCustom3D] = useState({ rotateX: 10, rotateY: -10, translateZ: 15, scale: 1.04 });

  // Store campaign voucher states
  const [vouchers, setVouchers] = useState([
    { code: "CYBER2026", discount: "IDR 50.000", minSpend: "Rp 500.000", type: "Store Wide" },
    { code: "AURAGLOW", discount: "10% OFF", minSpend: "Rp 2.000.000", type: "Tech Armor Exclusive" }
  ]);
  const [newVoucherCode, setNewVoucherCode] = useState('');
  const [newVoucherDiscount, setNewVoucherDiscount] = useState('');

  // Auto-calculate merchant stats
  const merchantOrders = orders.filter(o => o.payment?.status === "PAID");
  const liveMerchantRevenue = merchantOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const commissionDeducted = Math.round(liveMerchantRevenue * 0.05);
  const netEarnings = liveMerchantRevenue - commissionDeducted;

  // AI-powered product copywriting handler
  const handleAICopywriting = async () => {
    if (!newTitle.trim()) {
      alert("Please specify a product name first before asking Gemini AI for copywriting!");
      return;
    }
    setAiGenerating(true);
    try {
      const res = await fetch(apiUrl('/api/ai?action=describe'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: newTitle,
          categoryName: newCategory
        })
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setNewTitle(data.title || newTitle);
      setNewDesc(data.description || '');
      setAiBulletPoints(data.bulletPoints || []);
      
      if (data.threeDMeta) {
        setGlowingColor(data.threeDMeta.glowColor);
        setCustom3D(data.threeDMeta);
      }
    } catch (err) {
      console.error("AI copywriting simulation error:", err);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;

    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/marketplace?action=products'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          price: Number(newPrice),
          stock: Number(newStock),
          categoryId: newCategory,
          images: imageUrl ? [imageUrl] : ["https://images.unsplash.com/photo-1542751371-adc38448a05e.jpg"],
          sellerId: 'neon-labs', // Seed store identity
          threeDMeta: {
            ...custom3D,
            glowColor: glowingColor
          }
        })
      });

      if (res.ok) {
        // Reset states
        setNewTitle('');
        setNewPrice('');
        setNewStock('10');
        setNewDesc('');
        setImageUrl('');
        setAiBulletPoints([]);
        onRefreshData();
        setActiveTab('products');
      }
    } catch (err) {
      console.error('Failed to create dynamic product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!confirm("Are you sure you want to retire this product from the live 3D showcase?")) return;
    try {
      const res = await fetch(apiUrl(`/api/marketplace?action=products&id=${prodId}`), {
        method: 'DELETE'
      });
      if (res.ok) {
        onRefreshData();
      }
    } catch (err) {
      console.error('Delete product error:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'processing' : currentStatus === 'processing' ? 'shipped' : 'completed';
    try {
      const res = await fetch(apiUrl(`/api/marketplace?action=order-status`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: nextStatus })
      });
      if (res.ok) {
        onRefreshData();
      }
    } catch (err) {
      console.error('Error changing order status:', err);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100/90 overflow-hidden">
      {/* Tab Navigation header */}
      <div className="bg-slate-900 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-500 rounded-xl text-white">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display">Neon Labs 3D Merchant Portal</h2>
            <p className="text-[11px] text-slate-400 font-mono tracking-wider">ROUTING SYSTEM STABLE • LIVE SYNC ACTIVE</p>
          </div>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'stats' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Insights & Charts
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'products' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            My Showcase
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
              activeTab === 'orders' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Orders
            {orders.filter(o => o.status === 'pending' || o.status === 'processing').length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('campaign')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'campaign' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Vouchers
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-bold font-display text-slate-800">Financial Performance Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Metric 1 */}
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-orange-500/10">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <DollarSign className="w-16 h-16" />
                  </div>
                  <p className="text-xs uppercase font-mono tracking-wider text-orange-100">Store GMV Sales</p>
                  <p className="text-3xl font-bold font-display mt-2 mb-1">
                    Rp {liveMerchantRevenue.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[11px] text-orange-50/80 font-mono">5% Commission: Rp {commissionDeducted.toLocaleString("id-ID")}</p>
                </div>

                {/* Metric 2 */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-lg">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TrendingUp className="w-16 h-16 text-blue-500" />
                  </div>
                  <p className="text-xs uppercase font-mono tracking-wider text-slate-400">Net Merchant Earnings</p>
                  <p className="text-3xl font-bold font-display mt-2 mb-1 text-orange-400">
                    Rp {netEarnings.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[11px] text-slate-300 font-mono">Disbursed automatically post-webhook</p>
                </div>

                {/* Metric 3 */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs uppercase font-mono tracking-wider text-slate-400">Active Stock SKU Count</p>
                      <p className="text-4xl font-bold font-display mt-2 text-slate-900">
                        {products.length} Items
                      </p>
                    </div>
                    <span className="p-2.5 bg-indigo-50 text-indigo-500 rounded-xl border border-indigo-150">
                      <Package className="w-5 h-5" />
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-3 flex items-center gap-1.5">
                    <CheckCircle className="text-green-500 w-4 h-4" /> Cyber Verification status: 
                    <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full uppercase text-[9px]">Genuinely Approved</span>
                  </div>
                </div>
              </div>

              {/* Advanced Interactive charts using styled components */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide font-mono mb-4">Live Product Demand (VIEWS vs SALES)</h4>
                  <div className="space-y-3">
                    {products.slice(0, 4).map((p) => {
                      const totalActions = p.views + p.sales;
                      const salesPercent = totalActions > 0 ? (p.sales / totalActions) * 100 : 0;
                      return (
                        <div key={p.id} className="text-xs space-y-1 bg-white p-3 rounded-xl border border-slate-100">
                          <div className="flex justify-between font-semibold">
                            <span className="text-slate-700 truncate max-w-[200px]">{p.title}</span>
                            <span className="text-slate-400 font-mono">Views: {p.views}</span>
                          </div>
                          {/* Rich progress layouts */}
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                            <div className="bg-orange-500 h-full" style={{ width: `${Math.min(100, (p.views / 1500) * 100)}%` }} />
                            <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, (p.sales / 30) * 100)}%` }} />
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-0.5">
                            <span>Impression Reach</span>
                            <span className="text-emerald-600 font-bold">{p.sales} Ordered</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-2xl p-6">
                  <h4 className="text-sm font-bold uppercase tracking-wide font-mono mb-4 text-slate-350">Transaction Stream & Webhooks Log</h4>
                  <div className="space-y-2.5 overflow-y-auto max-h-[220px]">
                    {orders.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No transactions processed this lifecycle yet.</p>
                    ) : (
                      orders.map((o) => (
                        <div key={o.id} className="p-3 bg-slate-850 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-slate-200">{o.buyerName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{o.payment?.invoiceId || o.id} • {o.courier}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-orange-400 font-mono">Rp {o.totalPrice.toLocaleString("id-ID")}</p>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              o.payment?.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {o.payment?.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold font-display text-slate-800">Dynamic 3D Showcase SKUs</h3>
                <span className="text-xs text-slate-400 font-mono">To write rich copies, use the AI Assist inside addition form</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Creation form (Col 1) */}
                <div className="lg:col-span-1 bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-indigo-50">
                    <PlusCircle className="w-4.5 h-4.5 text-orange-500" />
                    <h4 className="text-sm font-bold font-sans text-slate-800">Add Innovative Merchant Item</h4>
                  </div>

                  <form onSubmit={handleCreateProductSubmit} className="space-y-3.5 flex flex-col">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[11px] font-bold font-mono text-slate-500 uppercase">Product Name</label>
                        <button
                          type="button"
                          onClick={handleAICopywriting}
                          disabled={aiGenerating}
                          className="text-[10px] flex items-center gap-1 font-bold text-orange-600 hover:text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full transition-colors"
                        >
                          {aiGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 animate-pulse" />}
                          AI Describe with Gemini
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Orbit Mesh Shield"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold font-mono text-slate-400 uppercase mb-1">Price (IDR)</label>
                        <input
                          type="number"
                          required
                          placeholder="Rp 1500000"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold font-mono text-slate-400 uppercase mb-1">Stock Items</label>
                        <input
                          type="number"
                          required
                          value={newStock}
                          onChange={(e) => setNewStock(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold font-mono text-slate-400 uppercase mb-1">Category Domain</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs"
                      >
                        <option value="tech">Tech Armor & Gear</option>
                        <option value="wear">Cyber Apparel</option>
                        <option value="holo">Holograms & Optics</option>
                        <option value="smart">Smart Living Modules</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold font-mono text-slate-400 uppercase mb-1">Image URL</label>
                      <input
                        type="text"
                        placeholder="Leave blank for generic fallback"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold font-mono text-slate-400 uppercase mb-1">Description</label>
                      <textarea
                        rows={3}
                        placeholder="Enter features..."
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs resize-none"
                      />
                    </div>

                    {/* AI bullet points render */}
                    {aiBulletPoints.length > 0 && (
                      <div className="p-3 bg-indigo-50/75 border border-indigo-100 rounded-xl space-y-1">
                        <p className="text-[10px] font-bold font-mono text-indigo-700 uppercase flex items-center gap-1">
                          <Bot className="w-3.5 h-3.5" /> AI Generated Key Points
                        </p>
                        <ul className="text-[10px] text-slate-600 list-disc list-inside space-y-0.5">
                          {aiBulletPoints.map((b, i) => (
                            <li key={i} className="truncate">{b}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 rounded-xl text-xs font-bold shadow active:scale-95 transition-all uppercase tracking-wider"
                    >
                      {loading ? 'Submitting SKU...' : 'Deploy Live Item Showcase'}
                    </button>
                  </form>
                </div>

                {/* Live products items listing (Col 2-3) */}
                <div className="lg:col-span-2 space-y-3 max-h-[580px] overflow-y-auto pr-1">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center group hover:bg-white hover:border-orange-500/20 hover:shadow-lg hover:shadow-slate-105/5 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-slate-200/60 font-mono text-slate-500">
                            {p.id}
                          </span>
                          <h4 className="text-sm font-bold text-slate-800 font-display mt-0.5">{p.title}</h4>
                          <p className="text-xs text-orange-600 font-mono font-bold mt-1">
                            Rp {p.price.toLocaleString("id-ID")} • <span className="text-slate-500">Stock: {p.stock} units</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 font-mono mr-2 bg-slate-200/40 p-2 rounded-xl">
                          ★ {p.rating} ({p.sales} sales)
                        </span>

                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2.5 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 rounded-xl transition-all"
                          title="Delete product"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-bold font-display text-slate-800">Atmospheric Order Moderation Logistics</h3>

              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 bg-slate-50 border rounded-3xl">
                    <AlertTriangle className="w-12 h-12 text-slate-350 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No active purchase orders live under your merchant license.</p>
                  </div>
                ) : (
                  orders.map((o) => (
                    <div
                      key={o.id}
                      className="p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-lg transition-all space-y-4"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-150 pb-3">
                        <div>
                          <p className="text-xs font-mono text-slate-500 uppercase">
                            ORDER ID: <span className="text-slate-800 font-bold">{o.id}</span>
                          </p>
                          <p className="text-xs text-slate-400">Created: {new Date(o.createdAt).toLocaleDateString()}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono ${
                            o.payment?.status === "PAID" ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            PAYMENT: {o.payment?.status}
                          </span>

                          <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono ${
                            o.status === "completed" ? "bg-slate-900 text-white" : "bg-orange-100 text-orange-700 border border-orange-200"
                          }`}>
                            CARGO STATUS: {o.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Items row */}
                      <div className="space-y-2">
                        {o.items.map((item, idx) => (
                          <div key={idx} className="flex gap-3 text-xs items-center">
                            <img
                              src={item.image}
                              alt={item.productTitle}
                              className="w-10 h-10 object-cover rounded-lg border"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-slate-800">{item.productTitle}</p>
                              <p className="text-slate-400 font-mono text-[10px]">Qty {item.quantity} • Rp {item.price.toLocaleString("id-ID")}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Logistic shipping coordinates info */}
                      <div className="p-3 bg-slate-100/80 rounded-2xl text-[11px] text-slate-600 flex justify-between items-center flex-wrap gap-2">
                        <div>
                          <span className="font-bold text-slate-700 block">Deliver Coordinates:</span>
                          <span className="text-slate-500">{o.shippingAddress} (Recipient: {o.buyerName})</span>
                        </div>
                        <span className="font-bold text-slate-800">{o.courier}</span>
                      </div>

                      {/* Actions workflow */}
                      {o.status !== 'completed' && (
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => handleUpdateOrderStatus(o.id, o.status)}
                            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5"
                          >
                            Set Courier Status:{" "}
                            <span className="text-orange-400 uppercase">
                              {o.status === 'pending' ? 'Processing' : o.status === 'processing' ? 'Ship Parcel' : 'Mark Completed'}
                            </span>
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'campaign' && (
            <motion.div
              key="campaign"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-bold font-display text-slate-800">Dynamic Campaign & Voucher Systems</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50 border border-slate-105 rounded-2xl space-y-3">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 font-mono uppercase">
                    <Megaphone className="w-4 h-4 text-orange-500" /> Issue Store Voucher
                  </h4>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-slate-500 uppercase font-mono font-bold mb-1">Coupon Code</label>
                      <input 
                        type="text" 
                        placeholder="e.g. ULTRA3D" 
                        value={newVoucherCode} 
                        onChange={(e) => setNewVoucherCode(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 uppercase font-mono font-bold mb-1">Benefit/Discount Detail</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 15% OFF (Max Rp 100.000)" 
                        value={newVoucherDiscount} 
                        onChange={(e) => setNewVoucherDiscount(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg bg-white"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        if (newVoucherCode && newVoucherDiscount) {
                          setVouchers([...vouchers, { code: newVoucherCode.toUpperCase(), discount: newVoucherDiscount, minSpend: "Rp 300.000", type: "Flash Event Wide" }]);
                          setNewVoucherCode('');
                          setNewVoucherDiscount('');
                        }
                      }}
                      className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg"
                    >
                      Publish Campaign Coupon
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-800 font-mono uppercase tracking-wider">Active Shop Campaign Vouchers</h4>
                  
                  {vouchers.map((v, i) => (
                    <div key={i} className="p-4 bg-gradient-to-r from-amber-50 to-orange-50/50 border border-orange-100 rounded-2xl flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full font-mono">
                          {v.code}
                        </span>
                        <p className="text-sm font-bold text-slate-800 mt-2">{v.discount}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">Min spend: {v.minSpend} • {v.type}</p>
                      </div>
                      
                      <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100/80 p-1.5 rounded-lg border uppercase">
                        ACTIVE
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
