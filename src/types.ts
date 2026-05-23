export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  role: 'buyer' | 'seller' | 'admin';
}

export interface AppUser extends User {
  walletBalance: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  lastCheckIn?: string;
  favorites: string[];
  recentlyViewed: string[];
  kycVerified?: boolean;
  kycDocUrl?: string;
  coins?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  message: string;
  timestamp: string;
  isCS?: boolean;
}

export interface PromoVo {
  id: string;
  code: string;
  discountPercent: number;
  description: string;
  active: boolean;
}

export interface Store {
  id: string;
  ownerId: string;
  storeName: string;
  description: string;
  rating: number;
  banner: string;
  createdAt: string;
}

export interface Product3DMappings {
  rotateX: number;
  rotateY: number;
  translateZ: number;
  glowColor: string;
  scale: number;
}

export interface Product {
  id: string;
  sellerId: string;
  storeName?: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categoryId: string;
  views: number;
  sales: number;
  rating: number;
  aiSuggested?: boolean;
  threeDMeta?: Product3DMappings;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name or Emoji
  bgGradient: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  shippingAddress: string;
  courier: string;
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  createdAt: string;
  items: OrderItem[];
  payment?: Payment;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Payment {
  id: string;
  orderId: string;
  invoiceId: string;
  qrisString: string;
  status: 'UNPAID' | 'PAID' | 'EXPIRED';
  amount: number;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  username: string;
  avatar: string;
  rating: number;
  comment: string;
  createdAt: string;
  photoUrl?: string;
  videoUrl?: string;
}

export interface LiveNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'review' | 'system' | 'payment';
  time: string;
}
