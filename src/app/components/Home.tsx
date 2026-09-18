import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { motion } from "motion/react";
import { api } from "../api";
import { Product } from "./CartContext";

interface CategoryItem {
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export function Home() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch categories and featured products from API
    Promise.all([
      api.getCategories(),
      api.getProducts({ featured: true })
    ]).then(([catRes, prodRes]) => {
      if (catRes.success && catRes.data) {
        // Map data to expected format with custom default paths
        const mappedCats = catRes.data.map((cat: any) => ({
          name: cat.name,
          slug: cat.slug,
          path: `/${cat.slug}`,
          description: cat.description || `Explore our beautiful ${cat.name} collection.`,
          image: cat.image || "https://images.unsplash.com/photo-1758995115560-59c10d6cc28f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
        }));
        setCategories(mappedCats);
      }
      if (prodRes.success && prodRes.data && prodRes.data.products) {
        setFeaturedProducts(prodRes.data.products);
      }
      setLoading(false);
    });
  }, []);


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-blue-900/30" />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full mb-8 border border-white/20"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">New Collection 2026</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold mb-6 tracking-tighter"
          >
            Discover Luxury
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 tracking-tight font-light"
          >
            Curated collections for the discerning individual
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/jewellery"
              className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full hover:bg-gray-100 transition-all font-semibold text-lg hover:scale-105"
            >
              Explore Collection
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-full hover:bg-white/20 transition-all border border-white/20 font-semibold text-lg">
              View Lookbook
            </button>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3"
            >
              Explore
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold tracking-tighter"
            >
              Choose Your Path
            </motion.h2>
          </div>
          <Link
            to="/jewellery"
            className="hidden md:inline-flex items-center gap-2 text-sm font-medium hover:gap-4 transition-all"
          >
            Explore All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.path}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={category.path}
                className="group relative block aspect-[3/4] overflow-hidden rounded-3xl bg-gray-900 shadow-xl hover:shadow-2xl transition-all duration-500"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h3 className="text-2xl font-bold mb-2 tracking-tight">
                    {category.name}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4 font-light">
                    {category.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                    View All
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3"
              >
                Trending
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold tracking-tighter"
              >
                Featured Products
              </motion.h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter"
          >
            Join Our Exclusive Community
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 mb-10 text-lg font-light"
          >
            Subscribe to receive updates on new arrivals, special offers, and more
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="px-6 py-4 border-2 border-gray-200 rounded-full flex-1 focus:outline-none focus:border-black transition-colors font-medium"
            />
            <button className="px-8 py-4 bg-black text-white rounded-full hover:bg-gray-800 transition-all whitespace-nowrap font-semibold hover:scale-105">
              Subscribe
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}