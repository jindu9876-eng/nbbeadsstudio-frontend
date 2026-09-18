const BACKEND_BASE_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
const BASE_URL = BACKEND_BASE_URL ? `${BACKEND_BASE_URL}/api` : "/api";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
}

class ApiService {
  private getHeaders(contentType = "application/json"): HeadersInit {
    const headers: HeadersInit = {};
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Something went wrong",
          data: null as any,
          errors: data.errors
        };
      }
      return data;
    } catch (e) {
      return {
        success: false,
        message: "Network request failed or server returned non-JSON response",
        data: null as any
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password })
    });
    return this.handleResponse(res);
  }

  async signup(name: string, email: string, password: string): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ name, email, password })
    });
    return this.handleResponse(res);
  }

  async getProfile(): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: "GET",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  // Products
  async getProducts(params: {
    category?: string;
    search?: string;
    featured?: boolean;
    trending?: boolean;
    best_seller?: boolean;
  } = {}): Promise<ApiResponse> {
    const query = new URLSearchParams();
    if (params.category) query.append("category", params.category);
    if (params.search) query.append("search", params.search);
    if (params.featured !== undefined) query.append("featured", String(params.featured));
    if (params.trending !== undefined) query.append("trending", String(params.trending));
    if (params.best_seller !== undefined) query.append("best_seller", String(params.best_seller));
    
    // Default active products
    query.append("status", "active");

    const res = await fetch(`${BASE_URL}/products?${query.toString()}`, {
      method: "GET",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async getProduct(id: string): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: "GET",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  // Categories
  async getCategories(): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/categories?status=active`, {
      method: "GET",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  // System Settings (Storefront)
  async getSettings(): Promise<ApiResponse<{ hide_price_and_cart: boolean }>> {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: "GET",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  // Cart
  async getCart(): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/cart`, {
      method: "GET",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async addToCart(productId: string, quantity = 1): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/cart`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ product_id: productId, quantity })
    });
    return this.handleResponse(res);
  }

  async updateCartItem(productId: string, quantity: number): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/cart/${productId}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify({ quantity })
    });
    return this.handleResponse(res);
  }

  async removeFromCart(productId: string): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/cart/${productId}`, {
      method: "DELETE",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async clearCart(): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/cart/clear`, {
      method: "POST",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  // Wishlist
  async getWishlist(): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/wishlist`, {
      method: "GET",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async addToWishlist(productId: string): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/wishlist`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ product_id: productId })
    });
    return this.handleResponse(res);
  }

  async removeFromWishlist(productId: string): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/wishlist/${productId}`, {
      method: "DELETE",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  // Orders
  async placeOrder(items: Array<{ product_id: string; quantity: number }>, shippingAddress: {
    name: string;
    address: string;
    city: string;
    postal_code: string;
    phone: string;
  }, couponCode?: string): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        items,
        shipping_address: shippingAddress,
        coupon_code: couponCode || null
      })
    });
    return this.handleResponse(res);
  }

  async getOrders(): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: "GET",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }
}

export const api = new ApiService();

