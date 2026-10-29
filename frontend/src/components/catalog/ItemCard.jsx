import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StockBadge from './StockBadge';
import QuantitySelector from './QuantitySelector';
import Button from '@/components/ui/Button';
import { formatINR } from '@/utils/currency';
import useCartStore from '@/hooks/useCart';
import { useToast } from '@/components/ui/ToastProvider';
import { ShoppingBag, Check, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ItemCard({ item, activeShop = null }) {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const toast = useToast();

  const [imgSrc, setImgSrc] = useState(item.image);

  // Keep imgSrc updated if item changes
  React.useEffect(() => {
    setImgSrc(item.image);
  }, [item.image]);

  const handleAddToCart = () => {
    addItem(item, qty, activeShop);
    setAdded(true);
    toast.success('Added to Pre-Order Tray', `${qty}x ${item.name} reserved.`);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleDirectOrder = () => {
    addItem(item, qty, activeShop);
    navigate(`/${role}/checkout`);
  };

  const currentStock = (activeShop?.id && item.shopStocks && typeof item.shopStocks[activeShop.id] === 'number')
    ? item.shopStocks[activeShop.id]
    : (typeof item.stock === 'number' ? item.stock : 0);
  const isOutOfStock = currentStock <= 0;

  return (
    <div className="group bg-[#fffaf0] rounded-[16px] border border-[#e5e5e5] hover:border-[#0a0a0a] transition-all flex flex-col overflow-hidden">
      {/* Image Container with fixed compact height */}
      <div className="relative h-44 w-full bg-[#f5f0e0] overflow-hidden flex-shrink-0">
        <img
          src={imgSrc}
          alt={item.name}
          onError={() => setImgSrc('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80')}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2.5 right-2.5">
          <StockBadge stock={currentStock} lowStockThreshold={item.lowStockThreshold} />
        </div>
        <div className="absolute top-2.5 left-2.5">
          <span className="text-[10px] uppercase tracking-[1px] font-semibold bg-[#fffaf0]/90 backdrop-blur-xs text-[#0a0a0a] px-2 py-0.5 rounded-full border border-[#e5e5e5]">
            {item.sku || 'SKU'}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[1px] text-[#6a6a6a] block mb-1">
            {item.category}
          </span>
          <Link
            to={`/${role}/catalog/${item.id}${activeShop?.id ? `?shop=${encodeURIComponent(activeShop.id)}` : ''}`}
            className="text-sm font-semibold text-[#0a0a0a] group-hover:text-[#ff4d8b] transition-colors line-clamp-1"
          >
            {item.name}
          </Link>
          <p className="text-xs text-[#6a6a6a] mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="mt-3.5 pt-3 border-t border-[#e5e5e5] space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] text-[#9a9a9a] uppercase tracking-wider block">Price</span>
              <span className="text-lg font-medium tracking-tight text-[#0a0a0a]">
                {formatINR(item.price)}
              </span>
            </div>

            {!isOutOfStock && (
              <QuantitySelector
                quantity={qty}
                onChange={setQty}
                max={Math.min(10, currentStock)}
                size="sm"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <Button
              variant="secondary"
              size="xs"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              icon={added ? Check : ShoppingBag}
              className="text-xs"
            >
              {added ? 'Added' : 'Tray'}
            </Button>
            <Button
              variant="primary"
              size="xs"
              disabled={isOutOfStock}
              onClick={handleDirectOrder}
              icon={Zap}
              className="text-xs bg-[#1a3a3a] hover:bg-[#254d4d]"
            >
              Order Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

