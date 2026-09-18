import { X, ShoppingCart, Heart } from "lucide-react";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { useSettings } from "./SettingsContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import { useState } from "react";

export function ProductDetailModal() {
  const { selectedProduct, closeProductDetail, addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { hidePriceAndCart } = useSettings();
  const [quantity, setQuantity] = useState(1);

  const isWishlisted = selectedProduct ? isInWishlist(selectedProduct.id) : false;

  if (!selectedProduct) return null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(selectedProduct);
    }
    closeProductDetail();
    setQuantity(1);
  };

  const displayPrice = selectedProduct.price
    ? selectedProduct.price.startsWith("$")
      ? `₹${selectedProduct.price.slice(1)}`
      : !selectedProduct.price.startsWith("₹")
      ? `₹${selectedProduct.price}`
      : selectedProduct.price
    : "₹0";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold tracking-tight">Product Details</h2>
          <button
            onClick={closeProductDetail}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-8 p-6">
            {/* Image */}
            <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100">
              <ImageWithFallback
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex flex-col">
              {selectedProduct.category && (
                <span className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm font-medium w-fit mb-4">
                  {selectedProduct.category}
                </span>
              )}
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                {selectedProduct.name}
              </h1>
              
              {!hidePriceAndCart && (
                <p className="text-3xl font-bold mb-6">{displayPrice}</p>
              )}

              <p className="text-gray-600 mb-8 leading-relaxed">
                {selectedProduct.description ||
                  "Experience luxury and elegance with this premium item. Crafted with attention to detail and designed to elevate your style. Perfect for those who appreciate quality and sophistication."}
              </p>

              {/* Features */}
              <div className="mb-8 space-y-3">
                <h3 className="font-semibold mb-3">Features:</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>✓ Premium quality materials</p>
                  <p>✓ Handcrafted with care</p>
                  <p>✓ Perfect for gifting</p>
                  <p>NO return policy</p>
                </div>
              </div>

              {/* Quantity (Only in Store Mode) */}
              {!hidePriceAndCart && (
                <div className="mb-6">
                  <label className="block font-semibold mb-3">Quantity</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 border-2 border-gray-200 rounded-full hover:bg-gray-100 transition-colors font-semibold cursor-pointer"
                    >
                      −
                    </button>
                    <span className="text-xl font-semibold w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 border-2 border-gray-200 rounded-full hover:bg-gray-100 transition-colors font-semibold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-auto">
                <button
                  type="button"
                  onClick={() => selectedProduct && toggleWishlist(selectedProduct)}
                  className={`border-2 rounded-full transition-all cursor-pointer ${
                    hidePriceAndCart
                      ? "flex-1 py-4 px-6 flex items-center justify-center gap-2"
                      : "p-4"
                  } ${
                    isWishlisted
                      ? "border-red-200 bg-red-50 text-red-600 scale-105"
                      : "border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-black"
                  }`}
                  title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                  {hidePriceAndCart && (
                    <span className="font-semibold text-sm">
                      {isWishlisted ? "Saved to Wishlist" : "Save to Wishlist"}
                    </span>
                  )}
                </button>
                {!hidePriceAndCart && (
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-black text-white py-4 px-6 rounded-full font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
