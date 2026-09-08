import React from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '@/components/layout/StudentLayout';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import useCartStore from '@/hooks/useCart';
import { ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function StudentCartPage() {
  const { role } = useAuth();
  const { cartItems, updateQty, removeItem, clearCart, cartTotal, cartCount } = useCartStore();

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium tracking-[-1.5px] text-[#0a0a0a]">Pre-Order Tray</h1>
            <p className="text-xs text-[#6a6a6a] mt-1">
              Review reserved stationery items before selecting a counter pickup window
            </p>
          </div>
          {cartItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={clearCart}
              className="text-[#ff4d8b] hover:bg-[#ff4d8b]/10"
            >
              Empty Tray
            </Button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your pre-order tray is empty"
            description="Explore our campus stationery catalog to reserve notebooks, pens, lab manuals, and drawing tools."
            actionText="Browse Stationery Catalog"
            onAction={() => window.location.assign(`/${role}/catalog`)}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2 bg-[#fffaf0] rounded-[24px] border border-[#e5e5e5] p-6">
              <div className="border-b border-[#e5e5e5] pb-3 flex justify-between items-center text-xs font-semibold uppercase tracking-[1.5px] text-[#6a6a6a]">
                <span>Selected Stationery</span>
                <span>Qty & Subtotal</span>
              </div>
              <div className="divide-y divide-[#e5e5e5]">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQty={updateQty}
                    onRemove={removeItem}
                  />
                ))}
              </div>
              <div className="pt-5 mt-2 border-t border-[#e5e5e5]">
                <Link
                  to={`/${role}/catalog`}
                  className="inline-flex items-center text-xs font-semibold text-[#0a0a0a] hover:underline"
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Continue browsing more stationery supplies
                </Link>
              </div>
            </div>

            {/* Order Summary Box */}
            <div>
              <CartSummary total={cartTotal} itemCount={cartCount} />
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
