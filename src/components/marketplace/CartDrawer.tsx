import React from "react";
import { X, Trash2, Plus, Minus, CreditCard, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  stockQuantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  isCheckingOut?: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isCheckingOut = false,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-cream-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md bg-cream-50 border-l border-cream-200/80 shadow-2xl flex flex-col animate-slide-up h-full">
          {/* Header */}
          <div className="px-6 py-5 border-b border-cream-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-primary-dark flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Shopping Cart
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-cream-900/60 hover:text-primary rounded-lg hover:bg-cream-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-cream-200/40">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
                <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center text-cream-900/40">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h5 className="font-bold text-primary-dark">Your cart is empty</h5>
                  <p className="text-xs text-cream-900/50 mt-1">
                    Explore our products to find wellness remedies.
                  </p>
                </div>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  {/* Item Image */}
                  <div className="w-16 h-16 rounded-lg bg-cream-100 border border-cream-200 overflow-hidden shrink-0 flex items-center justify-center text-primary-light font-bold">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                    ) : (
                      item.name.charAt(0)
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-primary-dark line-clamp-1">
                        {item.name}
                      </h5>
                      <span className="text-xs font-semibold text-secondary">
                        ₹{item.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2.5 mt-2">
                      <div className="flex items-center border border-cream-300 rounded bg-white">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-2 py-1 text-cream-900/60 hover:text-primary disabled:opacity-30"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-cream-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stockQuantity}
                          className="px-2 py-1 text-cream-900/60 hover:text-primary disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-cream-900/40 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {items.length > 0 && (
            <div className="border-t border-cream-200 px-6 py-5 bg-white flex flex-col gap-4">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-cream-900/65">Subtotal</span>
                <span className="text-lg font-bold text-primary-dark">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-cream-900/40 font-sans leading-tight">
                Shipping and taxes calculated at checkout. Secured and processed via Razorpay.
              </p>
              <Button
                variant="secondary"
                onClick={onCheckout}
                isLoading={isCheckingOut}
                className="w-full flex items-center justify-center gap-2 py-3"
              >
                <CreditCard className="w-4.5 h-4.5" />
                Proceed to Checkout
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
