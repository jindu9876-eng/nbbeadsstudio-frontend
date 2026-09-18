import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { motion } from "motion/react";
import { SlidersHorizontal } from "lucide-react";
import { api } from "../api";
import { Product } from "./CartContext";

export function Macrame() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProducts({ category: "Macrame" }).then((res) => {
      if (res.success && res.data && res.data.products) {
        setProducts(res.data.products);
      }
      setLoading(false);
    });
  }, []);


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="text-center px-4 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-4"
          >
            Collection
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter"
          >
            Macrame
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-600 text-lg font-light max-w-2xl mx-auto"
          >
            Handcrafted bohemian beauty for your space. Each piece tells a unique story.
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <p className="text-gray-600 font-medium">{products.length} Products</p>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full border-2 border-gray-200 hover:border-black transition-colors font-medium">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>
    </div>
  );
}