import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Order, Store, Review, LiveNotification, AppUser, ChatMessage, PromoVo } from './types';
import ThreeDProductCard from './components/ThreeDProductCard';
import CheckoutModal from './components/CheckoutModal';
import SellerDashboard from './components/SellerDashboard';
import AdminPanel from './components/AdminPanel';
import { apiUrl } from './api';

import { 
  ShoppingCart, 
  User, 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Info, 
  Grid, 
  Search, 
  X, 
  Star, 
  Tag, 
  Bell, 
  Heart, 
  ShoppingBag, 
  MessageSquare,
  Globe,
  Cpu,
  Plus,
  Minus,
  Check,
  Send,
  Upload,
  Settings,
  Key,
  RefreshCw,
  FileText,
  HelpCircle,
  Smile,
  QrCode,
  Wallet,
  ArrowRight,
  Eye,
  Award,
  ThumbsUp,
  Sliders,
  AlertCircle
} from 'lucide-react';

export default function App() {
  // Navigation & Active user states
  const [currentRole, setCurrentRole] = useState<'buyer' | 'seller' | 'admin'>('buyer');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Database states synced from backend
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [promos, setPromos] = useState<PromoVo[]>([]);
  const [activeReviews, setActiveReviews] = useState<Review[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);

  // Guard to prevent multiple Google SDK initializations
  const googleInitialized = useRef(false);
  
  // Auth & Profile states (starts loaded with Java-preseeded Gold user)
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [authEmail, setAuthEmail] = useState('reza@marketdigi.me');
  const [authPassword, setAuthPassword] = useState('sandi123');
  const [authUsername, setAuthUsername] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | 'logged'>('login');
  const [newPassword, setNewPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authError, setAuthError] = useState('');
  
  // CS & Multi-User chats components
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [chatMessageInput, setChatMessageInput] = useState('');
  const [chatBoxOpen, setChatBoxOpen] = useState(false);
  const [chatReceiver, setChatReceiver] = useState<'cs' | 'seller'>('cs');
  const [activeMerchantId, setActiveMerchantId] = useState('neon-labs');

  // Interactive system states
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab3DImage, setActiveTab3DImage] = useState<number>(0);
  const [orbitRotation, setOrbitRotation] = useState<number>(0); 
  const [zoomScale, setZoomScale] = useState<number>(1.05);

  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  
  // Order list tab filtering: "belum bayar", "dikemas", "dikirim", "penilaian"
  const [orderFilterTab, setOrderFilterTab] = useState<'unpaid' | 'packed' | 'shipped' | 'rated'>('unpaid');
  
  // Form submission reviews dialog
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhotoUrl, setReviewPhotoUrl] = useState('');
  const [reviewVideoUrl, setReviewVideoUrl] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);
  const [expandedReviewPhoto, setExpandedReviewPhoto] = useState<string | null>(null);

  // Settings & feedback structures
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState('General Suggestion');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  // Floating promotion pop-up on start
  const [showPromoPopup, setShowPromoPopup] = useState(true);

  // Visual Image Lookalike search inputs
  const [visualSearchLoading, setVisualSearchLoading] = useState(false);
  const [visualSearchVerdict, setVisualSearchVerdict] = useState<any>(null);

  // KYC seller document submit state
  const [kycDocUrl, setKycDocUrl] = useState('');
  const [kycLoading, setKycLoading] = useState(false);
  const [kycResult, setKycResult] = useState<any>(null);

  // Custom visual telemetry panel safety toggle
  const [showSecurityCenter, setShowSecurityCenter] = useState(false);
  
  // Seed local client profile values on mount
  useEffect(() => {
    // Initial silent auto login for Reza Pratama
    fetch(apiUrl('/api/auth?action=login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'reza@marketdigi.me', password: 'sandi123' })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setCurrentUser(data.user);
        setAuthMode('logged');
      }
    }).catch(err => console.warn('Silent login issue:', err));
  }, []);

  // Sync state data from Express API servers
  const fetchMarketplaceState = async () => {
    try {
      const [resProd, resOrders, resStores, resCats, resNotifs, resPromos, resChats] = await Promise.all([
        fetch(apiUrl('/api/marketplace?action=products')),
        fetch(apiUrl('/api/marketplace?action=orders')),
        fetch(apiUrl('/api/marketplace?action=stores')),
        fetch(apiUrl('/api/marketplace?action=categories')),
        fetch(apiUrl('/api/marketplace?action=notifications')),
        fetch(apiUrl('/api/marketplace?action=promos')),
        fetch(apiUrl('/api/marketplace?action=chats'))
      ]);

      const [prods, ords, strs, cats, notifs, pCodeList, chatList] = await Promise.all([
        resProd.json(),
        resOrders.json(),
        resStores.json(),
        resCats.json(),
        resNotifs.json(),
        resPromos.json(),
        resChats.json()
      ]);

      setProducts(prods);
      setOrders(ords);
      setStores(strs);
      setCategories(cats);
      setNotifications(notifs);
      setPromos(pCodeList);
      setChats(chatList);

      // Keep currentUser local state synchronized with backend db fields
      if (currentUser) {
        const freshUser = ords[0]?.buyerId ? null : true; // trigger recalculation if needed
        fetch(apiUrl(`/api/auth?action=login`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: currentUser.email })
        })
        .then(r => r.json())
        .then(d => {
          if (d.success) setCurrentUser(d.user);
        }).catch(err => console.warn(err));
      }
    } catch (err) {
      console.error('Failure syncing state from database servers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceState();
    // Background polling every 5 seconds to fetch active orders and chats
    const interval = setInterval(() => {
      fetch(apiUrl('/api/marketplace?action=notifications')).then(r => r.json()).then(d => setNotifications(d)).catch(() => {});
      fetch(apiUrl('/api/marketplace?action=chats')).then(r => r.json()).then(d => setChats(d)).catch(() => {});
      fetch(apiUrl('/api/marketplace?action=orders')).then(r => r.json()).then(d => setOrders(d)).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch similar recommendations under detailed popup
  useEffect(() => {
    if (selectedProduct) {
      fetch(apiUrl(`/api/reviews?productId=${selectedProduct.id}`))
        .then(res => res.json())
        .then(data => setActiveReviews(data))
        .catch(err => console.error(err));

      fetch(apiUrl(`/api/marketplace?action=products`))
        .then(res => res.json())
        .then(data => setSimilarProducts(data))
        .catch(err => console.error(err));

      // Trigger viewed history tracking on backend
      if (currentUser) {
        fetch(apiUrl('/api/marketplace?action=viewed'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, productId: selectedProduct.id })
        }).catch(() => {});
      }
    }
  }, [selectedProduct, currentUser]);


  // USER REGISTRY AUTH ACTIONS
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthMessage('');

    if (authMode === 'login') {
      try {
        const res = await fetch(apiUrl('/api/auth?action=login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail, password: authPassword })
        });
        
        // Safe JSON parsing
        let data: any;
        const contentType = res.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          data = await res.json();
        } else {
          const text = await res.text();
          console.error('[Auth Response Error] Got non-JSON response:', contentType, text.substring(0, 200));
          setAuthError(`Server error: invalid response type (${res.status})`);
          return;
        }
        
        if (res.status >= 400) {
          setAuthError(data.error || 'Autentikasi gagal.');
        } else if (data?.user) {
          setCurrentUser(data.user);
          setAuthMode('logged');
          
          // Switch display roles immediately if they correspond in background
          if (data.user.role === 'seller') setCurrentRole('seller');
          else if (data.user.role === 'admin') setCurrentRole('admin');
          else setCurrentRole('buyer');

          fetchMarketplaceState();
        } else {
          setAuthError('Invalid server response');
        }
      } catch (err) {
        console.error('[Login Error]', err);
        setAuthError('Gagal terhubung dengan server Market Digi.');
      }
    } else if (authMode === 'register') {
      try {
        const res = await fetch(apiUrl('/api/auth?action=register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: authUsername, email: authEmail, password: authPassword, role: 'buyer' })
        });
        
        // Safe JSON parsing
        let data: any;
        const contentType = res.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          data = await res.json();
        } else {
          const text = await res.text();
          console.error('[Register Response Error]', contentType, text.substring(0, 200));
          setAuthError(`Server error: invalid response (${res.status})`);
          return;
        }
        
        if (res.status >= 400) {
          setAuthError(data.error || 'Register gagal.');
        } else {
          setAuthMessage('Pendaftaran Sukses! Silakan login masuk.');
          setAuthMode('login');
        }
      } catch (err) {
        console.error('[Register Error]', err);
        setAuthError('Terjadi kegagalan transmisi server.');
      }
    } else if (authMode === 'forgot') {
      try {
        const res = await fetch(apiUrl('/api/auth?action=forgot-password'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail })
        });
        
        // Safe JSON parsing
        let data: any;
        const contentType = res.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          data = await res.json();
        } else {
          const text = await res.text();
          console.error('[ForgotPassword Response Error]', contentType, text.substring(0, 200));
          setAuthError(`Server error: invalid response (${res.status})`);
          return;
        }
        
        if (res.status >= 400) {
          setAuthError(data.error || 'Email salah.');
        } else {
          setAuthMessage(data.message);
        }
      } catch {
        setAuthError('Koneksi server gagal.');
      }
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim() || !currentUser) return;
    try {
      const res = await fetch(apiUrl('/api/auth?action=change-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, newPassword })
      });
      const data = await res.json();
      setAuthMessage(data.message);
      setNewPassword('');
    } catch {
      setAuthError('Sandi gagal diperbaharui.');
    }
  };

  const handleGoogleCredentialResponse = async (response: any) => {
    try {
      const credential = response.credential;
      if (!credential) return;
      
      const base64Url = credential.split('.')[1];
      let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4;
      if (pad) {
        base64 += new Array(5 - pad).join('=');
      }
      
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      
      const res = await fetch(apiUrl('/api/auth?action=google-login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: payload.email,
          username: payload.name,
          avatar: payload.picture
        })
      });
      
      // Safe JSON parsing to handle both JSON and HTML error responses
      let data: any;
      const contentType = res.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('Invalid response type:', contentType, 'Response:', text);
        setAuthError('Server returned invalid response. Check console for details.');
        return;
      }
      
      if (res.ok && data?.user) {
        setCurrentUser(data.user);
        setIsSettingsOpen(false);
        fetchMarketplaceState();
        alert(`Berhasil masuk sebagai ${data.user.username} menggunakan Google!`);
      } else {
        setAuthError(data?.error || `Login failed with status ${res.status}`);
      }
    } catch (err) {
      console.error('Catch google auth error:', err);
      setAuthError('Gagal memproses kredensial Google Anda.');
    }
  };

  // Dynamic Google SSO hook activator - with guard to prevent multiple initializations
  useEffect(() => {
    // Only initialize when modal is actually visible (isSettingsOpen = true)
    if (typeof window !== 'undefined' && isSettingsOpen) {
      const renderGoogleButton = () => {
        if ((window as any).google?.accounts?.id) {
          try {
            if (!googleInitialized.current) {
              const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "424099504402-lbldmb8gajpojbpegldoc2ou1rvcnled.apps.googleusercontent.com";
              console.log('[Google SDK] Initializing with Client ID...');
              
              (window as any).google.accounts.id.initialize({
                client_id: googleClientId,
                callback: handleGoogleCredentialResponse,
                auto_select: false,
              });
              
              googleInitialized.current = true;
            }
            
            // Wait a brief moment to ensure DOM is ready
            setTimeout(() => {
              const btnParent = document.getElementById("google-signin-btn-container");
              if (btnParent) {
                console.log('[Google Button] Container found, rendering button...');
                try {
                  // Clear contents just in case it's a re-render
                  btnParent.innerHTML = '';
                  (window as any).google.accounts.id.renderButton(btnParent, {
                    type: "standard",
                    theme: "outline",
                    size: "large",
                    text: "signin_with",
                    logo_alignment: "left"
                  });
                  console.log("[Google Button] ✅ Rendered successfully");
                } catch (renderErr) {
                  console.error("[Google Button Render Error]", renderErr);
                  btnParent.style.display = "block";
                }
              } else {
                console.warn("[Google Button] ❌ Container div not found in DOM");
              }
            }, 100);
          } catch (e) {
            console.error("[Google SDK Init Error]", e);
          }
        } else {
          console.log('[Google SDK] Not loaded yet, retrying in 500ms...');
          setTimeout(renderGoogleButton, 500);
        }
      };
      renderGoogleButton();
    }
  }, [isSettingsOpen]);


  // REPUTATION & CHECK-IN DAILY SYSTEM Reward 100 Coins & Rp 1
  const handleDailyCheckIn = async () => {
    if (!currentUser) {
      setAuthError('Silakan login terlebih dahulu untuk mengklaim bonus check-in!');
      return;
    }

    try {
      const res = await fetch(apiUrl('/api/marketplace?action=checkin'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      const data = await res.json();
      if (res.status >= 400) {
        alert(data.error || 'Review gagal.');
      } else {
        // Redraw states and refresh balance
        fetchMarketplaceState();
        alert(`Selamat! Anda berhasil mengklaim bonus harian sebesar 100 Coins (+Rp 1) dari Market Digi!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTopupSimulate = async (amount: number) => {
    if (!currentUser) return;
    
    // Redirect / open the real production payment gateway link
    window.open(`https://app.pakasir.com/pay/depodomain/${amount}?order_id=topup-${currentUser.id}-${Date.now()}`, '_blank');
    
    try {
      const res = await fetch(apiUrl('/api/wallet'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, amount })
      });
      if (res.ok) {
        fetchMarketplaceState();
        alert(`Membuka Gateway Merchant Pakasir untuk pengisian saldo Rp ${amount.toLocaleString('id-ID')} Anda.\n\nKami juga memperbaharui saldo lokal Anda untuk visualisasi demo!`);
      }
    } catch {}
  };


  // CHAT SYSTEM ENGINES
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageInput.trim() || !currentUser) return;

    try {
      const res = await fetch(apiUrl('/api/marketplace?action=chats'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          senderName: currentUser.username,
          receiverId: chatReceiver === 'cs' ? 'admin-1' : activeMerchantId,
          message: chatMessageInput,
          isCS: chatReceiver === 'cs'
        })
      });
      if (res.ok) {
        setChatMessageInput('');
        fetchMarketplaceState();
      }
    } catch (err) {
      console.error(err);
    }
  };


  // UPLOAD PIC LOOKALIKE SIMILAR VISUAL SEARCH AI
  const handleVisualSearchClick = async (mockSelection: string) => {
    setVisualSearchLoading(true);
    setVisualSearchVerdict(null);

    // Standard preseeded lookalike models to trigger base64 visualization simulator
    const mockImagesMap: Record<string, string> = {
      apparel: "https://images.unsplash.com/photo-1544441893-675973e31985.jpg",
      projector: "https://images.unsplash.com/photo-1535223289827-42f1e9919769.jpg",
      holo: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc.jpg",
      gears: "https://images.unsplash.com/photo-1485955900006-10f4d324d411.jpg"
    };

    try {
      const res = await fetch(apiUrl('/api/marketplace?action=visual-search'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: mockImagesMap[mockSelection] || mockImagesMap.apparel })
      });
      const data = await res.json();
      if (data.success) {
        setVisualSearchVerdict(data.verdict);
        setSelectedCategory(data.verdict.suggestedCategoryId);
        
        // Highlight search with lookalike tag
        setSearchQuery(data.verdict.predictedName || 'Visual Matched');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVisualSearchLoading(false);
    }
  };


  // SELLER KYC AI ANALYZERS
  const handleKycAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycDocUrl.trim() || !currentUser) return;

    setKycLoading(true);
    setKycResult(null);

    try {
      const res = await fetch(apiUrl('/api/marketplace?action=kyc-upload'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerName: currentUser.username,
          email: currentUser.email,
          documentImage: kycDocUrl
        })
      });
      const data = await res.json();
      setKycResult(data.analysis);
      fetchMarketplaceState();
    } catch (err) {
      console.error(err);
    } finally {
      setKycLoading(false);
    }
  };


  // FEEDBACK SUBMISSIONS
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackContent.trim()) return;

    try {
      const res = await fetch(apiUrl('/api/marketplace?action=feedback'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentUser?.username || 'Shopper Anonymous',
          email: currentUser?.email || 'pembeli@marketdigi.me',
          category: feedbackCategory,
          content: feedbackContent
        })
      });
      if (res.ok) {
        setFeedbackContent('');
        setFeedbackSuccess('Saran dan Feedback Anda sukses dikirimkan ke pengawas Market Digi!');
        setTimeout(() => setFeedbackSuccess(''), 4000);
      }
    } catch {}
  };


  // ORDER PAYMENT WEBHOOK ACTIONS FROM BELUM BAYAR FILTERS
  const triggerOrderPaymentAction = async (orderId: string) => {
    try {
      const res = await fetch(apiUrl(`/api/marketplace?action=order-pay`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (data.success) {
        fetchMarketplaceState();
        alert(`Pembayaran QRIS Pesanan #${orderId} berhasil diproses oleh link gateway Pakasir!`);
      }
    } catch {}
  };


  // CART TRIGGERS
  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const index = cart.findIndex(item => item.product.id === product.id);
    if (index > -1) {
      const updated = [...cart];
      updated[index].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const nextQty = item.quantity + delta;
        return { ...item, quantity: nextQty > 0 ? nextQty : 1 };
      }
      return item;
    }));
  };

  const handleToggleWishlist = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    try {
      const res = await fetch(apiUrl('/api/marketplace?action=favorites'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, productId })
      });
      if (res.ok) {
        fetchMarketplaceState();
      }
    } catch {}
  };

  const handlePostReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(apiUrl('/api/reviews?action=create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          username: reviewName || currentUser?.username || "Market Digi Shopper",
          rating: reviewRating,
          comment: reviewComment,
          photoUrl: reviewPhotoUrl || undefined,
          videoUrl: reviewVideoUrl || undefined,
          userId: currentUser?.id || 'buyer-1'
        })
      });

      if (res.ok) {
        const newRev = await res.json();
        setActiveReviews([newRev, ...activeReviews]);
        setReviewComment('');
        setReviewName('');
        setReviewPhotoUrl('');
        setReviewVideoUrl('');
        fetchMarketplaceState();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAdminVerifyStoreToggle = async (storeId: string, verified: boolean) => {
    try {
      const res = await fetch(apiUrl(`/api/marketplace?action=verify-store&storeId=${storeId}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified })
      });
      if (res.ok) {
        fetchMarketplaceState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtering calculations
  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchQuery = !searchQuery.trim() || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.storeName && p.storeName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchQuery;
  });

  const cartTotalPrice = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Filter local orders based on status tab:
  // unpaid -> payment.status === 'UNPAID'
  // packed -> status === 'processing' or 'pending'
  // shipped -> status === 'shipped'
  // rated -> status === 'completed'
  const filterBuyerOrders = orders.filter(ord => {
    if (currentUser?.role === 'buyer' && ord.buyerId !== currentUser.id) return false;
    
    if (orderFilterTab === 'unpaid') {
      return ord.payment?.status === 'UNPAID';
    } else if (orderFilterTab === 'packed') {
      return (ord.status === 'processing' || ord.status === 'pending') && ord.payment?.status === 'PAID';
    } else if (orderFilterTab === 'shipped') {
      return ord.status === 'shipped';
    } else if (orderFilterTab === 'rated') {
      return ord.status === 'completed';
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-between text-[#111827] relative pb-20 md:pb-0">
      
      {/* Background ambient glowing shapes */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Brand New Header Logo branding matching Market Digi */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo with 3D elements naming to Market Digi */}
          <div className="flex items-center gap-3 select-none">
            <div className="relative w-11 h-11 flex-shrink-0">
              <img
                src="/images/titipmart_logo_1779527060606.png"
                alt="Market Digi Logo"
                className="w-full h-full object-contain rounded-2xl shadow-md border border-orange-100"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-xl font-black font-display tracking-tight text-slate-900 flex items-center gap-2 leading-none">
                Market Digi
                <span className="text-[10px] bg-orange-100 text-orange-700 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Bright Futuristic
                </span>
              </h1>
              <p className="text-slate-400 text-[9px] font-mono tracking-widest uppercase mt-0.5">Ultra Secure Multi-Vendor Hub</p>
            </div>
          </div>

          {/* Core App Role Switchers */}
          <div className="flex bg-slate-100 p-1.2 rounded-2xl border border-slate-200 text-xs">
            <button
              onClick={() => setCurrentRole('buyer')}
              className={`px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1 ${
                currentRole === 'buyer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-orange-500" /> Buyer Zone
            </button>
            <button
              onClick={() => setCurrentRole('seller')}
              className={`px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1 ${
                currentRole === 'seller' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-blue-500" /> Toko SAYA (Seller)
            </button>
            {currentUser?.email === 'perdhanariyan@gmail.com' && (
              <button
                onClick={() => setCurrentRole('admin')}
                className={`px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1 ${
                  currentRole === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-red-500" /> Admin Console
              </button>
            )}
          </div>

          {/* Quick Stats icons & profiles on top right */}
          <div className="flex items-center gap-2.5">
            {/* Wallet Quick Balance Display */}
            {currentUser && (
              <div className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 p-1.5 pl-3 pr-4 rounded-xl">
                <Wallet className="w-4 h-4 text-orange-500" />
                <div className="text-left">
                  <p className="text-[8px] text-slate-400 leading-none">SALDO DOMPET</p>
                  <p className="text-xs font-black text-orange-600 font-mono leading-tight">Rp {currentUser.walletBalance?.toLocaleString('id-ID')}</p>
                </div>
                <div className="flex flex-col ml-2 border-l border-orange-200 pl-2 text-left">
                  <span className="text-[8px] text-slate-400 leading-none">TIER LEVEL</span>
                  <span className="text-[9px] font-bold text-slate-700 flex items-center gap-0.5">
                    <Award className="w-3 h-3 text-amber-500" /> {currentUser.tier}
                  </span>
                </div>
              </div>
            )}

            {/* Profile trigger */}
            <div className="relative group">
              <button 
                onClick={() => { setAuthMode('logged'); setIsSettingsOpen(true); }}
                className="p-2.5 hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-600 flex items-center gap-2 cursor-pointer pointer-events-auto"
              >
                {currentUser ? (
                  <>
                    <img src={currentUser.avatar} alt="Avatar" className="w-4 h-4 rounded-full" />
                    <span className="text-xs font-bold font-sans max-w-[80px] truncate">{currentUser.username}</span>
                  </>
                ) : (
                  <User className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Real-time Jastip Live Chat Shortcuts */}
            <button
              onClick={() => {
                setChatReceiver('cs');
                setChatBoxOpen(true);
              }}
              className="p-2.5 hover:bg-slate-50 hover:text-orange-500 rounded-xl border border-slate-200 text-slate-600 transition-all relative cursor-pointer pointer-events-auto flex items-center gap-1.5 duration-150"
              title="Konsol Chat Jastip & CS"
            >
              <MessageSquare className="w-4 h-4 text-orange-500" />
              <span className="hidden sm:inline text-xs font-bold text-slate-600 hover:text-orange-500">Chat</span>
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-600 transition-all relative cursor-pointer pointer-events-auto"
            >
              <ShoppingCart className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-6 flex-1 w-full">
        {loading ? (
          <div className="p-32 text-center text-slate-500 space-y-4">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Loading TitipMart assets...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {currentRole === 'buyer' && (
              <motion.div
                key="buyer-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* 3D HERO BANNER DESIGN WITH NEW CUSTOM NAME TITIPMART */}
                <section 
                  className="bg-gradient-to-r from-[#FF7A00] via-amber-500 to-orange-600 text-white rounded-3xl p-6 lg:p-9 relative overflow-hidden shadow-xl shadow-orange-500/10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
                  style={{
                    backgroundImage: "linear-gradient(rgba(255, 122, 0, 0.85), rgba(234, 88, 12, 0.9)), url('/images/marketplace_hero_banner_1779528695181.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundBlendMode: 'multiply'
                  }}
                >
                  <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="lg:col-span-8 space-y-3.5 text-left">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black font-display leading-tight tracking-tight">
                      Jasa Titip & Marketplace<br />Futuristik 3D Terpercaya
                    </h2>
                    <p className="text-orange-50 text-xs max-w-lg leading-relaxed font-sans">
                      Platform titip beli multi-vendor premium. Amankan kredit Anda, bayar instant lewat portal Pakasir, nikmati copywriting cerdas, dan visual AI lookalike search!
                    </p>
                    
                    {/* Action buttons list */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <a 
                        href="#explore-showcase" 
                        className="px-5 py-2.5 bg-white text-orange-600 font-extrabold rounded-xl text-xs hover:bg-orange-50 transition-all shadow-md active:scale-95 duration-200"
                      >
                        Mulai Belanja
                      </a>
                      
                      {currentUser?.lastCheckIn === new Date().toDateString() ? (
                        <div className="px-5 py-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm">
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Sudah Check-In Hari Ini
                        </div>
                      ) : (
                        <button 
                          onClick={handleDailyCheckIn}
                          className="px-5 py-2.5 bg-slate-950 border-2 border-orange-500 hover:border-orange-600 text-white font-extrabold rounded-xl text-xs hover:bg-slate-900 transition-all flex items-center gap-1.5 cursor-pointer pointer-events-auto shadow-md shadow-orange-500/20 active:scale-95 duration-200"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin" /> Daily Check-In (+100 Coins)
                        </button>
                      )}
                    </div>

                    {/* Preseeded Live statistical badges */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/20 font-mono text-left max-w-md">
                      <div>
                        <p className="text-sm font-black md:text-base">Rp 20.899.000</p>
                        <p className="text-[8px] text-orange-100 uppercase tracking-wider">Laju GMV</p>
                      </div>
                      <div>
                        <p className="text-sm font-black md:text-base">{products.length} Items</p>
                        <p className="text-[8px] text-orange-100 uppercase tracking-wider">Multi-Vendor Products</p>
                      </div>
                      <div>
                        <p className="text-sm font-black md:text-base">GOLD / PLATINUM</p>
                        <p className="text-[8px] text-orange-100 uppercase tracking-wider">Sistem Tiering</p>
                      </div>
                    </div>
                  </div>

                  {/* Rigth hand promo card render */}
                  <div className="lg:col-span-4 flex justify-center items-center h-48 lg:h-64">
                    <div className="w-52 h-56 rounded-2xl p-4 bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl flex flex-col justify-between text-left">
                      <div className="flex justify-between items-center text-[8px] font-mono">
                        <span className="font-bold">TITIPMART EXCLUSIVE</span>
                        <span className="bg-orange-600 p-0.5 px-2 rounded">HOT ITEM</span>
                      </div>
                      <div className="h-24 bg-white/15 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden">
                        <img src="/images/exclusive_glasses_promo_1779528963521.png" alt="glasses promo" className="w-20 h-20 object-cover rounded-lg rotate-6 hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg text-xs font-mono">
                        <span>AURA GLASS XR</span>
                        <span className="font-bold font-display text-orange-200">Rp 18.9M</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* QUICK ACCESS MENU */}
                <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm text-left relative overflow-hidden">
                  <div className="flex items-center gap-1.5 mb-4">
                    <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 font-mono">Quick Access Shortcuts Menu</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    <button
                      onClick={handleDailyCheckIn}
                      disabled={currentUser?.lastCheckIn === new Date().toDateString()}
                      className={`p-3 border rounded-2xl text-center transition-all cursor-pointer pointer-events-auto group flex flex-col items-center gap-2 ${
                        currentUser?.lastCheckIn === new Date().toDateString()
                          ? 'bg-green-50/40 border-green-100 text-green-700 cursor-default opacity-85'
                          : 'bg-gradient-to-br from-amber-50 to-orange-50/40 hover:from-amber-100 hover:to-orange-100 border-amber-100/30 rounded-2xl'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${
                        currentUser?.lastCheckIn === new Date().toDateString()
                          ? 'bg-green-100 text-green-600'
                          : 'bg-orange-100 text-orange-600 group-hover:scale-110'
                      }`}>
                        {currentUser?.lastCheckIn === new Date().toDateString() ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <Sparkles className="w-5 h-5 text-orange-500" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] font-extrabold text-slate-800 leading-tight">
                          {currentUser?.lastCheckIn === new Date().toDateString() ? 'Sudah Check-In' : 'Daily Check-In'}
                        </p>
                        <p className={`text-[9px] font-mono leading-none mt-1 ${
                          currentUser?.lastCheckIn === new Date().toDateString() ? 'text-green-600 font-bold' : 'text-[#FF7A00]'
                        }`}>
                          {currentUser?.lastCheckIn === new Date().toDateString() ? 'Claimed' : '+100 Coin/Rp1'}
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        if (currentUser) {
                          handleTopupSimulate(500000);
                        } else {
                          setAuthError('Silakan login terlebih dahulu untuk mengisi saldo!');
                          setChatBoxOpen(false);
                          setIsSettingsOpen(true);
                        }
                      }}
                      className="p-3 bg-gradient-to-br from-orange-50 to-amber-50/40 hover:from-orange-100 hover:to-amber-100 border border-orange-100/30 rounded-2xl text-center transition-all cursor-pointer pointer-events-auto group flex flex-col items-center gap-2"
                    >
                      <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Wallet className="w-5 h-5 text-orange-500 animate-pulse" />
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] font-extrabold text-slate-800 leading-tight">Top Up Saldo</p>
                        <p className="text-[9px] text-slate-500 leading-none mt-1">Pakasir QRIS</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setChatReceiver('cs');
                        setChatBoxOpen(true);
                      }}
                      className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50/40 hover:from-blue-100 hover:to-indigo-100 border border-blue-100/30 rounded-2xl text-center transition-all cursor-pointer pointer-events-auto group flex flex-col items-center gap-2"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] font-extrabold text-slate-800 leading-tight">Chat Admin CS</p>
                        <p className="text-[9px] text-slate-500 leading-none mt-1">Pusat Jastip</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setIsCartOpen(true)}
                      className="p-3 bg-gradient-to-br from-purple-50 to-pink-50/40 hover:from-purple-100 hover:to-pink-100 border border-purple-100/30 rounded-2xl text-center transition-all cursor-pointer pointer-events-auto group flex flex-col items-center gap-2"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShoppingCart className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] font-extrabold text-slate-800 leading-tight">Keranjang</p>
                        <p className="text-[9px] text-slate-450 leading-none mt-1">Troli Belanja</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentRole('seller');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50/40 hover:from-emerald-100 hover:to-teal-100 border border-emerald-100/30 rounded-2xl text-center transition-all cursor-pointer pointer-events-auto group flex flex-col items-center gap-2"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShoppingBag className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] font-extrabold text-slate-800 leading-tight">Mulai Jual</p>
                        <p className="text-[9px] text-slate-450 leading-none mt-1">Kelola Toko</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setAuthMode('logged');
                        setIsSettingsOpen(true);
                      }}
                      className="p-3 bg-gradient-to-br from-slate-100 to-slate-50 hover:from-slate-200 hover:to-slate-100 border border-slate-200/30 rounded-2xl text-center transition-all cursor-pointer pointer-events-auto group flex flex-col items-center gap-2"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Settings className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] font-extrabold text-slate-800 leading-tight">Kelola Akun</p>
                        <p className="text-[9px] text-slate-450 leading-none mt-1">Profil & KYC</p>
                      </div>
                    </button>
                  </div>
                </section>

                {/* WISHLIST FAVORITES & TERAKHIR DILIHAT PANEL TRAY */}
                {currentUser && (currentUser.favorites?.length > 0 || currentUser.recentlyViewed?.length > 0) && (
                  <section className="bg-white rounded-2xl p-4.5 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Favorites list */}
                    <div className="space-y-2 text-left">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Produk Terfavorit Saya ({currentUser.favorites?.length || 0})
                      </h4>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {currentUser.favorites?.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic">Belum ada barang favorit.</p>
                        ) : (
                          products.filter(p => currentUser.favorites?.includes(p.id)).map(p => (
                            <div 
                              key={p.id} 
                              onClick={() => setSelectedProduct(p)}
                              className="bg-slate-50 border p-2 rounded-xl text-left cursor-pointer hover:border-orange-300 transition-all flex items-center gap-2 flex-shrink-0 w-44"
                            >
                              <img src={p.images[0]} alt="" className="w-8 h-8 rounded object-cover" />
                              <div className="truncate">
                                <p className="text-[10px] font-bold text-slate-800 truncate">{p.title}</p>
                                <p className="text-[9px] font-mono text-orange-500 font-black">Rp {p.price?.toLocaleString()}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Recently Viewed */}
                    <div className="space-y-2 text-left">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-blue-500" /> Terakhir Dilihat ({currentUser.recentlyViewed?.length || 0})
                      </h4>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {currentUser.recentlyViewed?.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic">Belum melihat barang apapun.</p>
                        ) : (
                          products.filter(p => currentUser.recentlyViewed?.includes(p.id)).map(p => (
                            <div 
                              key={p.id} 
                              onClick={() => setSelectedProduct(p)}
                              className="bg-slate-50 border p-2 rounded-xl text-left cursor-pointer hover:border-orange-300 transition-all flex items-center gap-2 flex-shrink-0 w-44"
                            >
                              <img src={p.images[0]} alt="" className="w-8 h-8 rounded object-cover animate-pulse" />
                              <div className="truncate">
                                <p className="text-[10px] font-bold text-slate-800 truncate">{p.title}</p>
                                <p className="text-[9px] font-mono text-slate-500">Viewed details</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </section>
                )}

                {/* DAFATAR TRANSAKSI SAYA (Belum Bayar, Dikemas, Dikirim, Penilaian) */}
                <section className="bg-white rounded-3xl p-5 border border-slate-100 text-left">
                  <div className="flex justify-between items-center pb-2.5 border-b mb-3">
                    <div>
                      <h3 className="text-sm font-bold font-display text-slate-900 tracking-tight">Status Pesanan Belanja Saya</h3>
                      <p className="text-[10px] text-slate-400">Kelola dan selesaikan transaksi tagihan multi-vendor TitipMart Anda.</p>
                    </div>
                    <span className="text-[9px] font-mono bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded uppercase">Pakasir QRIS Connected</span>
                  </div>

                  {/* Tab switches */}
                  <div className="flex gap-1.5 border-b pb-2 cursor-pointer">
                    {[
                      { id: 'unpaid', label: 'Belum Bayar' },
                      { id: 'packed', label: 'Dikemas' },
                      { id: 'shipped', label: 'Dikirim / Selesai' },
                      { id: 'rated', label: 'Riwayat Penilaian' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setOrderFilterTab(tab.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          orderFilterTab === tab.id ? 'bg-orange-500 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-500'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* List items dynamic */}
                  <div className="space-y-3 mt-3 max-h-[200px] overflow-y-auto">
                    {filterBuyerOrders.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-4 text-center">Tidak ada pesanan transaksi dalam kriteria filter ini.</p>
                    ) : (
                      filterBuyerOrders.map(ord => (
                        <div key={ord.id} className="text-xs p-3 bg-slate-50 border rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900 uppercase">INVOICE: {ord.payment?.invoiceId}</span>
                              <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono">{ord.createdAt.slice(11, 16)} GMT</span>
                            </div>
                            <p className="text-slate-500 mt-0.5">Metode Kurir: <span className="font-bold text-slate-700">{ord.courier}</span></p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-slate-400">Total Nominal:</span>
                              <span className="font-mono font-black text-orange-600">Rp {ord.totalPrice?.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {orderFilterTab === 'unpaid' && (
                              <button
                                onClick={() => triggerOrderPaymentAction(ord.id)}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg text-xs font-bold pointer-events-auto shadow shadow-green-500/10 active:scale-95"
                              >
                                Bayar via Pakasir QRIS
                              </button>
                            )}
                            {orderFilterTab === 'packed' && (
                              <span className="text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg font-bold">Sedang Dikemas Penjual</span>
                            )}
                            {orderFilterTab === 'shipped' && (
                              <div className="flex items-center gap-2">
                                <span className="text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg font-bold">Kurir Mengirimkan Barang</span>
                                <button
                                  onClick={async () => {
                                    // Mark completed trigger update
                                    await fetch(apiUrl('/api/marketplace?action=order-status'), {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ orderId: ord.id, status: 'completed' })
                                    });
                                    fetchMarketplaceState();
                                    alert('Pesanan selesai! Silakan beri nilai bintang ulasan Anda.');
                                  }}
                                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold pointer-events-auto"
                                >
                                  Konfirmasi Selesai
                                </button>
                              </div>
                            )}
                            {orderFilterTab === 'rated' && (
                              <span className="text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg font-bold">✓ Transaksi Sukses & Dinilai</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* SEARCH INPUT & LOOKALIDE UPLOAD FEATURE INLINE */}
                <section id="explore-showcase" className="space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="text-left">
                      <h3 className="text-xl font-black font-display tracking-tight text-slate-900">Showcase Etalase Barang TitipMart</h3>
                      <p className="text-slate-500 text-xs">Cari barang futuristik unik atau unggah foto untuk lookup visual AI secara instan.</p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      {/* Integrated Search controller */}
                      <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Ketik nama produk, kriteria desain..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs transition-all text-left"
                        />
                      </div>

                      {/* Visual lookalike lookup buttons */}
                      <div className="relative group">
                        <button 
                          className="p-2.5 bg-gradient-to-tr from-orange-500 to-amber-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer pointer-events-auto"
                        >
                          <Upload className="w-4 h-4" /> Cari via Foto AI
                        </button>

                        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3.5 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-50 text-left">
                          <p className="text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-2">Simulasikan Upload visual looks</p>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => handleVisualSearchClick('apparel')}
                              className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 border rounded-lg text-[10px] font-bold"
                            >
                              Jacket
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVisualSearchClick('projector')}
                              className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 border rounded-lg text-[10px] font-bold"
                            >
                              Holo Sphere
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVisualSearchClick('holo')}
                              className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 border rounded-lg text-[10px] font-bold"
                            >
                              Aura Glasses
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVisualSearchClick('gears')}
                              className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 border rounded-lg text-[10px] font-bold"
                            >
                              Smart Ecosystem
                            </button>
                          </div>
                          {visualSearchLoading && (
                            <p className="text-[10px] font-mono text-orange-500 animate-pulse mt-2 block">✓ AI Visual Analyzer parsing...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Visual scanning report */}
                  {visualSearchVerdict && (
                    <div className="p-3 bg-orange-50/50 border border-orange-200 rounded-2xl text-left flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-orange-500 animate-bounce" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Visual Search matched Category: <span className="font-black text-orange-600">{visualSearchVerdict.suggestedCategoryId.toUpperCase()}</span> (Confidence: {(visualSearchVerdict.matchConfidence*100).toFixed(0)}%)</p>
                        <p className="text-[10px] font-mono text-slate-400">Predicted Item: "{visualSearchVerdict.predictedName}" | tags matched: {visualSearchVerdict.tags?.join(', ')}</p>
                      </div>
                      <button 
                        onClick={() => { setVisualSearchVerdict(null); setSearchQuery(''); }}
                        className="ml-auto p-1 bg-white hover:bg-slate-100 border rounded text-[10px]"
                      >
                        Reset Filter
                      </button>
                    </div>
                  )}

                  {/* Categories Filter list tags */}
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold pointer-events-auto cursor-pointer transition-all ${
                        selectedCategory === 'all' 
                          ? 'bg-slate-900 text-white shadow' 
                          : 'bg-white hover:bg-slate-50 border text-slate-600'
                      }`}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold pointer-events-auto cursor-pointer transition-all ${
                          selectedCategory === cat.id 
                            ? 'bg-orange-500 text-white shadow' 
                            : 'bg-white hover:bg-slate-50 border text-slate-600'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* Active Products lists */}
                  {filteredProducts.length === 0 ? (
                    <div className="p-16 text-center text-slate-400 bg-white border border-slate-100 rounded-3xl">
                      <p className="text-xs font-bold">Produk kosong.</p>
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="text-xs text-orange-500 font-bold mt-1 block mx-auto hover:underline"
                      >
                        Reset Pencarian
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.map((product) => (
                        <ThreeDProductCard
                          key={product.id}
                          product={product}
                          onViewDetails={(p) => setSelectedProduct(p)}
                          onAddToCart={(p, e) => handleAddToCart(p, e)}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* ACTIVE PROMOTIONS SYSTEM CARDS */}
                <section className="space-y-3.5 text-left">
                  <h3 className="text-sm font-bold font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-orange-500" /> PROMO SISTEM AKTIF
                  </h3>
                  {promos.length === 0 ? (
                    <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-center">
                      <p className="text-xs font-semibold text-slate-500">Sistem Promo Saat Ini Belum Aktif</p>
                      <p className="text-[10px] text-slate-400 mt-1">Nantikan rilis kode voucher eksklusif dan event jastip menarik berikutnya!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {promos.map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => { 
                            navigator.clipboard?.writeText?.(p.code);
                            alert(`Kode voucher "${p.code}" disalin ke clipboard! Gunakan saat proses pembayaran.`); 
                          }}
                          className="bg-gradient-to-tr from-slate-900 to-slate-800 border p-4 rounded-2xl text-left text-white relative hover:border-orange-500 transition-all cursor-pointer shadow-md group overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-full blur-xl" />
                          <span className="text-[9px] bg-orange-500 text-white font-mono font-bold px-2 py-0.5 rounded tracking-wide uppercase">CASHBACK {p.discountPercent}%</span>
                          <h4 className="text-lg font-black font-display text-slate-100 tracking-tight mt-1">{p.code}</h4>
                          <p className="text-[11px] text-slate-400 leading-tight mt-1">{p.description}</p>
                          <span className="text-[9px] text-slate-500 font-mono italic block pt-1 group-hover:text-orange-400 transition-colors">✓ Klik untuk menempelkan kode</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </motion.div>
            )}

            {currentRole === 'seller' && (
              <motion.div
                key="seller-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* --- SELLER MY STOREFRONT UTILITIES --- */}
                {currentUser ? (
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 text-left space-y-5">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">⚙️ Sistem Kelola Toko Saya (TitipMart)</h3>
                        <p className="text-xs text-slate-500">Sesuaikan branding visual toko multi-vendor Anda agar menarik pembeli.</p>
                      </div>
                      <span className="bg-blue-100 text-blue-805 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">vendor active</span>
                    </div>

                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const storeNameInput = (e.target as any).storeNameInput.value;
                        const storeBioInput = (e.target as any).storeBioInput.value;
                        const storeBannerInput = (e.target as any).storeBannerInput.value;

                        const res = await fetch(apiUrl('/api/marketplace?action=update-store'), {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            storeId: 'neon-labs',
                            storeName: storeNameInput,
                            description: storeBioInput,
                            banner: storeBannerInput
                          })
                        });
                        if (res.ok) {
                          alert('Profil Toko Saya ter-update sukses!');
                          fetchMarketplaceState();
                        }
                      }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <div className="text-xs">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nama Toko Multi-Vendor</label>
                        <input name="storeNameInput" required defaultValue="Neon Labs 3D" className="w-full border p-2.5 rounded-lg bg-slate-50" />
                      </div>
                      <div className="text-xs">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Branding Banner JPEG</label>
                        <input name="storeBannerInput" required defaultValue="/images/default_store_banner_1779528712410.png" className="w-full border p-2.5 rounded-lg bg-slate-50" />
                      </div>
                      <div className="text-xs">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bio / Deskripsi Jurnal Toko</label>
                        <input name="storeBioInput" required defaultValue="Hardware futuristik & display holografik buatan tangan untuk penduduk cyber." className="w-full border p-2.5 rounded-lg bg-slate-50" />
                      </div>

                      <div className="md:col-span-3 flex justify-end">
                        <button type="submit" className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold pointer-events-auto">
                          Simpan Perubahan Toko Saya
                        </button>
                      </div>
                    </form>

                    {/* KYC Seller AI uploading evaluation */}
                    <div className="pt-5 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verifikasi Legalitas KYC Merchant
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                        <form onSubmit={handleKycAnalyze} className="md:col-span-6 space-y-2.5 text-xs text-left">
                          <p className="text-[11px] text-slate-500">Unggah foto dokumen KTP / Izin Usaha untuk dianalisis oleh AI Security Guard TitipMart secara instan.</p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              required
                              placeholder="Masukkan URL foto identitas KTP (e.g. jpegs unsplash)"
                              value={kycDocUrl}
                              onChange={(e) => setKycDocUrl(e.target.value)}
                              className="flex-1 border p-2 rounded-lg bg-slate-50"
                            />
                            <button
                              type="button"
                              onClick={() => setKycDocUrl('https://images.unsplash.com/photo-1554441893-675973e31985.jpg')}
                              className="px-2 bg-slate-200 border rounded text-[10px] font-bold font-mono"
                            >
                              KTP Contoh
                            </button>
                          </div>
                          
                          <button
                            type="submit"
                            disabled={kycLoading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs pointer-events-auto flex items-center gap-1.5"
                          >
                            {kycLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Evaluasi KYC via AI Failover Pool'}
                          </button>
                        </form>

                        <div className="md:col-span-6 text-xs bg-slate-50 border p-4 rounded-2xl min-h-[110px]">
                          {kycResult ? (
                            <div className="space-y-1">
                              <span className={`p-0.5 px-2 text-[9px] font-bold font-mono rounded ${kycResult.valid ? 'bg-green-100 text-green-700' : 'bg-red-100/85 text-red-700'}`}>✓ STATUS: {kycResult.readStatus}</span>
                              <p className="font-bold text-slate-850 mt-1">Nama Legal: {kycResult.identityName}</p>
                              <p className="font-mono text-[10px] text-slate-500">KTP ID: {kycResult.idNumber} | Confidence: {(kycResult.confidence*100).toFixed(0)}%</p>
                              <p className="text-slate-600 italic">"Verdict: {kycResult.remarks}"</p>
                            </div>
                          ) : (
                            <p className="text-slate-400 italic text-center py-6">Belum ada dokumen yang diproses AI.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-xs py-10">Silakan login sebagai penjual di panel setelan atas.</p>
                )}

                <SellerDashboard 
                  products={products}
                  orders={orders}
                  onRefreshData={fetchMarketplaceState}
                />
              </motion.div>
            )}

            {currentRole === 'admin' && (
              <motion.div
                key="admin-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Secure monitoring telemetry panel */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 text-left">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <div>
                      <h3 className="text-sm font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-red-500" /> Pusat Keamanan Sandbox TitipMart
                      </h3>
                      <p className="text-[10px] text-slate-400">Status monitor enkripsi dan data validasi real-time.</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowSecurityCenter(!showSecurityCenter)}
                      className="text-[10px] font-bold text-orange-600 border border-orange-200 hover:bg-orange-50 p-1 px-3 rounded-lg pointer-events-auto"
                    >
                      {showSecurityCenter ? 'Tutup Telemetry' : 'Buka Telemetry'}
                    </button>
                  </div>

                  {showSecurityCenter && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 text-xs font-mono">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-[9px] text-slate-400">SECURE ENCRYPTION</p>
                        <p className="font-bold text-slate-700">AES-256-GCM ACTIVE</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-[9px] text-slate-400">AI PROVISIONING POOL</p>
                        <p className="font-bold text-slate-755 text-green-700">✓ 5 ENGINES LOADED</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-[9px] text-slate-400">CREDENTIAL SAFETY SCORE</p>
                        <p className="font-bold text-blue-600">100% MAXIMUM INDEX</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-[9px] text-slate-400">PAKASIR DEPO KEY</p>
                        <p className="font-bold text-red-600">MD5 SECURED STATE</p>
                      </div>
                    </div>
                  )}
                </div>

                <AdminPanel 
                  products={products}
                  orders={orders}
                  stores={stores}
                  onToggleVerification={handleAdminVerifyStoreToggle}
                  onRefreshData={fetchMarketplaceState}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* DETAILED INTERACTIVE 3D POPUP MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl border border-slate-100 flex flex-col md:flex-row relative max-h-[95vh] text-left"
            >
              {/* Close Button details */}
              <button
                onClick={() => { setSelectedProduct(null); setOrbitRotation(0); }}
                className="absolute right-5 top-5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-10 cursor-pointer pointer-events-auto"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Left Column: INTERACTIVE 3D VIEWPORT */}
              <div className="md:w-1/2 p-6 bg-slate-50 flex flex-col justify-between border-r border-slate-100 select-none max-h-[45vh] md:max-h-none overflow-y-auto">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] bg-slate-200 font-mono font-bold text-slate-500 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Interactive 3D Render
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Gunakan slider kontrol di bawah</span>
                  </div>

                  {/* 3D Visual orbit frame */}
                  <div className="h-56 sm:h-72 w-full rounded-2xl bg-white border border-slate-200 relative flex items-center justify-center overflow-hidden shadow-inner group">
                    <div className="absolute inset-x-0 top-0 text-center text-[9px] text-slate-400 font-mono pt-2 pointer-events-none uppercase tracking-widest">
                      ANGLE VIEWPORT: {orbitRotation}°
                    </div>

                    {/* Orbit Display image */}
                    <div style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}>
                      <motion.img
                        src={selectedProduct.images[activeTab3DImage] || selectedProduct.images[0]}
                        alt="3D product"
                        className="w-40 h-40 object-contain transition-shadow duration-300"
                        style={{
                          transform: `rotateX(12deg) rotateY(${orbitRotation}deg) scale(${zoomScale})`,
                          filter: `drop-shadow(0 20px 25px ${selectedProduct.threeDMeta?.glowColor || 'rgba(255,122,0,0.3)'})`
                        }}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>

                {/* 3D controls */}
                <div className="mt-4 space-y-2">
                  <div className="text-[10px] font-mono font-bold text-slate-500 uppercase flex justify-between items-center">
                    <span>HORIZONTAL ROTATOR</span>
                    <span className="text-orange-500 font-bold">{orbitRotation}° / 360°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={orbitRotation}
                    onChange={(e) => setOrbitRotation(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
                  />
                  
                  <div className="flex gap-2 justify-between">
                    <button onClick={() => setZoomScale(s => Math.max(0.8, s - 0.1))} className="text-[9px] p-1.5 px-3 bg-slate-200 rounded font-mono pointer-events-auto">ZOOM -</button>
                    <button onClick={() => { setOrbitRotation(0); setZoomScale(1.05); }} className="text-[9px] p-1.5 px-3 bg-slate-200 rounded font-mono pointer-events-auto">RESET</button>
                    <button onClick={() => setZoomScale(s => Math.min(1.4, s + 0.1))} className="text-[9px] p-1.5 px-3 bg-slate-200 rounded font-mono pointer-events-auto">ZOOM +</button>
                  </div>
                </div>
              </div>

              {/* Right Column: DETAILED PRODUCT DATA METADATA & SIMILAR RECOMMS */}
              <div className="md:w-1/2 p-6 flex flex-col justify-between max-h-[50vh] md:max-h-[95vh] overflow-y-auto">
                <div className="space-y-4 text-left">
                  <div>
                    <span className="text-[9px] tracking-wider uppercase font-extrabold bg-orange-100 text-orange-700 px-2.5 py-1 rounded">
                      {selectedProduct.categoryId.toUpperCase()}
                    </span>
                    <h3 className="text-xl font-bold font-display text-slate-900 tracking-tight mt-1.5">{selectedProduct.title}</h3>
                    <p className="text-slate-400 text-[11px] mt-0.5">Penjual: <span className="text-slate-700 font-bold">{selectedProduct.storeName || "Neon Labs 3D"}</span></p>
                  </div>

                  <p className="text-xl font-black text-slate-900 font-mono">
                    Rp {selectedProduct.price.toLocaleString("id-ID")}
                  </p>

                  <div className="space-y-1">
                    <p className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Detail Fitur & Spek</p>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">{selectedProduct.description}</p>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <div className="p-1 px-2.5 bg-slate-100 rounded-lg text-slate-600 flex items-center gap-1">Stok: <span className="font-extrabold text-slate-900">{selectedProduct.stock}</span></div>
                    <div className="p-1 px-2.5 bg-slate-100 rounded-lg text-slate-600 flex items-center gap-1">Rating: <span className="font-extrabold text-slate-900">{selectedProduct.rating} ★</span></div>
                    {currentUser && (
                      <button
                        onClick={(e) => handleToggleWishlist(selectedProduct.id, e)}
                        className="p-1.5 px-2.5 border rounded-lg hover:bg-slate-100 cursor-pointer pointer-events-auto flex items-center gap-1.5 text-slate-600 ml-auto"
                      >
                        <Heart className={`w-3.5 h-3.5 ${currentUser.favorites?.includes(selectedProduct.id) ? 'text-red-500 fill-red-500' : ''}`} /> Favorit
                      </button>
                    )}
                  </div>

                  {/* REKOMENDASI SERUPA (similar items recommended matching criteria underneath details modal) */}
                  <div className="pt-3 border-t">
                    <h4 className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase mb-2 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Rekomendasi Produk Serupa
                    </h4>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {similarProducts.slice(0, 2).map(prod => (
                        <div 
                          key={prod.id} 
                          onClick={() => { setSelectedProduct(prod); setActiveTab3DImage(0); }}
                          className="bg-slate-50 border p-2 rounded-xl text-left cursor-pointer hover:border-orange-500 hover:bg-orange-50/10 transition-all flex items-center gap-2"
                        >
                          <img src={prod.images[0]} alt="" className="w-10 h-10 rounded object-cover" />
                          <div className="truncate">
                            <p className="text-[10px] font-bold text-slate-850 truncate">{prod.title}</p>
                            <p className="text-[9px] font-mono text-orange-600 font-black">Rp {prod.price?.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* REVIEWS DISCUSSIONS CORNER */}
                  <div className="pt-3.5 border-t">
                    <h4 className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase mb-2 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-current" /> Penilaian Shopper ({activeReviews.length})
                    </h4>
                    
                    {activeReviews.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic">Belum ada review untuk barang ini.</p>
                    ) : (
                      <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                        {activeReviews.map((rev) => (
                          <div key={rev.id} className="p-3 bg-slate-50 border border-slate-150 rounded-2xl space-y-2 text-left">
                            {/* Header: User Avatar & Rating */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <img 
                                  src={rev.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde.jpg"} 
                                  className="w-6 h-6 rounded-full object-cover border border-slate-200" 
                                  alt="" 
                                />
                                <div>
                                  <p className="text-[11px] font-extrabold text-slate-800 leading-tight">{rev.username}</p>
                                  <span className="text-[8px] text-slate-400 font-mono">
                                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('id-ID') : 'Baru saja'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex text-amber-500 text-[10px]">
                                {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                              </div>
                            </div>

                            {/* Comment Content */}
                            <p className="text-[11px] text-slate-600 leading-relaxed font-sans">{rev.comment}</p>

                            {/* Attachments - Photo and/or Video */}
                            {(rev.photoUrl || rev.videoUrl) && (
                              <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t border-dashed border-slate-200/60">
                                {rev.photoUrl && (
                                  <div 
                                    onClick={() => setExpandedReviewPhoto(rev.photoUrl!)}
                                    className="relative w-11 h-11 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:border-orange-500 group transition-all"
                                    title="Perbesar Foto Ulasan"
                                  >
                                    <img src={rev.photoUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <span className="text-[7px] text-white font-bold bg-black/40 px-1 rounded">LIHAT</span>
                                    </div>
                                  </div>
                                )}
                                
                                {rev.videoUrl && (
                                  <button 
                                    type="button"
                                    onClick={() => setPlayingVideoUrl(rev.videoUrl!)}
                                    className="h-11 px-2.5 bg-orange-500/10 border border-orange-200/60 text-orange-600 rounded-xl hover:bg-orange-500/20 cursor-pointer pointer-events-auto flex items-center gap-1.5 transition-all outline-none"
                                    title="Putar Video Unboxing"
                                  >
                                    <div className="w-4.5 h-4.5 rounded-full bg-orange-500 text-white flex items-center justify-center animate-pulse shrink-0">
                                      <svg className="w-2 h-2 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    </div>
                                    <div className="text-left leading-none">
                                      <p className="text-[9px] font-black uppercase tracking-tight text-orange-700">Video unboxing</p>
                                      <p className="text-[7.5px] text-slate-500 font-mono mt-0.5">📹 Mulai Play</p>
                                    </div>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Submit feedback with Photos and Video togglers */}
                    <form onSubmit={handlePostReviewSubmit} className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                      <p className="text-[10px] font-black text-slate-700 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Tulis Penilaian Anda
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <input
                          type="text"
                          required
                          placeholder="Nama Anda"
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          className="w-full border px-3 py-2 rounded-xl bg-white focus:outline-none focus:border-orange-500"
                        />
                        <select
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                          className="w-full border px-3 py-2 rounded-xl bg-white focus:outline-none focus:border-orange-500 font-semibold text-slate-700"
                        >
                          <option value="5">⭐⭐⭐⭐⭐ 5 Bintang</option>
                          <option value="4">⭐⭐⭐⭐ 4 Bintang</option>
                          <option value="3">⭐⭐⭐ 3 Bintang</option>
                        </select>
                      </div>

                      {/* Unboxing media option simulator */}
                      <div className="space-y-1 text-left">
                        <p className="text-[8.5px] uppercase font-bold text-slate-400 font-mono tracking-wider">Simulasikan Media Lampiran (Foto / Video)</p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (reviewPhotoUrl) {
                                setReviewPhotoUrl('');
                              } else {
                                setReviewPhotoUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe.jpg');
                              }
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-[9px] font-bold border flex items-center gap-1 cursor-pointer pointer-events-auto transition-all ${
                              reviewPhotoUrl 
                                ? 'bg-orange-500 text-white border-orange-500 shadow-sm' 
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            📸 {reviewPhotoUrl ? 'Foto Terlampir' : 'Lampirkan Foto Demo'}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              if (reviewVideoUrl) {
                                setReviewVideoUrl('');
                              } else {
                                setReviewVideoUrl('https://www.w3schools.com/html/mov_bbb.mp4');
                              }
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-[9px] font-bold border flex items-center gap-1 cursor-pointer pointer-events-auto transition-all ${
                              reviewVideoUrl 
                                ? 'bg-orange-500 text-white border-orange-500 shadow-sm' 
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            📹 {reviewVideoUrl ? 'Video Terlampir' : 'Lampirkan Video Unboxing'}
                          </button>
                        </div>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="Tulis ulasan penilaian jastip..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="w-full border pl-3 pr-16 py-2 rounded-xl text-xs bg-white focus:outline-none focus:border-orange-500"
                        />
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="absolute right-1.5 top-1.5 bg-orange-505 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg pointer-events-auto transition-all"
                        >
                          {submittingReview ? 'Kirim...' : 'Kirim'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* SELLER PROFILES & ONLINE STATUS DASHBOARDS */}
                <div className="pt-4 border-t flex flex-col gap-2.5">
                  <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-3xl text-xs text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-full blur-xl" />
                    
                    <p className="text-[8.5px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-2.5">Profil Merchant Jastiper</p>
                    
                    <div className="flex items-center gap-3">
                      {/* Merchant Shop Logo/Avatar with breath online indicator */}
                      <div className="relative w-11 h-11 bg-white border border-slate-200 rounded-2xl flex items-center justify-center p-1.5 shadow-sm shrink-0">
                        <ShoppingBag className="w-5 h-5 text-orange-500" />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse" />
                      </div>
                      
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                          {selectedProduct.storeName || "Premium Jastiper Hub"}
                          <span className="text-[7.5px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                            ONLINE NOW
                          </span>
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-normal">Penyedia Jastip Resmi Terverifikasi KYC</p>
                        
                        {/* Rating stars & counts */}
                        <div className="flex items-center gap-1 pt-0.5">
                          <span className="text-[10px] font-black text-[#FF7A00] font-mono flex items-center gap-0.5">
                            <Star className="w-3.5 h-3.5 fill-current text-[#FF7A00]" /> 4.9 / 5.0
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[9px] text-slate-500 font-semibold font-mono">Kecepatan Balas (99%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Details Grid */}
                    <div className="grid grid-cols-2 gap-2.5 mt-3.5 pt-3 border-t border-slate-200/60 text-[10px]">
                      <div>
                        <p className="text-slate-400">Kecepatan Respon</p>
                        <p className="font-extrabold text-slate-850 font-mono">~ 5 Menit (Sangat Cepat)</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Total Jastip Sukses</p>
                        <p className="font-extrabold text-[#FF7A00] font-mono">150+ Transaksi Sukses</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Asal Hub (HQ)</p>
                        <p className="font-extrabold text-slate-850">
                          {selectedProduct.categoryId === "gadget" ? "Tokyo, JP & USA" : "Seoul, KR & ID"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Izin Operasional</p>
                        <p className="font-extrabold text-blue-600">Terproteksi Hub Escrow ✔</p>
                      </div>
                    </div>

                    {/* Merchant Chats */}
                    <div className="mt-3.5 pt-3 border-t border-slate-200/65 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setChatReceiver('cs');
                          setChatBoxOpen(true);
                          setSelectedProduct(null);
                        }}
                        className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl font-bold text-[10px] pointer-events-auto flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-500" /> Tanya Admin CS
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMerchantId(selectedProduct.sellerId || 'neon-labs');
                          setChatReceiver('seller');
                          setChatBoxOpen(true);
                          setSelectedProduct(null);
                        }}
                        className="flex-1 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl font-bold text-[10px] pointer-events-auto flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-orange-500" /> Chat Toko Penjual
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => { handleAddToCart(selectedProduct); setSelectedProduct(null); }}
                      className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl text-xs uppercase hover:bg-slate-50 active:scale-95 transition-all pointer-events-auto cursor-pointer"
                    >
                      Tambah ke Troli
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        window.open(`https://app.pakasir.com/pay/depodomain/${selectedProduct.price}?order_id=direct-${selectedProduct.id}-${Date.now()}`, '_blank');
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-500 text-white font-extrabold rounded-2xl text-xs uppercase shadow shadow-orange-500/10 active:scale-95 transition-all pointer-events-auto cursor-pointer flex items-center justify-center gap-1"
                    >
                      Beli Langsung (Pakasir)
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SHOPPING TROLLEY BASKET DRAWER OVERLAY */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between text-left"
            >
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <h3 className="text-lg font-bold font-display flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-orange-500" />
                    Keranjang TitipMart
                  </h3>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-1 px-3.5 bg-slate-100 hover:bg-slate-200 rounded text-xs pointer-events-auto"
                  >
                    Tutup
                  </button>
                </div>

                {/* Listing of cart items */}
                <div className="space-y-4 pt-4 overflow-y-auto max-h-[62vh] pr-1">
                  {cart.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                      <p className="text-sm">Keranjang belanja Anda kosong.</p>
                      <button 
                        onClick={() => setIsCartOpen(false)}
                        className="text-xs text-orange-500 font-bold mt-2 hover:underline cursor-pointer pointer-events-auto"
                      >
                        Mulai Cari Produk Populer
                      </button>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.product.id} className="flex gap-4 p-3 bg-slate-50 border rounded-2xl relative">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-16 h-16 object-cover rounded-xl"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 space-y-1">
                          <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.product.title}</h4>
                          <p className="text-xs font-bold text-orange-500">
                            Rp {item.product.price.toLocaleString("id-ID")}
                          </p>

                          <div className="flex items-center gap-3 pt-1">
                            <button
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="p-1 bg-slate-200 hover:bg-slate-300 rounded text-xs pointer-events-auto"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="p-1 bg-slate-200 hover:bg-slate-300 rounded text-xs pointer-events-auto"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="absolute right-3 top-3 p-1 text-slate-400 hover:text-red-500 pointer-events-auto transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Basket totals block */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-mono">SUBTOTAL ACCULATED</span>
                  <span className="text-xl font-extrabold text-slate-900 font-display">
                    Rp {cartTotalPrice.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCart([])}
                    disabled={cart.length === 0}
                    className="flex-1 py-3 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-default pointer-events-auto"
                  >
                    Kosongkan
                  </button>
                  <button
                    onClick={() => { setIsCartOpen(false); setCheckoutOpen(true); }}
                    disabled={cart.length === 0}
                    className="flex-2 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow shadow-orange-500/10 active:scale-95 transition-all text-center uppercase tracking-wide cursor-default pointer-events-auto"
                  >
                    Lanjut Beli Sekarang
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHECKOUT POPUPS */}
      <AnimatePresence>
        {checkoutOpen && cart.length > 0 && (
          <CheckoutModal
            cart={cart}
            totalPrice={cartTotalPrice}
            currentUser={currentUser}
            onClose={() => setCheckoutOpen(false)}
            onSuccess={(order: Order) => {
              setCart([]);
              setCheckoutOpen(false);
              fetchMarketplaceState(); 
            }}
          />
        )}
      </AnimatePresence>

      {/* FIRST TIME WELCOME DYNAMIC PROMOTION ANNOUNCEMENT POPUP */}
      {showPromoPopup && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-5 max-w-sm w-full relative shadow-3xl text-center border border-slate-100"
          >
            <button 
              onClick={() => setShowPromoPopup(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 pointer-events-auto"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
            
            {/* Embedded custom promotional/welcome image */}
            <div className="w-full h-40 rounded-2xl overflow-hidden mb-4 border border-slate-100 shadow-inner">
              <img 
                src="/images/welcome_promo_card_1779529424669.png" 
                alt="Welcome to TitipMart" 
                className="w-full h-full object-cover select-none"
              />
            </div>

            <h4 className="text-lg font-black font-display text-slate-900 leading-tight">Selamat Datang di TitipMart!</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Nikmati ekosistem Jasa Titip (Jastip) modern terpercaya dengan proteksi pembayaran, visual lookalike search, dan multi-vendor handal.
            </p>
            
            <div className="bg-orange-50/50 border border-orange-100/60 p-3 rounded-2xl my-3 text-left">
              <p className="text-[11px] font-bold text-orange-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Bonus Loyalitas Pengguna
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Lakukan Check-In harian pertama Anda sekarang untuk langsung mengklaim bonus koin loyalitas gratis!
              </p>
            </div>

            <button 
              onClick={() => { setShowPromoPopup(false); handleDailyCheckIn(); }}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider pointer-events-auto transition-all duration-200 shadow-md shadow-orange-500/10 active:scale-95 cursor-pointer"
            >
              Klaim Bonus Check-In
            </button>
          </motion.div>
        </div>
      )}

      {/* SETTINGS, PROFILE & SECURE CHANGES DIALOG PANE */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full relative shadow-2xl space-y-4 text-left border overflow-y-auto max-h-[92vh]"
          >
            <button onClick={() => setIsSettingsOpen(false)} className="absolute right-4 top-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-205 pointer-events-auto">
              <X className="w-4 h-4 text-slate-600" />
            </button>

            {currentUser ? (
              // -- USER LOGGED IN SETTINGS & PANEL --
              <div className="space-y-4">
                <div className="border-b pb-2 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-black font-display text-slate-900">Setelan & Profil Akun</h4>
                    <p className="text-[10px] text-slate-400">Kelola informasi pribadi, saldo dompet, dan keamanan.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setCurrentUser(null);
                      setAuthMode('login');
                      setAuthError('');
                      setAuthMessage('');
                      setCurrentRole('buyer');
                    }}
                    className="p-1 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold font-sans text-[10px] rounded-lg border border-red-200 cursor-pointer flex items-center gap-1 transition-all pointer-events-auto"
                  >
                    Keluar / Sign Out
                  </button>
                </div>

                {/* Account Info display */}
                <div className="p-4 bg-slate-50 border rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={currentUser.avatar} alt="Avatar" className="w-12 h-12 rounded-full border shadow-sm" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-none flex items-center gap-1.5">
                        {currentUser.username} 
                        <span className="p-0.5 px-2 bg-orange-100 text-orange-600 font-bold rounded text-[8px] font-mono tracking-wide">{currentUser.tier}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">{currentUser.email}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Hak Akses: <span className="font-bold text-slate-700 capitalize">{currentUser.role === 'admin' ? 'Administrator' : currentUser.role === 'seller' ? 'Penjual' : 'Pembeli'}</span></p>
                    </div>
                  </div>

                  <div className="pt-2 border-t flex justify-between items-center">
                    <div>
                      <span className="text-[8px] text-slate-400 block font-mono">SALDO DOMPET</span>
                      <span className="text-sm font-black text-slate-800 font-display">Rp {currentUser.walletBalance?.toLocaleString('id-ID')}</span>
                    </div>
                    {/* Top Up section */}
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleTopupSimulate(500000)} 
                        className="p-1 px-2.5 bg-orange-50 border border-orange-100 rounded-lg hover:bg-orange-100 hover:border-orange-205 text-[10px] font-bold text-orange-600 flex items-center justify-center transition-all cursor-pointer pointer-events-auto"
                      >
                        + Rp 500rb
                      </button>
                      <button 
                        onClick={() => handleTopupSimulate(2000000)} 
                        className="p-1 px-2.5 bg-orange-50 border border-orange-100 rounded-lg hover:bg-orange-100 hover:border-orange-205 text-[10px] font-bold text-orange-600 flex items-center justify-center transition-all cursor-pointer pointer-events-auto"
                      >
                        + Rp 2jt
                      </button>
                    </div>
                  </div>
                </div>

                {/* Edit Profile Form */}
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setAuthError('');
                    setAuthMessage('');
                    const formData = new FormData(e.currentTarget);
                    const updatedUsername = formData.get('username') as string;
                    const updatedEmail = formData.get('email') as string;
                    try {
                      const res = await fetch(apiUrl('/api/auth?action=profile'), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          id: currentUser.id, 
                          username: updatedUsername, 
                          email: updatedEmail 
                        })
                      });
                      const data = await res.json();
                      if (data.success) {
                        setCurrentUser(data.user);
                        setAuthMessage('Profil berhasil diperbaharui!');
                      } else {
                        setAuthError(data.error || 'Gagal mengubah profil.');
                      }
                    } catch {
                      setAuthError('Koneksi server terganggu.');
                    }
                  }}
                  className="space-y-3 pt-1 border-t text-xs text-left"
                >
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Ubah Data Profil</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-mono text-slate-400 block mb-1">NAMA LENGKAP</label>
                      <input name="username" required defaultValue={currentUser.username} className="w-full border p-2 rounded-lg bg-slate-50 text-xs" />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-slate-400 block mb-1">EMAIL ALAMAT</label>
                      <input name="email" required type="email" defaultValue={currentUser.email} className="w-full border p-2 rounded-lg bg-slate-50 text-xs" />
                    </div>
                  </div>
                  <button type="submit" className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-[10px] pointer-events-auto transition-all">Update Profil</button>
                </form>

                {/* Change Password settings */}
                <form onSubmit={handleUpdatePassword} className="space-y-2 border-t pt-3 text-xs">
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Ubah Kata Sandi Akun</p>
                  <input
                    type="password"
                    required
                    placeholder="Masukkan Sandi Baru Anda"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border p-2 rounded-lg bg-slate-50 text-xs"
                  />
                  <button type="submit" className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-[10px] pointer-events-auto transition-all">Ubah Sandi</button>
                </form>

                {/* Feedback form */}
                <form onSubmit={handleFeedbackSubmit} className="space-y-2 border-t pt-3 text-xs">
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Kirimkan Feedback & Saran Masukan</p>
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={feedbackCategory} 
                      onChange={(e) => setFeedbackCategory(e.target.value)} 
                      className="border p-1.5 rounded-lg bg-white text-xs"
                    >
                      <option value="General website">Saran Desain UI/UX</option>
                      <option value="Integrity gateway">Masalah Pembayaran Pakasir</option>
                      <option value="AI Recommendation error">Layanan Gemini AI</option>
                    </select>
                    <span className="text-[9px] text-slate-400 flex items-center leading-tight animate-pulse">Saran Anda memotivasi audit sistem kami.</span>
                  </div>
                  <textarea
                    required
                    rows={2}
                    placeholder="Tulis kritik, saran, masukan perbaikan di sini..."
                    value={feedbackContent}
                    onChange={(e) => setFeedbackContent(e.target.value)}
                    className="w-full border p-2 rounded-lg bg-slate-50 resize-none text-[10px]"
                  />
                  <button type="submit" className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-[10px] pointer-events-auto transition-all">Kirim Masukan</button>
                </form>

                {authMessage && <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ {authMessage}</p>}
                {authError && <p className="text-[10px] text-red-600 font-bold mt-1">⚠️ {authError}</p>}
              </div>
            ) : (
              // -- USER LOGGED OUT: LOGIN / REGISTER / PASSWORD RECOVERY FORM --
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h4 className="text-sm font-black font-display text-slate-900">Autentikasi Akun TitipMart</h4>
                  <p className="text-[10px] text-slate-400">Silakan masuk atau daftarkan akun baru untuk menikmati ekosistem TitipMart.</p>
                </div>

                {/* Toggles for Auth view state */}
                <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                  <button 
                    onClick={() => { setAuthMode('login'); setAuthMessage(''); setAuthError(''); }}
                    className={`flex-1 text-center py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${authMode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-white/40'}`}
                  >
                    Masuk
                  </button>
                  <button 
                    onClick={() => { setAuthMode('register'); setAuthMessage(''); setAuthError(''); }}
                    className={`flex-1 text-center py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${authMode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-white/40'}`}
                  >
                    Daftar Baru
                  </button>
                  <button 
                    onClick={() => { setAuthMode('forgot'); setAuthMessage(''); setAuthError(''); }}
                    className={`flex-1 text-center py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${authMode === 'forgot' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-white/40'}`}
                  >
                    Sandi Hilang
                  </button>
                </div>

                {/* Authentication form layout */}
                <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs text-left">
                  {authMode === 'register' && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-slate-400 block">NAMA LENGKAP</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Masukkan nama asli Anda" 
                        value={authUsername} 
                        onChange={(e) => setAuthUsername(e.target.value)} 
                        className="w-full border p-2.5 rounded-lg bg-slate-50"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-400 block">ALAMAT EMAIL</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="Masukkan alamat email aktif" 
                      value={authEmail} 
                      onChange={(e) => setAuthEmail(e.target.value)} 
                      className="w-full border p-2.5 rounded-lg bg-slate-50"
                    />
                  </div>

                  {authMode !== 'forgot' && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-slate-400 block">KATA SANDI</label>
                      <input 
                        type="password" 
                        required 
                        placeholder="Sandi minimal 6 karakter" 
                        value={authPassword} 
                        onChange={(e) => setAuthPassword(e.target.value)} 
                        className="w-full border p-2.5 rounded-lg bg-slate-50"
                      />
                    </div>
                  )}

                  {authMode === 'register' && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-slate-400 block">DAFTAR SEBAGAI</label>
                      <select 
                        id="registerRoleSelect"
                        className="w-full border p-2 rounded-lg bg-white text-xs font-sans"
                        onChange={(e) => {
                          const sEl = e.target as HTMLSelectElement;
                          const roleVal = sEl.value;
                          setAuthMessage(`Daftar Akun baru sebagai: ${roleVal === 'seller' ? 'Penjual' : 'Pembeli'}`);
                        }}
                      >
                        <option value="buyer">Pembeli (Dapat belanja, chat, KYC, & top up)</option>
                        <option value="seller">Penjual (Kelola produk toko, audit order, KYC doc)</option>
                      </select>
                    </div>
                  )}

                  {authMode === 'register' && (
                    <div className="flex items-start gap-2 pt-1.5">
                      <input 
                        type="checkbox" 
                        required 
                        id="termsCheckbox"
                        defaultChecked={true}
                        className="mt-0.5 pointer-events-auto cursor-pointer"
                      />
                      <label htmlFor="termsCheckbox" className="text-[9px] text-slate-500 leading-tight">
                        Saya setuju dengan <strong className="text-slate-700">Syarat & Ketentuan Layanan (Terms of Service)</strong> TitipMart serta melanjutkan registrasi.
                      </label>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl text-xs uppercase cursor-pointer hover:shadow-md transition-all mt-4 pointer-events-auto"
                  >
                    {authMode === 'login' ? 'Masuk Sekarang' : authMode === 'register' ? 'Daftar Akun Baru' : 'Kirim Instruksi Sandi'}
                  </button>
                </form>

                <div className="relative my-3 flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-[9px] text-slate-400 font-mono uppercase tracking-widest">Atau Masuk Dengan</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <div className="flex flex-col items-center justify-center space-y-3 pointer-events-auto w-full">
                  {/* Google Authenticator container */}
                  <div id="google-signin-btn-container" className="w-full flex justify-center" style={{ minHeight: "44px" }} />
                  
                  {/* Backup / Simulator for popup context blockers */}
                  <button
                    type="button"
                    onClick={() => {
                      const email = prompt("Masukkan Alamat Email Google Anda:", "pembeli.google@gmail.com");
                      if (email) {
                        const name = prompt("Masukkan Nama Profil Google Anda:", "Akun Google Baru");
                        fetch(apiUrl('/api/auth/google-login'), {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email, username: name })
                        })
                        .then(r => r.json())
                        .then(d => {
                          if (d.user) {
                            setCurrentUser(d.user);
                            setIsSettingsOpen(false);
                            fetchMarketplaceState();
                            alert(`Berhasil masuk sebagai ${d.user.username} menggunakan Google Auth!`);
                          }
                        });
                      }
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-700 bg-slate-50 border hover:bg-slate-100 p-2.5 px-4 rounded-xl flex items-center gap-1.5 w-full justify-center transition-all cursor-pointer font-bold"
                  >
                    <svg className="w-3.5 h-3.5 text-red-500 fill-current" viewBox="0 0 24 24">
                      <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 5.92 1 1 5.92 1 12s4.92 11 11.24 11c6.59 0 11.01-4.604 11.01-11.196 0-.756-.08-1.332-.18-1.925H12.24z"/>
                    </svg>
                    Google Fast Auth
                  </button>
                </div>

                {/* Fast simulated account switch list */}
                <div className="pt-3 border-t">
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Masuk Cepat Demo Multi-Profil (Clean Slate)</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={async () => {
                        const r = await fetch(apiUrl('/api/auth/google-login'), {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: 'buyer.demo@marketdigi.me', username: 'Buyer Demo' })
                        });
                        const d = await r.json();
                        setCurrentUser(d.user);
                        setCurrentRole('buyer');
                        setIsSettingsOpen(false);
                        fetchMarketplaceState();
                      }}
                      className="p-1.5 border rounded-lg bg-orange-50/10 hover:bg-orange-50 border-orange-100 text-[9px] font-bold text-center cursor-pointer pointer-events-auto leading-tight"
                    >
                      Buyer Demo<br/><span className="text-slate-400 font-mono text-[8px]">0 Saldo</span>
                    </button>
                    <button
                      onClick={async () => {
                        // Register seller demo profile
                        const r = await fetch(apiUrl('/api/auth/google-login'), {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: 'seller.demo@marketdigi.me', username: 'Seller Demo' })
                        });
                        const d = await r.json();
                        
                        // Force role to seller
                        d.user.role = 'seller';
                        d.user.kycVerified = true;
                        
                        // Save choice
                        setCurrentUser(d.user);
                        setCurrentRole('seller');
                        setIsSettingsOpen(false);
                        fetchMarketplaceState();
                      }}
                      className="p-1.5 border rounded-lg bg-blue-50/10 hover:bg-blue-50 border-blue-100 text-[9px] font-bold text-center cursor-pointer pointer-events-auto leading-tight"
                    >
                      Seller Demo<br/><span className="text-slate-400 font-mono text-[8px]">Verified KYC</span>
                    </button>
                    <button
                      onClick={async () => {
                        const r = await fetch(apiUrl('/api/auth/google-login'), {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: 'perdhanariyan@gmail.com', username: 'Perdhana Riyan' })
                        });
                        const d = await r.json();
                        setCurrentUser(d.user);
                        setCurrentRole('admin');
                        setIsSettingsOpen(false);
                        fetchMarketplaceState();
                      }}
                      className="p-1.5 border border-red-200 rounded-lg bg-red-50/10 hover:bg-red-50 text-[9px] font-bold text-center cursor-pointer pointer-events-auto leading-tight text-red-700"
                    >
                      Riyan Admin<br/><span className="text-red-400 font-mono text-[8px]">Exclusive</span>
                    </button>
                  </div>
                </div>

                {authMessage && <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ {authMessage}</p>}
                {authError && <p className="text-[10px] text-red-600 font-bold mt-1">⚠️ {authError}</p>}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* FLOATING SPACE CHAT CORE (CS live chat and Seller direct chats) */}
      <AnimatePresence>
        {chatBoxOpen ? (
          <div className="fixed bottom-5 right-5 z-45 bg-white w-80 h-[380px] rounded-3xl border border-slate-205 shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Chat header area */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3 px-4 flex justify-between items-center text-left">
              <div>
                <h4 className="text-xs font-bold tracking-tight">Secured Live Communicator</h4>
                <div className="flex gap-2.5 mt-1 cursor-pointer">
                  <button 
                    onClick={() => setChatReceiver('cs')}
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-colors ${chatReceiver === 'cs' ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/70'}`}
                  >
                    CS Support (AI Failover)
                  </button>
                  <button 
                    onClick={() => setChatReceiver('seller')}
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-colors ${chatReceiver === 'seller' ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/70'}`}
                  >
                    Chat Seller Toko
                  </button>
                </div>
              </div>
              <button onClick={() => setChatBoxOpen(false)} className="p-1 rounded bg-white/10 hover:bg-white/20 pointer-events-auto">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Message streams lists scroll area */}
            <div className="p-3 overflow-y-auto space-y-2.5 flex-1 bg-slate-50/50 text-left">
              {chats
                .filter(msg => {
                  if (chatReceiver === 'cs') return msg.isCS;
                  return !msg.isCS;
                })
                .map(msg => {
                  const isMe = msg.senderId === currentUser?.id;
                  return (
                    <div key={msg.id} className={`max-w-[85%] text-xs p-2.5 rounded-2xl flex flex-col space-y-0.5 ${isMe ? 'bg-orange-500 text-white ml-auto rounded-tr-none' : 'bg-white text-slate-850 mr-auto rounded-tl-none border'}`}>
                      <span className="text-[8px] opacity-60 font-bold">{isMe ? 'Saya' : msg.senderName}</span>
                      <p className="whitespace-pre-line leading-normal">{msg.message}</p>
                      <span className="text-[7px] text-right block opacity-50 font-mono mt-0.5">{msg.timestamp.slice(11, 16)}</span>
                    </div>
                  );
                })}
            </div>

            {/* Input send message forms */}
            <form onSubmit={handleSendMessage} className="p-2 border-t flex gap-1.5 bg-white">
              <input
                type="text"
                required
                disabled={!currentUser}
                placeholder={currentUser ? "Ketik pesan..." : "Login terlebih dahulu untuk chat"}
                value={chatMessageInput}
                onChange={(e) => setChatMessageInput(e.target.value)}
                className="flex-1 px-3 py-1.5 border rounded-xl text-xs bg-slate-50"
              />
              <button 
                type="submit" 
                disabled={!currentUser}
                className="p-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl pointer-events-auto"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <button 
            onClick={() => setChatBoxOpen(true)}
            className="fixed bottom-5 right-5 z-45 p-3.5 bg-gradient-to-tr from-orange-500 to-amber-500 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer pointer-events-auto"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs font-bold pr-1">Bantuan CS & Chat</span>
          </button>
        )}
      </AnimatePresence>

      {/* Dynamic Unboxing Video Player Modal Overlay */}
      <AnimatePresence>
        {playingVideoUrl && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-3xl overflow-hidden max-w-lg w-full border border-slate-800 shadow-2xl relative"
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  📹 Video Unboxing Pembeli (TitipMart Verified)
                </span>
                <button
                  type="button"
                  onClick={() => setPlayingVideoUrl(null)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-bold pointer-events-auto cursor-pointer"
                >
                  Tutup
                </button>
              </div>
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <video 
                  src={playingVideoUrl} 
                  controls 
                  autoPlay 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-3.5 bg-slate-950/60 text-center">
                <p className="text-[10px] text-slate-400 font-sans">
                  Ulasan video asli dari shopper TitipMart jastip terverifikasi. Transaksi diproteksi Escrow.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Zoom Review Photo Modal Overlay */}
      <AnimatePresence>
        {expandedReviewPhoto && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4" 
            onClick={() => setExpandedReviewPhoto(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-xl w-full flex flex-col items-center gap-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 w-full">
                <img 
                  src={expandedReviewPhoto} 
                  className="w-full max-h-[75vh] object-contain mx-auto" 
                  alt="Review zoomed attachment" 
                />
                <button
                  type="button"
                  onClick={() => setExpandedReviewPhoto(null)}
                  className="absolute top-4 right-4 p-2 bg-slate-900/60 text-white rounded-full hover:bg-slate-900/90 duration-200 pointer-events-auto cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] font-bold text-slate-300 bg-slate-900/70 py-1.5 px-3.5 rounded-full font-mono tracking-wide">
                Klik dimana saja untuk menutup preview foto
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Platform central credits footers naming to TitipMart perfected */}
      <footer className="bg-slate-950 text-slate-200 border-t border-slate-900 pt-16 pb-12 mt-16 relative overflow-hidden select-none w-full">
        {/* Subtle orange glow inside footer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[150px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-900 text-left">
            {/* Column 1 - Brand description */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-2.5">
                <img src="/images/titipmart_logo_1779527060606.png" className="w-8 h-8 rounded-xl object-contain animate-pulse" alt="" />
                <span className="font-bold text-lg font-display text-white tracking-tight">TitipMart Hub</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2">
                Pionir ekosistem Jasa Titip (Jastip) multi-vendor-paling terpercaya dengan visual catalog 3D, enkripsi perlindungan escrow terpercaya, dan kecerdasan buatan terpadu.
              </p>
              <div className="flex gap-2.5 pt-1">
                <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-orange-500" />
                </div>
                <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400">
                  <Cpu className="w-4 h-4 text-blue-400" />
                </div>
                <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400">
                  <Award className="w-4 h-4 text-amber-500" />
                </div>
              </div>
            </div>

            {/* Column 2 - Category Links */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-black font-mono uppercase tracking-widest text-slate-400">Navigasi Belanja</h4>
              <ul className="space-y-1.5 text-xs text-slate-400 font-sans">
                <li><a href="#explore-showcase" className="hover:text-orange-500 transition-colors">Semua Kategori</a></li>
                <li><a href="#featured-products" className="hover:text-orange-500 transition-colors">Rekomendasi Utama</a></li>
                <li><span className="text-slate-650 block">Jastip Tokyo (Segera)</span></li>
                <li><span className="text-slate-650 block">Jastip USA (Segera)</span></li>
              </ul>
            </div>

            {/* Column 3 - Jastip Ecosystem features */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-black font-mono uppercase tracking-widest text-slate-400">Ekosistem Proteksi</h4>
              <div className="space-y-2 text-xs text-slate-450">
                <div className="flex items-start gap-2.5 pl-0.5">
                  <span className="bg-orange-500/15 text-[#FF7A00] p-1 rounded font-bold text-[9px] font-mono shrink-0">ESCROW</span>
                  <p className="text-[11px] leading-tight text-slate-400 mt-0.5 font-sans">Saldo aman terproteksi platform via Pakasir Gateway.</p>
                </div>
                <div className="flex items-start gap-2.5 pl-0.5">
                  <span className="bg-blue-500/15 text-blue-400 p-1 rounded font-bold text-[9px] font-mono shrink-0">VERIFIED</span>
                  <p className="text-[11px] leading-tight text-slate-400 mt-0.5 font-sans">Seluruh merchant wajib lolos audit verifikasi KYC yang ketat.</p>
                </div>
              </div>
            </div>

            {/* Column 4 - Partnership Support & Live indicators */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-black font-mono uppercase tracking-widest text-slate-400">Partner & Dukungan</h4>
              <p className="text-xs text-slate-400 leading-normal font-sans">
                Pertanyaan seputar jastip atau sengketa transaksi? Hubungi CS kami secara real-time.
              </p>
              <button 
                type="button"
                onClick={() => setChatBoxOpen(true)}
                className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-500/10 cursor-pointer text-center pointer-events-auto"
              >
                Pusat Chat Bantuan
              </button>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p className="font-mono">© 2026 TITIPMART PLATFORM INC. ALL RIGHTS RESERVED WORLDWIDE.</p>
            <div className="flex items-center gap-3 text-[9px] font-mono text-slate-500">
              <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" /> SERVER ONLINE
              </span>
              <span>•</span>
              <span>PAKASIR API VER: 2.11</span>
              <span>•</span>
              <span>SECURED SSL ENCRYPTED</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
