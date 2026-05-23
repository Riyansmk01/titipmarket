import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, OrderItem } from '../types';
import { apiUrl } from '../api';
import { X, MapPin, Truck, ChevronRight, QrCode, CreditCard, CheckCircle2, Loader2, Sparkles, Tag, Wallet } from 'lucide-react';

interface CheckoutModalProps {
  cart: { product: any; quantity: number }[];
  totalPrice: number;
  onClose: () => void;
  onSuccess: (order: Order) => void;
  currentUser?: any;
}

export default function CheckoutModal({ cart, totalPrice, onClose, onSuccess, currentUser }: CheckoutModalProps) {
  const [step, setStep] = useState<'form' | 'qris' | 'success'>('form');
  const [buyerName, setBuyerName] = useState(currentUser?.username || '');
  const [shippingAddress, setShippingAddress] = useState('Sudirman Boulevard Block C7, Jakarta Pusat');
  const [courier, setCourier] = useState('JNE Premium Air Express');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'wallet'>('qris');

  useEffect(() => {
    if (currentUser) {
      setBuyerName(currentUser.username);
    }
  }, [currentUser]);

  const handleApplyPromo = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setPromoError('');
    try {
      const res = await fetch(apiUrl('/api/promo'));
      const promos = await res.json();
      const matched = promos.find((p: any) => p.code.toUpperCase() === promoCode.trim().toUpperCase() && p.active);
      if (matched) {
        setAppliedPromo(matched);
        setPromoError('');
      } else {
        setPromoError('Kode promo tidak valid atau kedaluwarsa.');
        setAppliedPromo(null);
      }
    } catch (err) {
      setPromoError('Gagal memverifikasi promo.');
    }
  };

  const getDiscountedPrice = () => {
    if (!appliedPromo) return totalPrice;
    const discount = Math.round(totalPrice * (appliedPromo.discountPercent / 100));
    return Math.max(0, totalPrice - discount);
  };

  const finalPrice = getDiscountedPrice();

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || !shippingAddress.trim()) return;

    setLoading(true);
    try {
      const itemsPayload = cart.map(item => ({
        productId: item.product.id,
        productTitle: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0]
      }));

      // If buyer selects wallet check state, backend will double verify balance triggers
      const res = await fetch(apiUrl('/api/checkout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: currentUser?.id || 'buyer-1',
          buyerName,
          shippingAddress,
          courier,
          items: itemsPayload,
          totalPrice: finalPrice,
          promoCode: appliedPromo?.code
        })
      });

      const data = await res.json();
      if (res.status >= 400) {
        setPromoError(data.error || 'Checkout gagal.');
        setLoading(false);
        return;
      }

      setActiveOrder(data);
      
      // If payment was already completed via user balance on backend, jump straight to success screen
      if (data.payment?.status === 'PAID') {
        setStep('success');
      } else {
        setStep('qris');
      }
    } catch (err) {
      console.error('Error proceeding checkout:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!activeOrder) return;
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/orders/${activeOrder.id}/pay`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setActiveOrder(data.order);
        setStep('success');
      }
    } catch (err) {
      console.error('Error simulating pay:', err);
    } finally {
      setLoading(false);
    }
  };

  const couriersList = [
    { id: 'jne', name: 'JNE Premium Air Express', duration: 'Next-Day Delivery', price: 45000 },
    { id: 'tiki', name: 'TIKI Fast Cyber Track', duration: '1-2 Days Delivery', price: 35000 },
    { id: 'jnt', name: 'J&T Orbit Ground Space', duration: '2-3 Days Ground', price: 20000 }
  ];

  const platformPakasirRedirect = () => {
    // Pakasir redirection schema documentation as supplied:
    // https://app.pakasir.com/pay/{slug}/{amount}?order_id={order_id}
    const orderRefId = activeOrder?.id || `ord-${Date.now()}`;
    const invoiceId = activeOrder?.payment?.invoiceId || `INV-${Date.now()}`;
    window.open(`https://app.pakasir.com/pay/depodomain/${finalPrice}?order_id=${orderRefId}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-55 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col relative max-h-[92vh]"
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 bg-slate-100/80 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6">
          <h3 className="text-xl font-bold font-display flex items-center gap-2">
            <span className="p-1 px-2.5 rounded-lg bg-white/20 text-xs font-mono">STEP {step === 'form' ? '1' : step === 'qris' ? '2' : '3'}</span>
            Futuristic Express Billing (TitipMart)
          </h3>
          <p className="text-orange-50/90 text-xs mt-1">Pakasir Automatic Instant QRIS Routing Integration</p>
        </div>

        <div className="p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.form
                key="form-step"
                onSubmit={handleCheckoutSubmit}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4 text-left"
              >
                <div>
                  <label className="block text-xs font-bold font-mono text-slate-500 uppercase mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" /> Buyer Name & Identity
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-mono text-slate-500 uppercase mb-1">
                    Shipping Cyber Coordinates (Address)
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Provide detailed residence or drop block address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none"
                  />
                </div>

                {/* PROMO CODE FIELD */}
                <div className="p-3 bg-slate-50 border rounded-2xl">
                  <label className="block text-[10px] font-bold font-mono text-slate-450 uppercase mb-1 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-orange-500" /> Gunakan Voucher Promo Sistem
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan Kode (e.g. TITIPNEW, MEGAFUTUR)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold pointer-events-auto"
                    >
                      Klaim
                    </button>
                  </div>
                  {appliedPromo && (
                    <p className="text-[10px] text-green-600 font-mono mt-1.5">✓ Promo Terpasang: Potongan {appliedPromo.discountPercent}% ({appliedPromo.description})</p>
                  )}
                  {promoError && (
                    <p className="text-[10px] text-red-500 font-mono mt-1.5">✗ {promoError}</p>
                  )}
                </div>

                {/* PAYMENT METHOD CHOOSING */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">
                    PILIH METODE PEMBAYARAN
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('qris')}
                      className={`p-3 border rounded-2xl flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        paymentMethod === 'qris' ? 'border-orange-500 bg-orange-50/50 text-orange-600' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <QrCode className="w-5 h-5" />
                      <span className="text-xs font-bold">Pakasir QRIS Gateway</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wallet')}
                      className={`p-3 border rounded-2xl flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        paymentMethod === 'wallet' ? 'border-orange-500 bg-orange-50/50 text-orange-600' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <Wallet className="w-5 h-5" />
                      <span className="text-xs font-bold">Dompet TitipMart</span>
                      {currentUser && (
                        <span className="text-[9px] font-mono text-slate-400">Bal: Rp {currentUser.walletBalance?.toLocaleString()}</span>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold font-mono text-slate-500 uppercase mb-2 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-blue-500" /> Courier
                  </label>
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                    {couriersList.map((cour) => (
                      <label
                        key={cour.id}
                        className={`flex items-center justify-between p-2.5 border rounded-xl cursor-pointer transition-all ${
                          courier === cour.name ? 'border-orange-500 bg-orange-50/30' : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="courier"
                            value={cour.name}
                            checked={courier === cour.name}
                            onChange={() => setCourier(cour.name)}
                            className="text-orange-500 focus:ring-orange-500"
                          />
                          <div>
                            <p className="text-xs font-semibold text-slate-800">{cour.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{cour.duration}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-700 font-mono">
                          Rp {cour.price.toLocaleString("id-ID")}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-slate-400">GRAND TOTAL</span>
                    <span className="text-lg font-extrabold text-slate-900 font-display">
                      Rp {finalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-orange-500/10 active:scale-95 transition-all text-sm pointer-events-auto"
                  >
                    {loading ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <>
                        {paymentMethod === 'wallet' ? 'Proses Potong Saldo' : 'Next Route QRIS'} <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}

            {step === 'qris' && activeOrder && (
              <motion.div
                key="qris-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4 text-center flex flex-col items-center"
              >
                {/* PAKASIR PRODUCTION ROUTE BANNER */}
                <div className="w-full bg-slate-900 text-white rounded-2xl p-5 flex flex-col items-center border border-slate-800">
                  <div className="flex justify-between items-center w-full pb-3 border-b border-slate-800">
                    <span className="text-[10px] font-black font-mono tracking-widest text-orange-400">PAKASIR PRODUCTION GATEWAY</span>
                    <span className="text-[9px] bg-green-600 font-bold text-white px-2 py-0.5 rounded uppercase font-mono">Real Gateway</span>
                  </div>

                  <div className="my-5 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-left space-y-2">
                    <p className="text-xs text-orange-200 font-bold flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-orange-400" /> Koneksi Gerbang Pembayaran Aktif
                    </p>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      Sistem sedang mengarahkan pembayaran jastip Anda senilai <strong className="text-white">Rp {activeOrder.totalPrice?.toLocaleString("id-ID")}</strong> menggunakan link resmi produksi Pakasir.
                    </p>
                  </div>

                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">
                    NOMOR INVOICE: <span className="text-slate-100 font-bold">{activeOrder.payment?.invoiceId}</span>
                  </p>

                  <div className="w-full bg-slate-850 rounded-xl p-3.5 mt-3 border border-slate-800 flex justify-between items-center text-left">
                    <div>
                      <p className="text-[10px] font-mono text-slate-500 font-bold">Pemesan Jastip</p>
                      <p className="text-xs font-bold text-slate-100">{activeOrder.buyerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-slate-500 font-bold">Total Pembayaran</p>
                      <p className="text-sm font-extrabold text-orange-400 font-display">Rp {activeOrder.totalPrice?.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <button
                    type="button"
                    onClick={platformPakasirRedirect}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/15 justify-center flex items-center gap-2 pointer-events-auto cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" /> Buka atau Bayar Lewat Pakasir QRIS Asli
                  </button>

                  <button
                    onClick={handleSimulatePayment}
                    disabled={loading}
                    className="w-full py-3 px-6 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center justify-center gap-2 pointer-events-auto border border-emerald-200/50 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Cek Status & Konfirmasi Bayar Lunas
                      </>
                    )}
                  </button>

                  <p className="text-[9px] text-slate-400 font-mono text-center">
                    Link Produksi: https://app.pakasir.com/pay/depodomain/{activeOrder.totalPrice}?order_id={activeOrder.id}
                  </p>
                </div>
              </motion.div>
            )}

            {step === 'success' && activeOrder && (
              <motion.div
                key="success-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 flex flex-col items-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-emerald-50">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-2xl font-bold font-display text-slate-900 tracking-tight">Koneksi Pembayaran Berhasil!</h4>
                  <p className="text-xs text-slate-500">Terima kasih atas order Anda. Platform TitipMart memproses pesanan otomatis.</p>
                </div>

                <div className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order ID:</span>
                    <span className="font-mono font-semibold text-slate-800">{activeOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Invoice Ref:</span>
                    <span className="font-mono font-semibold text-slate-800">{activeOrder.payment?.invoiceId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Metode Pembayaran:</span>
                    <span className="font-bold text-emerald-600">{activeOrder.payment?.status === 'PAID' ? 'LUNAS (TERVERIFIKASI)' : 'BELUM lUNAS'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nominal:</span>
                    <span className="font-semibold text-slate-800">Rp {activeOrder.totalPrice?.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => onSuccess(activeOrder)}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl pointer-events-auto transition-all text-xs uppercase"
                >
                  Selesai & Kembali ke Home
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