class AdminApiService {
  private getHeaders(contentType: string | null = "application/json"): HeadersInit {
    const headers: HeadersInit = {};
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    const token = localStorage.getItem("admin_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Request failed",
          data: null as any,
          errors: data.errors
        };
      }
      return data;
    } catch (e) {
      return {
        success: false,
        message: "Server error or invalid JSON response",
        data: null as any
      };
    }
  }

  // Auth
  async login(username: string, password: string): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    return this.handleResponse(res);
  }

  async getProfile(): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/admin/auth/me`, {
      method: "GET",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  // Analytics
  async getAnalytics(): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/admin/analytics`, {
      method: "GET",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  // Products
  async getProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    subcategory?: string;
    status?: string;
    stock_status?: string;
    sort_by?: string;
  } = {}): Promise<ApiResponse> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.search) query.append("search", params.search);
    if (params.category && params.category !== "all") query.append("category", params.category);
    if (params.subcategory && params.subcategory !== "all") query.append("subcategory", params.subcategory);
    if (params.status && params.status !== "all") query.append("status", params.status);
    if (params.stock_status && params.stock_status !== "all") query.append("stock_status", params.stock_status);
    if (params.sort_by) query.append("sort_by", params.sort_by);

    const res = await fetch(`${BASE_URL}/admin/products?${query.toString()}`, {
      method: "GET",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async getProduct(id: string): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/admin/products/${id}`, {
      method: "GET",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async createProduct(data: any): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/admin/products`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(res);
  }

  async updateProduct(id: string, data: any): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/admin/products/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(res);
  }

  async deleteProduct(id: string): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/admin/products/${id}`, {
      method: "DELETE",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async duplicateProduct(id: string): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/admin/products/${id}/duplicate`, {
      method: "POST",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async updateProductStatus(id: string, status: string): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/admin/products/${id}/status`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ status })
    });
    return this.handleResponse(res);
  }

  async updateProductStock(id: string, stock: number): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/admin/products/${id}/stock`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ stock })
    });
    return this.handleResponse(res);
  }

  async bulkAction(action: string, ids: string[]): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/admin/products/bulk-action`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ action, ids })
    });
    return this.handleResponse(res);
  }

  // Categories
  async getCategories(): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/admin/categories`, {
      method: "GET",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async createCategory(data: any): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/admin/categories`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(res);
  }

  async updateCategory(id: string, data: any): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/admin/categories/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(res);
  }

  async deleteCategory(id: string): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/admin/categories/${id}`, {
      method: "DELETE",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  // Inventory
  async getInventory(filterType = "all", search?: string): Promise<ApiResponse> {
    const query = new URLSearchParams();
    if (filterType && filterType !== "all") query.append("filter_type", filterType);
    if (search) query.append("search", search);

    const res = await fetch(`${BASE_URL}/admin/inventory?${query.toString()}`, {
      method: "GET",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  // Orders
  async getOrders(params: {
    page?: number;
    limit?: number;
    shipping_status?: string;
    payment_status?: string;
    search?: string;
  } = {}): Promise<ApiResponse> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.shipping_status && params.shipping_status !== "all") query.append("shipping_status", params.shipping_status);
    if (params.payment_status && params.payment_status !== "all") query.append("payment_status", params.payment_status);
    if (params.search) query.append("search", params.search);

    const res = await fetch(`${BASE_URL}/admin/orders?${query.toString()}`, {
      method: "GET",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async getOrderDetail(id: string): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/admin/orders/${id}`, {
      method: "GET",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async updateOrderStatus(id: string, shippingStatus: string, paymentStatus?: string): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/admin/orders/${id}/status`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify({
        shipping_status: shippingStatus,
        payment_status: paymentStatus
      })
    });
    return this.handleResponse(res);
  }

  async deleteOrder(id: string): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/admin/orders/${id}`, {
      method: "DELETE",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  // Customers
  async getCustomers(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}): Promise<ApiResponse> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.status && params.status !== "all") query.append("status", params.status);
    if (params.search) query.append("search", params.search);

    const res = await fetch(`${BASE_URL}/admin/customers?${query.toString()}`, {
      method: "GET",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async updateCustomerStatus(id: string, status: string): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/admin/customers/${id}/status`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ status })
    });
    return this.handleResponse(res);
  }

  // Uploads
  async uploadImage(file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/admin/upload`, {
      method: "POST",
      headers: this.getHeaders(null), // Let browser set boundary for multipart
      body: formData
    });
    return this.handleResponse(res);
  }

  async uploadImageUrl(url: string, folder?: string): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/admin/upload-url`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ url, folder })
    });
    return this.handleResponse(res);
  }

  // Bulk Import
  getTemplateDownloadUrl(format: "xlsx" | "csv" = "xlsx"): string {
    return `${BASE_URL}/admin/bulk/template?format=${format}`;
  }

  async validateBulkFile(file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/admin/bulk/validate`, {
      method: "POST",
      headers: this.getHeaders(null),
      body: formData
    });
    return this.handleResponse(res);
  }

  async executeBulkImport(
    rows: any[],
    duplicateAction = "skip",
    uploadImagesToCloudinary = false
  ): Promise<ApiResponse> {
    const res = await fetch(`${BASE_URL}/admin/bulk/import`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        rows,
        duplicate_action: duplicateAction,
        upload_images_to_cloudinary: uploadImagesToCloudinary
      })
    });
    return this.handleResponse(res);
  }

  // System Settings (Admin)
  async getSettings(): Promise<ApiResponse<{ hide_price_and_cart: boolean; updated_at?: string }>> {
    const res = await fetch(`${BASE_URL}/admin/settings`, {
      method: "GET",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async updateSettings(payload: { hide_price_and_cart: boolean }): Promise<ApiResponse<{ hide_price_and_cart: boolean }>> {
    const res = await fetch(`${BASE_URL}/admin/settings`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    return this.handleResponse(res);
  }

  async toggleCatalogMode(): Promise<ApiResponse<{ hide_price_and_cart: boolean }>> {
    const res = await fetch(`${BASE_URL}/admin/settings/toggle-price-cart`, {
      method: "POST",
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }
}

export const adminApi = new AdminApiService();
