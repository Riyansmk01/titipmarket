import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { Star, Eye, ShoppingCart, Cpu, Shirt, Sparkles, Home } from 'lucide-react';

interface ThreeDProductCardProps {
  key?: string;
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
}

export default function ThreeDProductCard({ product, onViewDetails, onAddToCart }: ThreeDProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Relative mouse coordinates from -0.5 to 0.5 inside card
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    // Max rotation 16 degrees
    const maxRotateX = 16;
    const maxRotateY = 16;
    
    setRotate({
      x: -y * maxRotateX,
      y: x * maxRotateY
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  // Icon mapping helper
  const renderCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'tech': return <Cpu className="w-3.5 h-3.5 text-amber-500" />;
      case 'wear': return <Shirt className="w-3.5 h-3.5 text-blue-500" />;
      case 'holo': return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
      default: return <Home className="w-3.5 h-3.5 text-teal-500" />;
    }
  };

  const defaultGlow = product.threeDMeta?.glowColor || 'rgba(255,122,0,0.3)';

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => onViewDetails(product)}
      className="relative cursor-pointer select-none group h-[440px] rounded-3xl p-4 bg-white border border-slate-100/80 shadow-md transition-all duration-300 flex flex-col justify-between"
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        transform: isHovered 
          ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(1.03)` 
          : 'rotateX(0deg) rotateY(0deg) scale(1)',
        boxShadow: isHovered 
          ? `0 20px 40px -10px rgba(0,0,0,0.1), 0 0 30px ${defaultGlow}`
          : '0 4px 12px rgba(15, 23, 42, 0.05)'
      }}
      id={`prod-card-${product.id}`}
    >
      {/* Glossy Reflection Overlay */}
      <div 
        className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-15 transition-opacity duration-300 bg-gradient-to-tr from-transparent via-white to-transparent"
        style={{
          transform: `translateZ(40px)`,
        }}
      />

      <div>
        {/* Card Header Info */}
        <div className="flex justify-between items-center mb-3" style={{ transform: 'translateZ(20px)' }}>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-100">
            {renderCategoryIcon(product.categoryId)}
            {product.categoryId.toUpperCase()}
          </span>

          <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-lg border border-amber-100">
            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
            <span className="text-xs font-bold text-amber-700">{product.rating}</span>
          </div>
        </div>

        {/* 3D Product Image Container */}
        <div 
          className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center mb-4 transition-transform duration-300"
          style={{ 
            transform: isHovered ? 'translateZ(50px) scale(1.05)' : 'translateZ(0px)',
          }}
        >
          <img
            src={product.images[0]}
            alt={product.title}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          
          {/* Quick Info Action button overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <button 
              className="p-3 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
              title="Quick View 3D"
            >
              <Eye className="w-5 h-5 text-orange-500 font-bold" />
            </button>
          </div>

          {/* Stock state indicator */}
          {product.stock <= 5 && (
            <span className="absolute bottom-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              LTD STOCK: {product.stock}
            </span>
          )}
        </div>

        {/* Brand store Name info */}
        <p className="text-[11px] font-mono tracking-wider uppercase text-slate-400 mb-1" style={{ transform: 'translateZ(20px)' }}>
          {product.storeName || "Premium Seller"}
        </p>

        {/* Product Title */}
        <h3 
          className="text-base font-semibold font-display text-slate-900 leading-tight line-clamp-2"
          style={{ transform: 'translateZ(30px)' }}
        >
          {product.title}
        </h3>
      </div>

      {/* Footer Content */}
      <div 
        className="mt-4 flex justify-between items-center"
        style={{ transform: 'translateZ(25px)' }}
      >
        <div className="flex flex-col">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">RP PRICE</span>
          <span className="text-lg font-bold text-slate-900 font-display">
            Rp {product.price.toLocaleString("id-ID")}
          </span>
        </div>

        {/* Checkout basket speed dial trigger */}
        <button
          onClick={(e) => onAddToCart(product, e)}
          className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all duration-200"
          id={`add-to-cart-${product.id}`}
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
