import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Order, Store } from '../types';
import { apiUrl } from '../api';
import { ShieldCheck, Users, TrendingUp, AlertOctagon, HelpCircle, Check, X, ShieldAlert, BadgeInfo } from 'lucide-react';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  stores: Store[];
  onToggleVerification: (storeId: string, verified: boolean) => void;
  onRefreshData: () => void;
}

export default function AdminPanel({ products, orders, stores, onToggleVerification, onRefreshData }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'fraud' | 'revenue'>('users');
  const [storeQuery, setStoreQuery] = useState('');
  const [moderationLogs, setModerationLogs] = useState<string[]>([
    "Sistem Pusat: Enkripsi admin berjalan lancar.",
    "Otorisasi: Akses konsol khusus didelegasikan secara aman."
  ]);

  // Dynamic calculations
  const totalGMV = orders.filter(o => o.payment?.status === "PAID").reduce((sum, o) => sum + o.totalPrice, 0);
  const platformEarnings = Math.round(totalGMV * 0.05); // 5% fee commission

  // Simulated Suspicious Orders for the FRAUD tab
  const [susOrders, setSusOrders] = useState([
    { id: "ord-101", buyer: "Reza Pratama", amount: 20899000, risk: "MEDIUM", reason: "First large amount transaction check limit", status: "PENDING VERIFICATION" },
    { id: "ord-992", buyer: "Fictional Bot User", amount: 154000000, risk: "CRITICAL", reason: "Multiple checkout clicks under 2 seconds", status: "FLAGGED FRAUD" }
  ]);

  const handleResolveFraud = (id: string, action: 'ALLOW' | 'BLOCK') => {
    setSusOrders(prev => prev.map(o => o.id === id ? { ...o, status: action === 'ALLOW' ? 'APPROVED SAFE' : 'BLOCKED TRANSACTION' } : o));
    setModerationLogs(prev => [
      `Admin menyelesaikan peringatan fraud untuk ${id}: ditandai sebagai ${action === 'ALLOW' ? 'AMAN' : 'FRAUDULENT'}.`,
      ...prev
    ]);
  };

  const handleDeleteStore = async (storeId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus toko ini secara permanen?\n\nTindakan ini juga akan menghapus seluruh produk yang berafiliasi dengan toko tersebut dari sistem!")) return;
    try {
      const res = await fetch(apiUrl(`/api/stores/${storeId}`), {
        method: 'DELETE'
      });
      if (res.ok) {
        setModerationLogs(prev => [
          `Admin menghapus paksa toko ID '${storeId}' beserta seluruh katalog produknya.`,
          ...prev
        ]);
        onRefreshData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menghapus toko.");
      }
    } catch {
      alert("Terjadi kegagalan komunikasi dengan server.");
    }
  };

  // Filter stores comprehensively based on store name, owner ID (user ID), or affiliate product title
  const filteredStores = stores.filter(store => {
    if (!storeQuery.trim()) return true;
    const query = storeQuery.toLowerCase();

    const matchStoreName = store.storeName.toLowerCase().includes(query) || store.id.toLowerCase().includes(query);
    const matchOwner = store.ownerId.toLowerCase().includes(query);

    // Match affiliated products
    const storeProducts = products.filter(p => p.sellerId === store.id);
    const matchProducts = storeProducts.some(p => p.title.toLowerCase().includes(query));

    return matchStoreName || matchOwner || matchProducts;
  });

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100/90 overflow-hidden">
      {/* Title block */}
      <div className="bg-gradient-to-r from-red-600 via-slate-900 to-slate-900 text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-orange-400" />
            Bright 3D Central Control Console
          </h2>
          <p className="text-slate-350 text-xs mt-1 font-mono uppercase tracking-wider">Moderasi Jastip, Komisi Portal & Kontrol Toko</p>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'users' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Verifikasi & Hapus Toko
          </button>
          <button
            onClick={() => setActiveTab('fraud')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
              activeTab === 'fraud' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Fraud Sentinel
            {susOrders.some(o => o.status.includes('FLAGGED') || o.status.includes('PENDING')) && (
              <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full animate-ping" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'revenue' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ledger & Logs
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest font-mono">
                    Kontrol Toko & Verifikasi Jastip
                  </h3>
                  <p className="text-[10px] text-slate-400">Gunakan pencarian untuk mendaftar toko berdasarkan produk atau ID pengguna.</p>
                </div>

                <div className="relative w-full md:w-72">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={storeQuery}
                    onChange={(e) => setStoreQuery(e.target.value)}
                    placeholder="Cari toko, produk, atau user ID..."
                    className="w-full pl-8.5 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-400"
                  />
                </div>
              </div>

              {/* Stores listing */}
              <div className="space-y-3">
                {filteredStores.length === 0 ? (
                  <div className="p-10 text-center border text-slate-400 rounded-2xl bg-slate-50">
                    <p className="text-xs font-bold font-mono">Tidak ada Toko Jastip yang cocok.</p>
                    <p className="text-[10px] text-slate-400 mt-1">Coba gunakan kata pencarian produk atau user lain.</p>
                  </div>
                ) : (
                  filteredStores.map((store: any) => {
                    // Find affiliated products titles for visual hint
                    const affiliated = products.filter(p => p.sellerId === store.id);
                    return (
                      <div
                        key={store.id}
                        className="p-4 bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-lg rounded-2xl transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 rounded-xl overflow-hidden shadow shrink-0">
                            <img src={store.banner || "https://images.unsplash.com/photo-1557426367-0e02f160e2f9.jpg"} alt={store.storeName} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-slate-800 font-display text-sm">{store.storeName}</h4>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-wide ${
                                store.verified ? 'bg-green-100 text-green-700 font-bold' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {store.verified ? 'VERIFIED VENDOR' : 'PENDING CHECK'}
                              </span>
                              <span className="bg-slate-200 text-slate-650 px-2 py-0.5 rounded text-[8px] font-mono">
                                Owner ID: {store.ownerId}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 leading-snug mt-1">{store.description}</p>
                            
                            {/* Visual products links list matching search queries */}
                            {affiliated.length > 0 && (
                              <div className="mt-2 text-[10px] text-slate-400 font-mono space-x-1.5">
                                <span className="font-bold text-orange-600">Produk ({affiliated.length}):</span>
                                {affiliated.map((p, idx) => (
                                  <span key={p.id} className="bg-orange-50 text-orange-750 px-1.5 py-0.5 rounded">
                                    {p.title.length > 25 ? p.title.substring(0, 25) + '...' : p.title}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
                          <button
                            onClick={() => onToggleVerification(store.id, !store.verified)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                              store.verified 
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-750' 
                                : 'bg-green-500 hover:bg-green-600 text-white font-mono'
                            }`}
                          >
                            {store.verified ? "Revoke" : "Verify Store"}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteStore(store.id)}
                            className="bg-red-50 hover:bg-red-105 text-red-650 hover:text-red-700 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1 border border-red-200"
                          >
                            Hapus Toko
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'fraud' && (
            <motion.div
              key="fraud"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-800">
                <ShieldAlert className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-extrabold uppercase font-mono tracking-wide">AI Fraud Risk Intelligence Active</p>
                  <p className="leading-relaxed">Below transactions were intercepted by our neural network algorithms check. Review buyer velocity and bank invoice volume sizes before allowing release.</p>
                </div>
              </div>

              {/* Suspect warnings */}
              <div className="space-y-3.5">
                {susOrders.map((sus) => (
                  <div key={sus.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider font-mono ${
                          sus.risk === "CRITICAL" ? 'bg-red-600 text-white' : 'bg-yellow-500 text-slate-900'
                        }`}>
                          {sus.risk} RISK WARNING
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 mt-2 font-display">
                          {sus.buyer} • Rp {sus.amount.toLocaleString("id-ID")}
                        </h4>
                        <p className="text-xs text-slate-500 italic mt-0.5">Intercept trigger: {sus.reason}</p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase ${
                        sus.status.includes('APPROVED') ? 'bg-green-100 text-green-700' : sus.status.includes('BLOCKED') ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {sus.status}
                      </span>
                    </div>

                    {/* Quick action buttons if pending */}
                    {(sus.status.includes('PENDING') || sus.status.includes('FLAGGED')) && (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleResolveFraud(sus.id, 'BLOCK')}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all active:scale-95"
                        >
                          <X className="w-3.5 h-3.5" /> Confirm Block
                        </button>
                        <button
                          onClick={() => handleResolveFraud(sus.id, 'ALLOW')}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5" /> Force Allow Release
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'revenue' && (
            <motion.div
              key="revenue"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Platform earnings ledger CARD */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow relative overflow-hidden">
                  <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Accumulated Admin Ledger Commission (5% CUT)</p>
                  <p className="text-3xl font-bold font-display text-orange-400 mt-3 mb-1">
                    Rp {platformEarnings.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">Calculated off total marketplace GMV Rp {totalGMV.toLocaleString("id-ID")}</p>

                  <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between text-xs text-slate-300">
                    <span>Direct Wire integration:</span>
                    <span className="font-bold text-orange-400">READY</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">Live Central Operations Ledger Log</h4>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto text-[11px] text-slate-600 font-mono">
                    {moderationLogs.map((log, idx) => (
                      <div key={idx} className="p-2 bg-white rounded-lg border border-slate-150 leading-normal flex gap-1.5 items-start">
                        <span>•</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
