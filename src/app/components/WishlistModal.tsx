import { X, Heart, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useWishlist } from "./WishlistContext";
import { useCart } from "./CartContext";
import { useSettings } from "./SettingsContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";

export function WishlistModal() {
  const { wishlist, isWishlistOpen, closeWishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, openCart } = useCart();
  const { hidePriceAndCart } = useSettings();

  if (!isWishlistOpen) return null;

  const handleAddToCart = (item: any) => {
    addToCart(item);
    toast.success(`"${item.name}" moved to cart! 🛍️`);
  };

  const handleMoveAllToCart = () => {
    if (wishlist.length === 0) return;
    wishlist.forEach((item) => addToCart(item));
    toast.success(`All ${wishlist.length} items added to your cart! 🛍️`);
    closeWishlist();
    openCart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900">My Wishlist</h2>
              <p className="text-xs text-gray-500">
                {wishlist.length} saved item{wishlist.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <button
            onClick={closeWishlist}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-6">
          {wishlist.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto text-gray-300">
                <Heart className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Your wishlist is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
                  Tap the heart icon on any product to save it to your personal wishlist and buy later.
                </p>
              </div>
              <button
                type="button"
                onClick={closeWishlist}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white text-xs font-semibold rounded-full hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlist.map((item) => {
                let displayPrice = item.price || "₹0";
                if (displayPrice.startsWith("$")) {
                  displayPrice = `₹${displayPrice.slice(1)}`;
                } else if (!displayPrice.startsWith("₹")) {
                  displayPrice = `₹${displayPrice}`;
                }

                let displayImg = item.image;
                if (displayImg && displayImg.startsWith("http://localhost:8000")) {
                  displayImg = displayImg.replace("http://localhost:8000", "");
                }

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-gray-200 transition-colors group"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-white shrink-0 border border-gray-100">
                      <ImageWithFallback
                        src={displayImg}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate">{item.name}</h4>
                      {item.category && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
                      )}
                      {!hidePriceAndCart && (
                        <p className="text-sm font-extrabold text-black mt-1">{displayPrice}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!hidePriceAndCart && (
                        <button
                          type="button"
                          onClick={() => handleAddToCart(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
                          title="Add to Shopping Cart"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Add to Cart</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => removeFromWishlist(item.id)}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {wishlist.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={clearWishlist}
              className="text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors cursor-pointer px-3 py-2"
            >
              Clear Wishlist
            </button>

            {!hidePriceAndCart && (
              <button
                type="button"
                onClick={handleMoveAllToCart}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Move All to Cart</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
