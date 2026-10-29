import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import StudentLayout from '@/components/layout/StudentLayout';
import StockBadge from '@/components/catalog/StockBadge';
import QuantitySelector from '@/components/catalog/QuantitySelector';
import Button from '@/components/ui/Button';
import { mockItems } from '@/mocks/items';
import { getItemById } from '@/services/inventoryService';
import { formatINR } from '@/utils/currency';
import useCartStore from '@/hooks/useCart';
import { useToast } from '@/components/ui/ToastProvider';
import { ArrowLeft, ShoppingBag, Check, Shield, Clock, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function StudentItemDetailPage() {
  const { itemId } = useParams();
  const [searchParams] = useSearchParams();
  const { role } = useAuth();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const setCartShop = useCartStore((s) => s.setCartShop);
  const toast = useToast();

  const shopQuery = searchParams.get('shop') || searchParams.get('shopId');
  const [liveItem, setLiveItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shopQuery) {
      setCartShop(shopQuery);
    }
  }, [shopQuery, setCartShop]);

  useEffect(() => {
    let isMounted = true;
    getItemById(itemId)
      .then((data) => {
        if (isMounted && data) {
          setLiveItem(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [itemId]);

  const item = liveItem;

  const currentStock = (shopQuery && item?.shopStocks && typeof item.shopStocks[shopQuery] === 'number')
    ? item.shopStocks[shopQuery]
    : (item?.stock || 0);

  if (!item && !loading) {
    return (
      <StudentLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-bold text-gray-900">Stationery Item Not Found</h2>
          <p className="text-xs text-gray-500 mt-2">This item may have been discontinued or moved.</p>
          <div className="mt-4">
            <Link to={`/${role}/catalog`}>
              <Button variant="primary" size="sm" icon={ArrowLeft}>
                Back to Catalog
              </Button>
            </Link>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const handleAddToCart = () => {
    addItem(item, qty, shopQuery);
    setAdded(true);
    toast.success('Added to Tray', `${qty}x ${item.name} added to pre-order.`);
    setTimeout(() => setAdded(false), 2000);
  };

  const isOutOfStock = currentStock <= 0;

  return (
    <StudentLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-teal-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Browse
        </button>

        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative bg-gray-100 flex items-center justify-center p-8 aspect-square md:aspect-auto">
            <img
              src={item.image}
              alt={item.name}
              className="max-h-96 w-full object-contain rounded-xl shadow-xs"
            />
            <div className="absolute top-4 left-4">
              <StockBadge stock={currentStock} lowStockThreshold={item.lowStockThreshold} />
            </div>
          </div>

          {/* Item details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
                  {item.category}
                </span>
                <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  SKU: {item.sku}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 leading-snug">{item.name}</h1>

              <div className="text-2xl font-black text-[#1e3a5f]">
                {formatINR(item.price)}
                <span className="text-xs font-normal text-gray-400 ml-2">including campus tax</span>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed pt-2 border-t border-gray-100">
                {item.description}
              </p>

              {/* Counter specs */}
              <div className="grid grid-cols-2 gap-3 pt-3 text-xs text-gray-600">
                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block">Shelf Stock Level</span>
                  <span className="font-semibold text-gray-900">{currentStock} units ready</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block">Dispatch Location</span>
                  <span className="font-semibold text-gray-900">BIT Central Store</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-gray-700">Pre-Order Quantity:</span>
                <QuantitySelector
                  quantity={qty}
                  onChange={setQty}
                  disabled={isOutOfStock}
                  max={Math.min(20, currentStock)}
                  size="md"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant={added ? 'navy' : 'secondary'}
                  size="lg"
                  className="flex-1"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  icon={added ? Check : ShoppingBag}
                >
                  {added ? 'Added to Tray' : 'Add to Tray'}
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1 bg-[#1a3a3a] hover:bg-[#254d4d]"
                  disabled={isOutOfStock}
                  onClick={() => {
                    addItem(item, qty, shopQuery);
                    navigate(`/${role}/checkout`);
                  }}
                  icon={Zap}
                >
                  Order Directly
                </Button>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-400 pt-2">
                <span className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5 text-[#1a3a3a]" /> Guaranteed Stock Reservation
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-[#1a3a3a]" /> Fast Store Dispatch
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
