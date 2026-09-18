import React, { useState, useEffect } from "react";
import { adminApi } from "../../api";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Folder,
  Layers,
  ChevronRight,
  AlertCircle,
  UploadCloud,
  Check
} from "lucide-react";
import { toast } from "sonner";

export function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState("active");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      } else {
        toast.error(res.message || "Failed to fetch categories");
      }
    } catch {
      toast.error("Network error loading categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = (presetParentId?: string) => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setParentId(presetParentId || "");
    setDescription("");
    setImage("");
    setStatus("active");
    setModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name || "");
    setSlug(cat.slug || "");
    setParentId(cat.parent_id || "");
    setDescription(cat.description || "");
    setImage(cat.image || "");
    setStatus(cat.status || "active");
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    const toastId = toast.loading("Uploading category image to Cloudinary...");
    try {
      const res = await adminApi.uploadImage(files[0]);
      if (res.success && res.data?.url) {
        setImage(res.data.url);
        toast.success("Image uploaded", { id: toastId });
      } else {
        toast.error(res.message || "Upload failed", { id: toastId });
      }
    } catch {
      toast.error("Network error during upload", { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setSaving(true);
    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      parent_id: parentId || undefined,
      description: description.trim() || undefined,
      image: image.trim() || undefined,
      status
    };

    try {
      let res;
      if (editingCategory) {
        res = await adminApi.updateCategory(editingCategory.id, payload);
      } else {
        res = await adminApi.createCategory(payload);
      }

      if (res.success) {
        toast.success(editingCategory ? "Category updated!" : "Category created!");
        setModalOpen(false);
        fetchCategories();
      } else {
        toast.error(res.message || "Operation failed");
      }
    } catch {
      toast.error("Network error while saving category");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const toastId = toast.loading("Deleting category...");
    try {
      const res = await adminApi.deleteCategory(deleteTarget.id);
      if (res.success) {
        toast.success("Category deleted", { id: toastId });
        setDeleteTarget(null);
        fetchCategories();
      } else {
        toast.error(res.message || "Could not delete category", { id: toastId });
      }
    } catch {
      toast.error("Network error deleting category", { id: toastId });
    }
  };

  // Organize into Top Level vs Subcategories
  const topLevelCategories = categories.filter((c) => !c.parent_id);
  const subcategoriesMap: { [parentId: string]: any[] } = {};
  categories
    .filter((c) => c.parent_id)
    .forEach((sub) => {
      subcategoriesMap[sub.parent_id] = subcategoriesMap[sub.parent_id] || [];
      subcategoriesMap[sub.parent_id].push(sub);
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">Categories & Subcategories</h2>
          <p className="text-xs text-gray-500">Organize store taxonomy, navigation menus, and category banners</p>
        </div>

        <button
          type="button"
          onClick={() => openAddModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-800 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Categories Cards & Hierarchy */}
      {loading ? (
        <div className="p-16 text-center text-gray-500 space-y-3">
          <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold uppercase tracking-wider">Loading categories...</p>
        </div>
      ) : topLevelCategories.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-gray-100">
          <FolderTree className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900">No categories found</h3>
          <p className="text-xs text-gray-500 mt-1 mb-4">Add categories to organize your product inventory.</p>
          <button
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-semibold rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Create First Category
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {topLevelCategories.map((cat) => {
            const subs = subcategoriesMap[cat.id] || subcategoriesMap[cat.slug] || [];

            return (
              <div
                key={cat.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:border-gray-200"
              >
                {/* Main Category Header */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Folder className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900">{cat.name}</h3>
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                          /{cat.slug}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cat.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                        }`}>
                          {cat.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {cat.description || "Top-level category"} •{" "}
                        <span className="font-semibold text-gray-900">
                          {cat.product_count || 0} Products
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => openAddModal(cat.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-black hover:text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Subcategory
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(cat)}
                      className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-black transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(cat)}
                      className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subcategories Nested Section */}
                {subs.length > 0 && (
                  <div className="bg-gray-50/70 border-t border-gray-100 px-6 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      Subcategories ({subs.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {subs.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-3 bg-white rounded-2xl border border-gray-200/80 flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <div className="truncate">
                              <p className="text-xs font-bold text-gray-900 truncate">{sub.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono truncate">{sub.slug}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => openEditModal(sub)}
                              className="p-1 rounded-md text-gray-500 hover:text-black"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(sub)}
                              className="p-1 rounded-md text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <p className="text-xs text-gray-500">
                Configure taxonomy, parent-child links, and showcase thumbnail.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Fine Jewellery or Necklaces"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="fine-jewellery"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Parent Category (Leave empty for Top Level)
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">None (Top-level Category)</option>
                  {topLevelCategories
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Timeless elegance in every fine piece..."
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Image Input & Cloudinary Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Category Image URL or Upload
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <label className="px-3 py-2 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-1.5 cursor-pointer">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                {image && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 mt-2">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-black text-white hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Delete Category?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteTarget.name}"</span>? If products are currently linked to this category, deletion will be safely rejected.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
