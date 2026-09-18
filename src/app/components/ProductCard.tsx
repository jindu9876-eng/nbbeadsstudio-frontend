import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import { useCart, Product } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { useSettings } from "./SettingsContext";
import { Heart } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  image?: string;
  thumbnail?: string;
  gallery_images?: string[];
  category?: string;
  description?: string;
}

export function ProductCard({ id, name, price, image, thumbnail, gallery_images, category, description }: ProductCardProps) {
  const { openProductDetail } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { hidePriceAndCart } = useSettings();

  let displayImage = image || thumbnail || (gallery_images && gallery_images[0]) || "";
  if (displayImage && displayImage.startsWith("http://localhost:8000")) {
    displayImage = displayImage.replace("http://localhost:8000", "");
  }

  let displayPrice = price || "₹0";
  if (displayPrice.startsWith("$")) {
    displayPrice = `₹${displayPrice.slice(1)}`;
  } else if (!displayPrice.startsWith("₹")) {
    displayPrice = `₹${displayPrice}`;
  }

  const product: Product = { id, name, price: displayPrice, image: displayImage, category, description };
  const wishlisted = isInWishlist(id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group cursor-pointer"
      onClick={() => openProductDetail(product)}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-100 mb-3 sm:mb-4 shadow-md sm:shadow-lg">
        <ImageWithFallback
          src={displayImage}
          alt={name}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        
        {/* Category Pill */}
        {category && (
          <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] tracking-wider font-semibold text-gray-900 shadow-xs max-w-[65%] truncate">
            {category}
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer ${
            wishlisted
              ? "bg-white text-red-500 shadow-md scale-105"
              : "bg-white/80 hover:bg-white text-gray-700 hover:text-red-500 opacity-90 group-hover:opacity-100 hover:scale-110"
          }`}
          title={wishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform active:scale-125 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 text-white transform translate-y-1 sm:translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-xs sm:text-lg font-semibold mb-0.5 sm:mb-1 line-clamp-1">{name}</h3>
          {!hidePriceAndCart ? (
            <p className="text-sm sm:text-xl font-bold">{displayPrice}</p>
          ) : (
            <p className="text-[10px] sm:text-xs font-medium text-white/80 tracking-wider uppercase">Catalog Only</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
