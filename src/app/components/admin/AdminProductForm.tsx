import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { adminApi } from "../../api";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  Star,
  Info,
  Layers,
  Search,
  Sparkles,
  Link as LinkIcon,
  IndianRupee
} from "lucide-react";
import { toast } from "sonner";

export function AdminProductForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"general" | "pricing" | "variants" | "media" | "seo">("general");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [brand, setBrand] = useState("NB BEADS STUDIO");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [mrp, setMrp] = useState<number | "">(0);
  const [salePrice, setSalePrice] = useState<number | "">(0);
  const [stock, setStock] = useState<number | "">(10);
  const [sku, setSku] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [featured, setFeatured] = useState(false);
  const [trending, setTrending] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);
  const [status, setStatus] = useState("active");

  // Media
  const [thumbnail, setThumbnail] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Variants
  const [variants, setVariants] = useState<any[]>([]);
  const [varTitle, setVarTitle] = useState("");
  const [varSku, setVarSku] = useState("");
  const [varPrice, setVarPrice] = useState<number | "">("");
  const [varStock, setVarStock] = useState<number | "">("");

  // SEO
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");

  // Load Categories
  useEffect(() => {
    adminApi.getCategories().then((res) => {
      if (res.success && res.data) {
        setCategories(res.data);
        if (!category && res.data.length > 0) {
          setCategory(res.data[0].name);
        }
      }
    });
  }, []);

  // Load existing product if editing
  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      adminApi.getProduct(id).then((res) => {
        if (res.success && res.data) {
          const p = res.data;
          setName(p.name || "");
          setSlug(p.slug || "");
          setBrand(p.brand || "NB BEADS STUDIO");
          setCategory(p.category || "");
          setSubcategory(p.subcategory || "");
          setDescription(p.description || "");
          setShortDescription(p.short_description || "");
          setMrp(p.mrp ?? 0);
          setSalePrice(p.sale_price ?? 0);
          setStock(p.stock ?? 0);
          setSku(p.sku || "");
          setTags(p.tags || []);
          setColor(p.color || "");
          setSize(p.size || "");
          setFeatured(Boolean(p.featured));
          setTrending(Boolean(p.trending));
          setBestSeller(Boolean(p.best_seller));
          setStatus(p.status || "active");
          setThumbnail(p.thumbnail || "");
          setGalleryImages(p.gallery_images || []);
          setVariants(p.variants || []);
          if (p.seo) {
            setMetaTitle(p.seo.meta_title || "");
            setMetaDescription(p.seo.meta_description || "");
            setMetaKeywords(Array.isArray(p.seo.meta_keywords) ? p.seo.meta_keywords.join(", ") : "");
          }
        } else {
          toast.error("Failed to load product details");
          navigate("/admin/products");
        }
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  // Auto-generate slug and SKU when name changes if adding new
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit && !slug) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generatedSlug);
    }
    if (!isEdit && !sku && val.length >= 3) {
      const acronym = val
        .split(" ")
        .map((w) => w[0]?.toUpperCase() || "")
        .slice(0, 3)
        .join("");
      const rand = Math.floor(100 + Math.random() * 900);
      setSku(`LX-${acronym}-${rand}`);
    }
  };

  // Tag management
  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^,|,$/g, "");
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Image Upload handler (Cloudinary via backend)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const toastId = toast.loading(`Uploading image to Cloudinary...`);

    try {
      const file = files[0];
      const res = await adminApi.uploadImage(file);
      if (res.success && res.data?.url) {
        const url = res.data.url;
        toast.success(`Image uploaded (${res.data.provider || "Cloudinary"})`, { id: toastId });
        if (!thumbnail) {
          setThumbnail(url);
        } else {
          setGalleryImages([...galleryImages, url]);
        }
      } else {
        toast.error(res.message || "Failed to upload image", { id: toastId });
      }
    } catch {
      toast.error("Network error during image upload", { id: toastId });
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  // Add Image via URL
  const handleAddImageUrl = async () => {
    if (!imageUrlInput.trim()) return;
    setUploadingImage(true);
    const toastId = toast.loading("Processing image URL...");

    try {
      const res = await adminApi.uploadImageUrl(imageUrlInput.trim());
      if (res.success && res.data?.url) {
        const url = res.data.url;
        toast.success("Image added to gallery", { id: toastId });
        if (!thumbnail) {
          setThumbnail(url);
        } else {
          setGalleryImages([...galleryImages, url]);
        }
        setImageUrlInput("");
      } else {
        toast.error(res.message || "Failed to process image URL", { id: toastId });
      }
    } catch {
      toast.error("Network error fetching image URL", { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };

  // Variants management
  const handleAddVariant = () => {
    if (!varTitle.trim()) {
      toast.error("Please enter a variant title (e.g. 'Size: Large' or 'Color: Rose Gold')");
      return;
    }
    const newVariant = {
      title: varTitle.trim(),
      sku: varSku.trim() || `${sku}-V${variants.length + 1}`,
      price: Number(varPrice) || Number(salePrice) || 0,
      stock: Number(varStock) || 0
    };
    setVariants([...variants, newVariant]);
    setVarTitle("");
    setVarSku("");
    setVarPrice("");
    setVarStock("");
    toast.success(`Variant "${newVariant.title}" added`);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Calculate discount percentage
  const numMrp = Number(mrp) || 0;
  const numSale = Number(salePrice) || 0;
  const discountPct = numMrp > 0 && numMrp > numSale ? Math.round(((numMrp - numSale) / numMrp) * 100) : 0;

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Product name is required.");
      setActiveTab("general");
      return;
    }
    if (!sku.trim()) {
      toast.error("SKU is required.");
      setActiveTab("pricing");
      return;
    }
    if (!category.trim()) {
      toast.error("Please select a category.");
      setActiveTab("general");
      return;
    }
    if (numSale < 0 || numMrp < 0) {
      toast.error("Prices cannot be negative.");
      setActiveTab("pricing");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading(isEdit ? "Updating product..." : "Creating product...");

    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      brand: brand.trim() || undefined,
      category: category.trim(),
      subcategory: subcategory.trim() || undefined,
      description: description.trim() || "No description provided.",
      short_description: shortDescription.trim() || undefined,
      mrp: numMrp,
      sale_price: numSale,
      stock: Number(stock) || 0,
      sku: sku.trim().toUpperCase(),
      tags,
      color: color.trim() || undefined,
      size: size.trim() || undefined,
      featured,
      trending,
      best_seller: bestSeller,
      status,
      thumbnail: thumbnail.trim() || undefined,
      gallery_images: galleryImages,
      variants,
      seo: {
        meta_title: metaTitle.trim() || name.trim(),
        meta_description: metaDescription.trim() || shortDescription.trim() || "",
        meta_keywords: metaKeywords ? metaKeywords.split(",").map((k) => k.trim()) : tags
      }
    };

    try {
      let res;
      if (isEdit && id) {
        res = await adminApi.updateProduct(id, payload);
      } else {
        res = await adminApi.createProduct(payload);
      }

      if (res.success) {
        toast.success(isEdit ? "Product updated successfully!" : "Product created successfully!", {
          id: toastId
        });
        navigate("/admin/products");
      } else {
        toast.error(res.message || "Failed to save product", { id: toastId });
      }
    } catch {
      toast.error("Network error while saving product", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-gray-500 space-y-3">
        <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold uppercase tracking-wider">Loading product data...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-black hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">
              {isEdit ? `Edit: ${name || "Product"}` : "Create New Product"}
            </h2>
            <p className="text-xs text-gray-500">
              {isEdit ? `SKU: ${sku}` : "Enter product specifications, variants, pricing, and images"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/products"
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-800 shadow-md shadow-black/10 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {submitting ? "Saving..." : isEdit ? "Save Changes" : "Publish Product"}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto space-x-6 text-xs font-semibold">
        {[
          { id: "general", label: "General & Details" },
          { id: "pricing", label: "Pricing (₹) & Stock" },
          { id: "variants", label: `Variants (${variants.length})` },
          { id: "media", label: `Images & Cloudinary (${(thumbnail ? 1 : 0) + galleryImages.length})` },
          { id: "seo", label: "SEO & Search Preview" }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 font-semibold transition-all relative whitespace-nowrap cursor-pointer ${activeTab === tab.id
                ? "text-black border-b-2 border-black"
                : "text-gray-400 hover:text-gray-700"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: General Info */}
      {activeTab === "general" && (
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
          {/* Primary Product Image Upload Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-purple-50/20 border border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                  Product Image (Primary Display)
                </h3>
                <p className="text-[11px] text-gray-500">
                  Upload a photo from your device or enter an image URL.
                </p>
              </div>
              {galleryImages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("media")}
                  className="text-xs text-purple-600 font-semibold hover:underline"
                >
                  View all {1 + galleryImages.length} images in Media tab →
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              {/* Image Preview Box */}
              <div className="sm:col-span-4 flex justify-center">
                {thumbnail ? (
                  <div className="relative group w-36 h-36 rounded-2xl overflow-hidden border-2 border-black/20 bg-white shadow-sm">
                    <img
                      src={thumbnail.startsWith("http://localhost:8000") ? thumbnail.replace("http://localhost:8000", "") : thumbnail}
                      alt="Product Thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setThumbnail("")}
                        className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow cursor-pointer transition-transform hover:scale-110"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="absolute bottom-1.5 left-1.5 bg-black/85 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Main Thumbnail
                    </span>
                  </div>
                ) : (
                  <label className="w-36 h-36 rounded-2xl border-2 border-dashed border-gray-300 hover:border-purple-500 bg-white flex flex-col items-center justify-center text-gray-400 hover:text-purple-600 cursor-pointer transition-colors shadow-sm">
                    <UploadCloud className="w-8 h-8 mb-1 stroke-1" />
                    <span className="text-[11px] font-semibold">Upload Image</span>
                    <span className="text-[9px] text-gray-400">Click to choose</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Upload Actions */}
              <div className="sm:col-span-8 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors cursor-pointer shadow-sm">
                    <UploadCloud className="w-4 h-4" />
                    <span>{uploadingImage ? "Uploading..." : "Upload from Computer"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  {thumbnail && (
                    <button
                      type="button"
                      onClick={() => setThumbnail("")}
                      className="px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      Clear Image
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveTab("media")}
                    className="text-xs font-semibold text-gray-600 hover:text-black hover:underline"
                  >
                    Manage Multi-Image Gallery →
                  </button>
                </div>

                {/* URL paste input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Or paste an image URL (https://...)..."
                      className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    disabled={uploadingImage || !imageUrlInput.trim()}
                    className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Set URL
                  </button>
                </div>
                <p className="text-[10px] text-gray-400">
                  Supports JPG, PNG, WEBP files up to 10MB. Automatically processed and optimized.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Diamond Solitaire Ring"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="diamond-solitaire-ring"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black font-mono text-xs"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Brand / Collection
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="NB BEADS STUDIO Fine"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Subcategory
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Rings, Necklaces, Bracelets"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Short Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Short Description (Preview snippet)
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief one-line summary for category listings..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Full Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Full Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed craftmanship, materials, dimensions, and styling notes..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black leading-relaxed"
              />
            </div>

            {/* Tags Input */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Product Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Type tag and press Add..."
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-100 hover:bg-black hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Add Tag
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing & Stock Card directly in General Tab */}
            <div className="sm:col-span-2 p-5 rounded-2xl bg-gradient-to-r from-purple-50/40 via-emerald-50/30 to-gray-50 border border-purple-200/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                      Product Pricing & Inventory (₹ INR)
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Enter product price and inventory stock in Indian Rupee (₹)
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-purple-700 bg-purple-100/80 px-3 py-1 rounded-full">
                  Currency: ₹ INR
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
                {/* MRP */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    MRP / Original (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={mrp}
                      onChange={(e) => setMrp(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Sale Price */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Sale Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 bg-emerald-50/50 border border-emerald-300 rounded-xl text-sm font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Stock Units */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="10"
                  />
                </div>

                {/* Discount */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Discount Savings
                  </label>
                  <div className="h-10 px-3 rounded-xl bg-emerald-100/60 border border-emerald-200 flex items-center justify-between text-emerald-900 font-bold text-xs">
                    <span>Discount:</span>
                    <span>{discountPct > 0 ? `${discountPct}% OFF` : "None"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Pricing & Stock */}
      {activeTab === "pricing" && (
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* MRP */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                MRP (Original Price ₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {/* Sale Price */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Sale Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {/* Discount Preview */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Calculated Discount
              </label>
              <div className="h-10 px-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between text-emerald-800 font-bold text-sm">
                <span>Save</span>
                <span>{discountPct > 0 ? `${discountPct}% OFF` : "No discount"}</span>
              </div>
            </div>

            {/* SKU */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                SKU (Stock Keeping Unit) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="JW-GLN-001"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono uppercase font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Current Inventory Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Catalog Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="active">Active (Visible to Shoppers)</option>
                <option value="inactive">Inactive (Hidden Draft)</option>
                <option value="archived">Archived (Discontinued)</option>
              </select>
            </div>
          </div>

          {/* Highlights / Badges */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
              Special Display Flags
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-200 hover:bg-gray-100/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-black focus:ring-black"
                />
                <div>
                  <p className="text-xs font-bold text-gray-900">Featured Item</p>
                  <p className="text-[11px] text-gray-500">Showcases on store homepage</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-200 hover:bg-gray-100/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trending}
                  onChange={(e) => setTrending(e.target.checked)}
                  className="w-4 h-4 rounded text-black focus:ring-black"
                />
                <div>
                  <p className="text-xs font-bold text-gray-900">Trending Now</p>
                  <p className="text-[11px] text-gray-500">Highlighted in trending carousel</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-200 hover:bg-gray-100/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bestSeller}
                  onChange={(e) => setBestSeller(e.target.checked)}
                  className="w-4 h-4 rounded text-black focus:ring-black"
                />
                <div>
                  <p className="text-xs font-bold text-gray-900">Best Seller</p>
                  <p className="text-[11px] text-gray-500">Displays best-seller badge</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Variants */}
      {activeTab === "variants" && (
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">Product Variants</h3>
            <p className="text-xs text-gray-500">
              Configure different options for this product (e.g. Ring Sizes, Metal Colors, Stone Types)
            </p>
          </div>

          {/* Add Variant Form */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Add New Variant</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                value={varTitle}
                onChange={(e) => setVarTitle(e.target.value)}
                placeholder="Variant Title (e.g. Size 7, Rose Gold)"
                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black sm:col-span-2"
              />
              <input
                type="text"
                value={varSku}
                onChange={(e) => setVarSku(e.target.value)}
                placeholder="Variant SKU (optional)"
                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black font-mono"
              />
              <input
                type="number"
                step="0.01"
                value={varPrice}
                onChange={(e) => setVarPrice(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder={`Price (₹${salePrice || 0})`}
                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <input
                type="number"
                value={varStock}
                onChange={(e) => setVarStock(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Stock quantity for variant"
                className="max-w-[200px] px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
              >
                + Add Variant
              </button>
            </div>
          </div>

          {/* Variants Table */}
          {variants.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              No variants defined. This product will be sold as a single standard item.
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-100 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase">
                    <th className="py-3 px-4">Variant Title</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {variants.map((v, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-semibold text-gray-900">{v.title}</td>
                      <td className="py-3 px-4 font-mono text-gray-600">{v.sku}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">₹{Number(v.price).toFixed(2)}</td>
                      <td className="py-3 px-4">{v.stock} units</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(i)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Media & Cloudinary */}
      {activeTab === "media" && (
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Multi-Image Media Management</h3>
              <p className="text-xs text-gray-500">
                Upload image files to Cloudinary or paste remote public image URLs. First image is the primary thumbnail.
              </p>
            </div>
          </div>

          {/* Upload Zone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Upload to Cloudinary */}
            <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:border-black transition-colors text-center flex flex-col items-center justify-center bg-gray-50/50">
              <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-xs font-bold text-gray-900">Upload to Cloudinary CDN</p>
              <p className="text-[11px] text-gray-500 mt-0.5 mb-3">Supports JPG, PNG, WebP up to 10MB</p>
              <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors cursor-pointer">
                <span>Select Image File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>

            {/* URL Importer */}
            <div className="p-6 border border-gray-200 rounded-2xl bg-gray-50/50 flex flex-col justify-center space-y-2.5">
              <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" />
                Add from Remote Image URL
              </p>
              <p className="text-[11px] text-gray-500">
                Paste an Unsplash or supplier link. Backend will download and store it securely.
              </p>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  disabled={uploadingImage || !imageUrlInput.trim()}
                  className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Import
                </button>
              </div>
            </div>
          </div>

          {/* Current Gallery Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
              Gallery Images ({thumbnail ? 1 + galleryImages.length : 0})
            </h4>

            {!thumbnail && galleryImages.length === 0 ? (
              <div className="p-12 text-center border border-gray-100 rounded-2xl text-gray-400 text-xs">
                No images added yet. Upload files or paste URLs above.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Primary Thumbnail */}
                {thumbnail && (
                  <div className="group relative rounded-2xl overflow-hidden border-2 border-black aspect-square bg-gray-100 shadow-md">
                    <img src={thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                      Main Thumbnail
                    </span>
                    <button
                      type="button"
                      onClick={() => setThumbnail("")}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Secondary Gallery Images */}
                {galleryImages.map((imgUrl, i) => (
                  <div key={i} className="group relative rounded-2xl overflow-hidden border border-gray-200 aspect-square bg-gray-100">
                    <img src={imgUrl} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          // Swap this to primary thumbnail
                          const oldThumb = thumbnail;
                          setThumbnail(imgUrl);
                          setGalleryImages(galleryImages.filter((_, idx) => idx !== i).concat(oldThumb ? [oldThumb] : []));
                        }}
                        className="px-2 py-1 bg-white text-black text-[10px] font-bold rounded-md hover:bg-gray-200"
                      >
                        Set Main
                      </button>
                      <button
                        type="button"
                        onClick={() => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))}
                        className="p-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: SEO */}
      {activeTab === "seo" && (
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">SEO & Search Engine Optimization</h3>
            <p className="text-xs text-gray-500">
              Customize title tags and meta descriptions to improve Google and social media visibility.
            </p>
          </div>

          {/* Search Result Snippet Preview */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400">Google Search Preview</span>
            <p className="text-blue-700 font-medium text-base hover:underline cursor-pointer truncate">
              {metaTitle || name || "Product Name"} - NB BEADS STUDIO
            </p>
            <p className="text-emerald-800 text-xs font-mono">
              https://NB BEADS STUDIO.com/{category ? category.toLowerCase() : "shop"}/{slug || "product-slug"}
            </p>
            <p className="text-gray-600 text-xs line-clamp-2">
              {metaDescription || shortDescription || description || "Discover our premium handcrafted collection..."}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  SEO Meta Title
                </label>
                <span className="text-[11px] text-gray-400">{metaTitle.length} / 60 characters</span>
              </div>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={name ? `${name} - NB BEADS STUDIO Fine Jewellery` : "Custom Meta Title"}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  SEO Meta Description
                </label>
                <span className="text-[11px] text-gray-400">{metaDescription.length} / 160 characters</span>
              </div>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Compelling 1-2 sentences summarizing this luxury piece for search engine snippets..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Meta Keywords (Comma separated)
              </label>
              <input
                type="text"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                placeholder="gold necklace, luxury jewelry, handcrafted gift"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
