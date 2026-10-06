import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Category, 
  SubCategory, 
  Service, 
  CartItem, 
  UserProfile, 
  UserRole, 
  LocationData, 
  OrderBooking, 
  UserAddress, 
  ServiceHub,
  CustomRequest,
  CustomRequestStatus
} from '../types';
import { resolveUserByIdentifier, RecognizedAccount } from '../lib/authConfig';
import { signOutFirebase } from '../lib/firebase';
import { DEFAULT_SERVICE_HUBS, checkServiceability, reverseGeocode, calculateDistanceKm, estimateEtaMinutes } from '../lib/geo';
import { toast } from 'sonner';
import { authFetch } from '../lib/authClient';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_SUBCATEGORIES, 
  INITIAL_SERVICES, 
  INITIAL_ORDERS,
  INITIAL_CUSTOM_REQUESTS
} from '../data/fallbackCatalog';

// Default starter doorstep addresses (empty by default; users add real doorstep addresses)
export const DEFAULT_SAVED_ADDRESSES: UserAddress[] = [];

// Re-export fallback constants for backwards-compatibility with scripts and types
export { INITIAL_CATEGORIES, INITIAL_SUBCATEGORIES, INITIAL_SERVICES, INITIAL_ORDERS, INITIAL_CUSTOM_REQUESTS };


export interface AppState {
  // Backend Catalog State & Async Sync
  isLoadingCatalog: boolean;
  catalogError: string | null;
  fetchCatalog: () => Promise<void>;

  // Categories (Admin-editable & Cloud-persisted)
  categories: Category[];
  updateCategory: (id: string, updates: Partial<Category>) => Promise<boolean>;
  addCategory: (newCat: Omit<Category, 'id'>) => Promise<Category | null>;
  deleteCategory: (id: string) => Promise<boolean>;
  reorderCategories: (newCats: Category[]) => void;

  // SubCategories (Two-Step Admin Hierarchy & Cloud-persisted)
  subCategories: SubCategory[];
  activeSubCategorySlug: string;
  setActiveSubCategorySlug: (slug: string) => void;
  addSubCategory: (newSub: Omit<SubCategory, 'id'>) => Promise<SubCategory | null>;
  updateSubCategory: (id: string, updates: Partial<SubCategory>) => Promise<boolean>;
  deleteSubCategory: (id: string) => Promise<boolean>;
  getSubCategoriesByCategory: (categorySlug: string) => SubCategory[];

  // Services (Catalog from API)
  services: Service[];
  activeCategorySlug: string;
  setActiveCategorySlug: (slug: string) => void;
  selectedService: Service | null;
  setSelectedService: (service: Service | null) => void;

  // Full-screen Search Experience
  isSearchOpen: boolean;
  searchQuery: string;
  recentSearches: string[];
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (service: Service) => void;
  removeFromCart: (serviceId: string) => void;
  updateQuantity: (serviceId: string, quantity: number) => void;
  clearCart: () => void;
  isCartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  getCartMetrics: () => {
    totalItems: number;
    subtotal: number;
    inspectionFee: number;
    platformFee: number;
    discount: number;
    grandTotal: number;
  };

  // User & Roles (3 Roles: user, partner, admin)
  user: UserProfile | null;
  activeRole: UserRole;
  isAuthModalOpen: boolean;
  authModalInitialRole: UserRole;
  setAuthModalOpen: (open: boolean, role?: UserRole) => void;
  setUser: (user: UserProfile | null) => void;
  syncUserToCloud: (user?: UserProfile | null) => Promise<void>;
  fetchUserAddresses: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  setActiveRole: (role: UserRole) => void;
  loginSimulated: (role: UserRole, phoneOrEmail: string, name: string) => void;
  loginWithFirebaseUser: (firebaseUser: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    phoneNumber: string | null;
  }) => RecognizedAccount;
  logout: () => void;

  // Location & Serviceability
  location: LocationData;
  isLocationModalOpen: boolean;
  setLocationModalOpen: (open: boolean) => void;
  setLocation: (loc: LocationData) => void;
  serviceHubs: ServiceHub[];
  savedAddresses: UserAddress[];
  activeAddressId: string | null;
  isAddressModalOpen: boolean;
  addressModalInitialCoords?: { lat: number; lng: number };
  setAddressModalOpen: (open: boolean, initialCoords?: { lat: number; lng: number }) => void;
  addAddress: (addr: Omit<UserAddress, 'id' | 'createdAt'>) => UserAddress;
  updateAddress: (id: string, updates: Partial<UserAddress>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  selectSavedAddress: (id: string) => void;
  fetchServiceHubs: () => Promise<void>;
  addServiceHub: (hub: Omit<ServiceHub, 'id'>) => Promise<ServiceHub>;
  updateServiceHub: (id: string, updates: Partial<ServiceHub>) => Promise<boolean>;
  deleteServiceHub: (id: string) => Promise<boolean>;
  initLocationLifecycle: () => Promise<void>;
  detectCurrentGpsLocation: () => Promise<{ success: boolean; error?: string }>;

  // Admin CMS & Partner State
  isCategoryManagerOpen: boolean;
  setCategoryManagerOpen: (open: boolean) => void;
  partnerIsOnline: boolean;
  setPartnerIsOnline: (online: boolean) => void;

  // Orders (Live Cloud DB Synchronized)
  orders: OrderBooking[];
  isLoadingOrders: boolean;
  fetchOrders: () => Promise<void>;
  addOrder: (order: OrderBooking) => Promise<OrderBooking>;
  updateOrderStatus: (orderId: string, status: OrderBooking['status']) => Promise<void>;
  updateOrder: (orderId: string, updates: Partial<OrderBooking>) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  resetOrdersToDefault: () => Promise<void>;

  // Custom Requests (Live Cloud DB Synchronized)
  customRequests: CustomRequest[];
  isLoadingCustomRequests: boolean;
  fetchCustomRequests: () => Promise<void>;
  addCustomRequest: (req: Omit<CustomRequest, 'id' | 'createdAt' | 'status'>) => Promise<CustomRequest>;
  updateCustomRequestStatus: (id: string, status: CustomRequestStatus, quotedPrice?: number) => Promise<void>;
  updateCustomRequest: (id: string, updates: Partial<CustomRequest>) => Promise<void>;
  deleteCustomRequest: (id: string) => Promise<void>;
  resetCustomRequestsToDefault: () => Promise<void>;
  isCustomRequestModalOpen: boolean;
  customRequestModalInitialCategory: string | null;
  setCustomRequestModalOpen: (open: boolean, initialCategory?: string) => void;

  // Operational Feature Flags & Maintenance Mode
  isOrderingEnabled: boolean;
  upgradeMessage: string;
  toggleOrderingEnabled: (enabled: boolean) => Promise<boolean>;
  fetchSystemSettings: () => Promise<void>;
}

export const DEFAULT_DAVANGERE_LOCATION: LocationData = {
  area: 'Vidyanagar',
  city: 'Davangere',
  pincode: '577005',
  fullAddress: 'Vidyanagar, Davangere - 577005',
  etaMinutes: 18,
  latitude: 14.4485,
  longitude: 75.9189,
  isServiceable: true,
  hubId: 'hub-dvg-vid',
  hubName: 'Vidyanagar Hub',
  distanceKm: 0.8,
  isDefaultAddress: false,
  addressLabel: undefined,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Catalog state: initialized from local cache, hydrated from API service
      isLoadingCatalog: false,
      catalogError: null,
      categories: INITIAL_CATEGORIES,
      subCategories: INITIAL_SUBCATEGORIES,
      services: INITIAL_SERVICES,
      activeCategorySlug: 'all',
      activeSubCategorySlug: 'all',
      selectedService: null,

      fetchCatalog: async () => {
        set({ isLoadingCatalog: true, catalogError: null });
        try {
          const [catRes, srvRes] = await Promise.all([
            fetch('/api/categories?include=all'),
            fetch('/api/services'),
          ]);

          let hasUpdatedCategories = false;
          if (catRes.ok) {
            const catJson = await catRes.json();
            const catData = catJson?.data;
            if (Array.isArray(catData) && catData.length > 0) {
              const extractedSubs: SubCategory[] = [];
              const normalizedCats: Category[] = catData.map((cat: any) => {
                if (Array.isArray(cat.subCategories)) {
                  cat.subCategories.forEach((sub: any) => {
                    let feats = sub.features;
                    if (typeof feats === 'string') {
                      try { feats = JSON.parse(feats); } catch { feats = []; }
                    }
                    extractedSubs.push({
                      ...sub,
                      categoryId: sub.categoryId || cat.id,
                      categorySlug: sub.categorySlug || cat.slug,
                      features: Array.isArray(feats) ? feats : [],
                    });
                  });
                }
                return {
                  id: cat.id,
                  title: cat.title,
                  slug: cat.slug,
                  iconName: cat.iconName || 'Wrench',
                  description: cat.description,
                  badge: cat.badge || undefined,
                  bgGradient: cat.bgGradient || 'from-blue-600 to-indigo-600',
                  isActive: Boolean(cat.isActive),
                  order: cat.order || 1,
                  image: cat.image || undefined,
                };
              });

              // Merge fallback categories with API response so new first-class categories (meat, parcel, courier, custom) are never dropped
              const existingSlugs = new Set(normalizedCats.map((c: any) => c.slug));
              const missingFallbacks = INITIAL_CATEGORIES.filter((c) => !existingSlugs.has(c.slug));
              const mergedCats = [...normalizedCats, ...missingFallbacks];

              const existingSubSlugs = new Set(extractedSubs.map((s: any) => s.slug));
              const missingSubFallbacks = INITIAL_SUBCATEGORIES.filter((s) => !existingSubSlugs.has(s.slug));
              const mergedSubs = [...extractedSubs, ...missingSubFallbacks];

              set((state) => ({
                categories: mergedCats,
                subCategories: mergedSubs.length > 0 ? mergedSubs : state.subCategories,
              }));
              hasUpdatedCategories = true;
            }
          }

          if (srvRes.ok) {
            const srvJson = await srvRes.json();
            const srvData = srvJson?.data;
            if (Array.isArray(srvData) && srvData.length > 0) {
              const normalizedServices: Service[] = srvData.map((s: any) => {
                let inclusions = s.inclusions;
                if (typeof inclusions === 'string') {
                  try { inclusions = JSON.parse(inclusions); } catch { inclusions = []; }
                }
                return {
                  ...s,
                  price: s.price ?? s.priceEstimated,
                  inclusions: Array.isArray(inclusions) ? inclusions : [],
                };
              });
              const existingSrvSlugs = new Set(normalizedServices.map((s: any) => s.slug));
              const missingSrvFallbacks = INITIAL_SERVICES.filter((s) => !existingSrvSlugs.has(s.slug));
              const mergedServices = [...normalizedServices, ...missingSrvFallbacks];
              set({ services: mergedServices });
            }
          }

          set({ isLoadingCatalog: false });
          // Refresh operational feature flags and service upgrade notice
          get().fetchSystemSettings();
          if (get().user) {
            get().fetchOrders();
            get().fetchCustomRequests();
          }
        } catch (err: any) {
          console.error('[fetchCatalog error]', err);
          set({ isLoadingCatalog: false, catalogError: err?.message || 'Failed to fetch catalog' });
        }
      },

      // Operational Feature Flag / Maintenance Mode
      isOrderingEnabled: true,
      upgradeMessage: 'We are currently upgrading our service. We will be back in no time! Please check back later.',

      fetchSystemSettings: async () => {
        try {
          const res = await fetch('/api/system/settings');
          if (res.ok) {
            const json = await res.json();
            if (json?.data) {
              set({
                isOrderingEnabled: json.data.isOrderingEnabled !== false,
                upgradeMessage:
                  json.data.upgradeMessage ||
                  'We are currently upgrading our service. We will be back in no time! Please check back later.',
              });
            }
          }
        } catch (err) {
          console.warn('[fetchSystemSettings notice]', err);
        }
      },

      toggleOrderingEnabled: async (enabled) => {
        set({ isOrderingEnabled: enabled });
        try {
          const res = await authFetch('/api/system/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              isOrderingEnabled: enabled,
              upgradeMessage: get().upgradeMessage,
            }),
          });
          if (res.ok) {
            toast.success(
              enabled
                ? 'Customer ordering resumed successfully.'
                : 'Service upgrade mode active. Users cannot place new orders.'
            );
            return true;
          }
        } catch (err) {
          console.warn('[toggleOrderingEnabled notice]', err);
        }
        return false;
      },

      // Categories Management (persisting to Cloud API)
      addCategory: async (newCat) => {
        try {
          const res = await authFetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCat),
          });
          const resJson = await res.json();
          if (!res.ok) throw new Error(resJson?.error?.message || 'Failed to add category');
          const created: Category = resJson.data;
          set((state) => ({ categories: [...state.categories, created] }));
          return created;
        } catch (err) {
          console.warn('[addCategory network fallback]', err);
          const fallback: Category = { ...newCat, id: `cat-${Date.now()}` };
          set((state) => ({ categories: [...state.categories, fallback] }));
          return fallback;
        }
      },

      updateCategory: async (id, updates) => {
        // Optimistic update
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
        try {
          const res = await authFetch(`/api/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
          if (!res.ok) throw new Error('Failed to update category');
          return true;
        } catch (err) {
          console.warn('[updateCategory network error]', err);
          return false;
        }
      },

      deleteCategory: async (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          subCategories: state.subCategories.filter((s) => s.categoryId !== id),
        }));
        try {
          const res = await authFetch(`/api/categories/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete category');
          return true;
        } catch (err) {
          console.warn('[deleteCategory network error]', err);
          return false;
        }
      },

      reorderCategories: (newCats) => set({ categories: newCats }),

      // SubCategories Management (persisting to Cloud API)
      setActiveSubCategorySlug: (slug) => set({ activeSubCategorySlug: slug }),

      addSubCategory: async (newSub) => {
        try {
          const res = await authFetch('/api/subcategories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSub),
          });
          const resJson = await res.json();
          if (!res.ok) throw new Error(resJson?.error?.message || 'Failed to add subcategory');
          let feats = resJson.data.features;
          if (typeof feats === 'string') {
            try { feats = JSON.parse(feats); } catch { feats = []; }
          }
          const created: SubCategory = {
            ...resJson.data,
            features: Array.isArray(feats) ? feats : [],
          };
          set((state) => ({ subCategories: [...state.subCategories, created] }));
          return created;
        } catch (err) {
          console.warn('[addSubCategory network fallback]', err);
          const fallback: SubCategory = { ...newSub, id: `sub-${Date.now()}` };
          set((state) => ({ subCategories: [...state.subCategories, fallback] }));
          return fallback;
        }
      },

      updateSubCategory: async (id, updates) => {
        // Optimistic update
        set((state) => ({
          subCategories: state.subCategories.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }));
        try {
          const res = await authFetch(`/api/subcategories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
          if (!res.ok) throw new Error('Failed to update subcategory');
          return true;
        } catch (err) {
          console.warn('[updateSubCategory network error]', err);
          return false;
        }
      },

      deleteSubCategory: async (id) => {
        set((state) => ({
          subCategories: state.subCategories.filter((s) => s.id !== id),
        }));
        try {
          const res = await authFetch(`/api/subcategories/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete subcategory');
          return true;
        } catch (err) {
          console.warn('[deleteSubCategory network error]', err);
          return false;
        }
      },

      getSubCategoriesByCategory: (categorySlug) => {
        const subs = get().subCategories || [];
        return subs.filter((s) => (s.categorySlug === categorySlug || s.categoryId === categorySlug) && s.isActive);
      },

      setActiveCategorySlug: (slug) => set({ activeCategorySlug: slug }),
      setSelectedService: (service) => set({ selectedService: service }),

      // Full Screen Search Experience
      isSearchOpen: false,
      searchQuery: '',
      recentSearches: ['AC deep cleaning', 'Bike engine oil', 'Plumber at home', 'Washing machine check'],
      setSearchOpen: (open) => set({ isSearchOpen: open }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      addRecentSearch: (query) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        set((state) => ({
          recentSearches: [trimmed, ...state.recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8),
        }));
      },
      clearRecentSearches: () => set({ recentSearches: [] }),

      // Cart
      cart: [],
      addToCart: (service) => {
        const state = get();
        if (state.location.isServiceable === false) {
          toast.error(`Service currently unavailable in ${state.location.area}. We are expanding here soon!`, {
            action: {
              label: 'Change Location',
              onClick: () => state.setLocationModalOpen(true),
            },
          });
          return;
        }
        set((s) => {
          const existing = s.cart.find((item) => item.service.id === service.id);
          if (existing) {
            return {
              cart: s.cart.map((item) =>
                item.service.id === service.id ? { ...item, quantity: item.quantity + 1 } : item
              ),
            };
          }
          return { cart: [...s.cart, { service, quantity: 1 }] };
        });
      },
      removeFromCart: (serviceId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.service.id !== serviceId),
        })),
      updateQuantity: (serviceId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { cart: state.cart.filter((item) => item.service.id !== serviceId) };
          }
          return {
            cart: state.cart.map((item) =>
              item.service.id === serviceId ? { ...item, quantity } : item
            ),
          };
        }),
      clearCart: () => set({ cart: [] }),
      isCartDrawerOpen: false,
      setCartDrawerOpen: (open) => set({ isCartDrawerOpen: open }),
      getCartMetrics: () => {
        const { cart } = get();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = cart.reduce((sum, item) => sum + item.service.price * item.quantity, 0);
        // All other charges set to zero
        const inspectionFee = 0;
        const platformFee = 0;
        const discount = cart.reduce(
          (sum, item) => sum + ((item.service.originalPrice || item.service.price) - item.service.price) * item.quantity,
          0
        );
        const grandTotal = subtotal + inspectionFee + platformFee;
        return { totalItems, subtotal, inspectionFee, platformFee, discount, grandTotal };
      },

      // User & Roles
      user: null,
      activeRole: 'user',
      isAuthModalOpen: false,
      authModalInitialRole: 'user',
      setAuthModalOpen: (open, role = 'user') =>
        set({ isAuthModalOpen: open, authModalInitialRole: role }),
      setUser: (user) => {
        set((state) => ({
          user,
          ...(user === null
            ? {
                orders: [],
                customRequests: [],
                savedAddresses: [],
                activeAddressId: null,
                cart: [],
                recentSearches: [],
                location: DEFAULT_DAVANGERE_LOCATION,
              }
            : {}),
        }));
        if (user) {
          setTimeout(() => {
            get().syncUserToCloud(user);
          }, 0);
        }
      },

      syncUserToCloud: async (userToSync) => {
        const targetUser = userToSync || get().user;
        if (!targetUser) return;
        try {
          const res = await authFetch('/api/users/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: targetUser.name,
              email: targetUser.email,
              phone: targetUser.phone,
              role: targetUser.role === 'admin' ? 'ADMIN' : targetUser.role === 'partner' ? 'TECHNICIAN' : 'USER',
              metadata: {
                avatar: targetUser.avatar,
                partnerRating: targetUser.partnerRating,
              },
            }),
          });
          if (res.ok) {
            await get().fetchUserAddresses();
          }
        } catch (err) {
          console.warn('[syncUserToCloud notice]', err);
        }
      },

      fetchUserAddresses: async () => {
        if (!get().user) return;
        try {
          const res = await authFetch('/api/user-addresses');
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json?.data) && json.data.length > 0) {
              const mapped: UserAddress[] = json.data.map((d: any) => ({
                id: d.id,
                label: d.label,
                fullAddress: d.fullAddress,
                flatNumber: d.flatNumber || undefined,
                landmark: d.landmark || undefined,
                area: d.area,
                city: d.city,
                pincode: d.pincode,
                latitude: typeof d.latitude === 'number' ? d.latitude : 14.4644,
                longitude: typeof d.longitude === 'number' ? d.longitude : 75.9218,
                isDefault: Boolean(d.isDefault),
                createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
              }));
              set({ savedAddresses: mapped });
              const def = mapped.find((a) => a.isDefault) || mapped[0];
              if (def && !get().activeAddressId) {
                get().selectSavedAddress(def.id);
              }
            }
          }
        } catch (err) {
          console.warn('[fetchUserAddresses notice]', err);
        }
      },

      setActiveRole: (role) => set({ activeRole: role }),
      loginSimulated: (role, phoneOrEmail, name) => {
        const newUser: UserProfile = {
          id: `usr-${Date.now()}`,
          name: name || (role === 'admin' ? 'Reparzo Admin' : role === 'partner' ? 'Rajesh Kumar (Technician)' : 'Charan'),
          phone: phoneOrEmail.includes('@') ? '+91 98450 12345' : phoneOrEmail,
          email: phoneOrEmail.includes('@') ? phoneOrEmail : `${role}@reparzo.com`,
          role,
          avatar:
            role === 'partner'
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
              : role === 'admin'
              ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'
              : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          partnerStatus: role === 'partner' ? 'online' : undefined,
          partnerRating: role === 'partner' ? 4.92 : undefined,
          earningsToday: role === 'partner' ? 1420 : undefined,
        };
        set((state) => ({
          user: newUser,
          activeRole: role,
          isAuthModalOpen: false,
        }));
        setTimeout(() => {
          get().fetchOrders();
          get().fetchCustomRequests();
        }, 0);
      },
      loginWithFirebaseUser: (firebaseUser) => {
        const email = firebaseUser.email || '';
        const name = firebaseUser.displayName || (email ? email.split('@')[0] : 'Reparzo User');
        const phone = firebaseUser.phoneNumber || '+91 98450 12345';
        
        const detected = resolveUserByIdentifier(email || name);
        const role = detected.role;

        const newUser: UserProfile = {
          id: firebaseUser.uid || `usr-${Date.now()}`,
          name,
          email,
          phone,
          role,
          avatar: firebaseUser.photoURL || detected.avatar,
          partnerStatus: role === 'partner' ? 'online' : undefined,
          partnerRating: role === 'partner' ? 4.92 : undefined,
          earningsToday: role === 'partner' ? 1420 : undefined,
        };

        set((state) => ({
          user: newUser,
          activeRole: role,
          isAuthModalOpen: false,
        }));
        setTimeout(() => {
          get().syncUserToCloud(newUser);
          get().fetchOrders();
          get().fetchCustomRequests();
        }, 0);
        return detected;
      },
      updateUserProfile: (updates) => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              ...updates,
            },
          };
        });
      },
      logout: () => {
        signOutFirebase().catch(() => {});
        set({
          user: null,
          activeRole: 'user',
          orders: [],
          customRequests: [],
          savedAddresses: [],
          activeAddressId: null,
          cart: [],
          recentSearches: [],
          location: DEFAULT_DAVANGERE_LOCATION,
        });

        // Hard sanitize persistent localStorage so zero residual user data remains on disk
        try {
          const raw = localStorage.getItem('reparzo-app-storage');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.state) {
              parsed.state.user = null;
              parsed.state.activeRole = 'user';
              parsed.state.orders = [];
              parsed.state.customRequests = [];
              parsed.state.savedAddresses = [];
              parsed.state.activeAddressId = null;
              parsed.state.cart = [];
              parsed.state.recentSearches = [];
              parsed.state.location = DEFAULT_DAVANGERE_LOCATION;
              localStorage.setItem('reparzo-app-storage', JSON.stringify(parsed));
            }
          }
        } catch (e) {
          console.warn('[logout localStorage write]', e);
        }
      },

      // Location & Serviceability
      location: DEFAULT_DAVANGERE_LOCATION,
      isLocationModalOpen: false,
      setLocationModalOpen: (open) => set({ isLocationModalOpen: open }),
      setLocation: (loc) => set({ location: loc, isLocationModalOpen: false }),

      serviceHubs: DEFAULT_SERVICE_HUBS,
      savedAddresses: [],
      activeAddressId: null,
      isAddressModalOpen: false,
      addressModalInitialCoords: undefined,
      setAddressModalOpen: (open, initialCoords) =>
        set({ isAddressModalOpen: open, addressModalInitialCoords: initialCoords }),

      addAddress: (newAddrData) => {
        const id = `addr-${Date.now()}`;
        const isFirst = get().savedAddresses.length === 0;
        const makeDefault = Boolean(newAddrData.isDefault || isFirst);

        const newAddress: UserAddress = {
          ...newAddrData,
          id,
          isDefault: makeDefault,
          createdAt: new Date().toISOString(),
        };

        const currentAddresses = get().savedAddresses.map((a) =>
          makeDefault ? { ...a, isDefault: false } : a
        );

        const updatedAddresses = [newAddress, ...currentAddresses];

        const serviceCheck = checkServiceability(
          newAddress.latitude,
          newAddress.longitude,
          get().serviceHubs
        );

        // Always activate newly added address so user immediately sees location state
        set({
          savedAddresses: updatedAddresses,
          activeAddressId: id,
          isAddressModalOpen: false,
          location: {
            area: newAddress.area,
            city: newAddress.city,
            pincode: newAddress.pincode,
            fullAddress: newAddress.fullAddress,
            latitude: newAddress.latitude,
            longitude: newAddress.longitude,
            etaMinutes: serviceCheck.etaMinutes,
            distanceKm: serviceCheck.distanceKm,
            isServiceable: serviceCheck.isServiceable,
            hubId: serviceCheck.nearestHub?.id,
            hubName: serviceCheck.nearestHub?.name,
            isDefaultAddress: newAddress.isDefault,
            addressLabel: newAddress.label,
          },
        });

        // Cloud sync to D1 if user is authenticated
        if (get().user) {
          authFetch('/api/user-addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAddress),
          }).catch((err) => console.warn('[addAddress cloud sync error]', err));
        }

        return newAddress;
      },

      updateAddress: (id, updates) => {
        const state = get();
        const makeDefault = Boolean(updates.isDefault);

        const updatedAddresses = state.savedAddresses.map((a) => {
          if (a.id === id) {
            return { ...a, ...updates, isDefault: makeDefault || a.isDefault };
          }
          return makeDefault ? { ...a, isDefault: false } : a;
        });

        const target = updatedAddresses.find((a) => a.id === id);
        if (target && (makeDefault || state.activeAddressId === id)) {
          const serviceCheck = checkServiceability(target.latitude, target.longitude, state.serviceHubs);
          set({
            savedAddresses: updatedAddresses,
            activeAddressId: id,
            location: {
              area: target.area,
              city: target.city,
              pincode: target.pincode,
              fullAddress: target.fullAddress,
              latitude: target.latitude,
              longitude: target.longitude,
              etaMinutes: serviceCheck.etaMinutes,
              distanceKm: serviceCheck.distanceKm,
              isServiceable: serviceCheck.isServiceable,
              hubId: serviceCheck.nearestHub?.id,
              hubName: serviceCheck.nearestHub?.name,
              isDefaultAddress: target.isDefault,
              addressLabel: target.label,
            },
          });
        } else {
          set({ savedAddresses: updatedAddresses });
        }

        // Cloud sync to D1 if user is authenticated
        if (get().user) {
          authFetch(`/api/user-addresses/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          }).catch((err) => console.warn('[updateAddress cloud sync error]', err));
        }
      },

      deleteAddress: (id) => {
        set((state) => ({
          savedAddresses: state.savedAddresses.filter((a) => a.id !== id),
          activeAddressId: state.activeAddressId === id ? null : state.activeAddressId,
        }));

        // Cloud sync deletion to D1 if user is authenticated
        if (get().user) {
          authFetch(`/api/user-addresses/${id}`, {
            method: 'DELETE',
          }).catch((err) => console.warn('[deleteAddress cloud sync error]', err));
        }
      },

      setDefaultAddress: (id) => {
        const state = get();
        const updated = state.savedAddresses.map((a) => ({
          ...a,
          isDefault: a.id === id,
        }));
        const target = updated.find((a) => a.id === id);
        if (target) {
          const serviceCheck = checkServiceability(target.latitude, target.longitude, state.serviceHubs);
          set({
            savedAddresses: updated,
            activeAddressId: id,
            location: {
              area: target.area,
              city: target.city,
              pincode: target.pincode,
              fullAddress: target.fullAddress,
              latitude: target.latitude,
              longitude: target.longitude,
              etaMinutes: serviceCheck.etaMinutes,
              distanceKm: serviceCheck.distanceKm,
              isServiceable: serviceCheck.isServiceable,
              hubId: serviceCheck.nearestHub?.id,
              hubName: serviceCheck.nearestHub?.name,
              isDefaultAddress: true,
              addressLabel: target.label,
            },
          });
        } else {
          set({ savedAddresses: updated });
        }

        // Cloud sync default address to D1 if user is authenticated
        if (get().user) {
          authFetch(`/api/user-addresses/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isDefault: true }),
          }).catch((err) => console.warn('[setDefaultAddress cloud sync error]', err));
        }
      },

      selectSavedAddress: (id) => {
        const state = get();
        const target = state.savedAddresses.find((a) => a.id === id);
        if (!target) return;
        const serviceCheck = checkServiceability(target.latitude, target.longitude, state.serviceHubs);
        set({
          activeAddressId: id,
          isLocationModalOpen: false,
          location: {
            area: target.area,
            city: target.city,
            pincode: target.pincode,
            fullAddress: target.fullAddress,
            latitude: target.latitude,
            longitude: target.longitude,
            etaMinutes: serviceCheck.etaMinutes,
            distanceKm: serviceCheck.distanceKm,
            isServiceable: serviceCheck.isServiceable,
            hubId: serviceCheck.nearestHub?.id,
            hubName: serviceCheck.nearestHub?.name,
            isDefaultAddress: target.isDefault,
            addressLabel: target.label,
          },
        });
      },

      fetchServiceHubs: async () => {
        try {
          const res = await fetch('/api/service-hubs?all=true');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data?.data) && data.data.length > 0) {
              set({ serviceHubs: data.data });
            }
          }
        } catch (err) {
          console.warn('[fetchServiceHubs fallback to default]', err);
        }
      },

      addServiceHub: async (hubData) => {
        const id = `hub-${Date.now()}`;
        const newHub: ServiceHub = { ...hubData, id };
        try {
          const res = await authFetch('/api/service-hubs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newHub),
          });
          if (res.ok) {
            const json = await res.json();
            const created = json.data || newHub;
            set((state) => ({ serviceHubs: [...state.serviceHubs, created] }));
            return created;
          }
        } catch (e) {
          console.warn('[addServiceHub network fallback]', e);
        }
        set((state) => ({ serviceHubs: [...state.serviceHubs, newHub] }));
        return newHub;
      },

      updateServiceHub: async (id, updates) => {
        set((state) => ({
          serviceHubs: state.serviceHubs.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        }));
        try {
          const res = await authFetch(`/api/service-hubs/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
          return res.ok;
        } catch {
          return true;
        }
      },

      deleteServiceHub: async (id) => {
        set((state) => ({
          serviceHubs: state.serviceHubs.filter((h) => h.id !== id),
        }));
        try {
          const res = await authFetch(`/api/service-hubs/${id}`, { method: 'DELETE' });
          return res.ok;
        } catch {
          return true;
        }
      },

      initLocationLifecycle: async () => {
        const state = get();
        // If no user is authenticated, guarantee no saved addresses or personalized address labels are active
        if (!state.user) {
          set({
            savedAddresses: [],
            activeAddressId: null,
          });
          if (state.location.addressLabel || state.location.isDefaultAddress || state.location.fullAddress?.includes('Kondajji')) {
            set({ location: DEFAULT_DAVANGERE_LOCATION });
          }
          return;
        }

        // Freshly sync authenticated user and fetch cloud addresses from D1
        get().syncUserToCloud();
        get().fetchUserAddresses();

        // 1. Check if user has a default saved address:
        const defaultAddress = state.savedAddresses.find((a) => a.isDefault);
        if (defaultAddress) {
          // Default address found: DO NOT fetch GPS or trigger permission prompt on reload/open!
          const serviceCheck = checkServiceability(defaultAddress.latitude, defaultAddress.longitude, state.serviceHubs);
          set({
            activeAddressId: defaultAddress.id,
            location: {
              area: defaultAddress.area,
              city: defaultAddress.city,
              pincode: defaultAddress.pincode,
              fullAddress: defaultAddress.fullAddress,
              latitude: defaultAddress.latitude,
              longitude: defaultAddress.longitude,
              etaMinutes: serviceCheck.etaMinutes,
              distanceKm: serviceCheck.distanceKm,
              isServiceable: serviceCheck.isServiceable,
              hubId: serviceCheck.nearestHub?.id,
              hubName: serviceCheck.nearestHub?.name,
              isDefaultAddress: true,
              addressLabel: defaultAddress.label,
            },
          });
          return;
        }

        // 2. No default address: fetch GPS on open or reload
        await state.detectCurrentGpsLocation();
      },

      detectCurrentGpsLocation: async () => {
        if (!('geolocation' in navigator)) {
          return { success: false, error: 'Geolocation not supported in this browser' };
        }

        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              try {
                const geo = await reverseGeocode(lat, lng);
                const serviceCheck = checkServiceability(lat, lng, get().serviceHubs);
                set({
                  activeAddressId: null,
                  location: {
                    area: geo.area,
                    city: geo.city,
                    pincode: geo.pincode,
                    fullAddress: geo.fullAddress,
                    latitude: lat,
                    longitude: lng,
                    etaMinutes: serviceCheck.etaMinutes,
                    distanceKm: serviceCheck.distanceKm,
                    isServiceable: serviceCheck.isServiceable,
                    hubId: serviceCheck.nearestHub?.id,
                    hubName: serviceCheck.nearestHub?.name,
                    isDefaultAddress: false,
                    addressLabel: 'GPS',
                  },
                });
                resolve({ success: true });
              } catch (err: any) {
                resolve({ success: false, error: err.message });
              }
            },
            (err) => {
              console.warn('[Geolocation error/denied]', err.message);
              resolve({ success: false, error: err.message });
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
          );
        });
      },

      // Admin & Partner UI
      isCategoryManagerOpen: false,
      setCategoryManagerOpen: (open) => set({ isCategoryManagerOpen: open }),
      partnerIsOnline: true,
      setPartnerIsOnline: (online) => set({ partnerIsOnline: online }),

      // Orders: Live database persistence with optimistic local state
      orders: [],
      isLoadingOrders: false,
      fetchOrders: async () => {
        set({ isLoadingOrders: true });
        try {
          const res = await authFetch('/api/bookings');
          if (res.ok) {
            const json = await res.json();
            const data = json?.data;
            if (Array.isArray(data)) {
              // Ensure legacy mock order IDs are purged
              const cleanOrders = data.filter(
                (o: any) =>
                  o.id !== 'ORD-8821' &&
                  o.id !== 'ORD-8819' &&
                  o.id !== 'ORD-8812' &&
                  o.id !== 'ORD-8492' &&
                  o.id !== 'ORD-8488' &&
                  o.id !== 'ORD-8470'
              );
              set({ orders: cleanOrders, isLoadingOrders: false });
              return;
            }
          }
        } catch (err) {
          console.warn('[fetchOrders error]', err);
        }
        set({ isLoadingOrders: false });
      },
      addOrder: async (order) => {
        set((state) => ({ orders: [order, ...state.orders] }));
        try {
          const res = await authFetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order),
          });
          if (res.ok) {
            const json = await res.json();
            const saved = json?.data?.booking;
            if (saved) {
              set((state) => ({
                orders: state.orders.map((o) => (o.id === order.id ? saved : o)),
              }));
              return saved;
            }
          }
        } catch (err) {
          console.warn('[addOrder DB persist warning]', err);
        }
        return order;
      },
      updateOrderStatus: async (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        }));
        try {
          await authFetch(`/api/bookings/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          });
        } catch (err) {
          console.warn('[updateOrderStatus DB sync warning]', err);
        }
      },
      updateOrder: async (orderId, updates) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, ...updates } : o)),
        }));
        try {
          await authFetch(`/api/bookings/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
        } catch (err) {
          console.warn('[updateOrder DB sync warning]', err);
        }
      },
      deleteOrder: async (orderId) => {
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== orderId),
        }));
        try {
          await authFetch(`/api/bookings/${orderId}`, {
            method: 'DELETE',
          });
        } catch (err) {
          console.warn('[deleteOrder DB sync warning]', err);
        }
      },
      resetOrdersToDefault: async () => {
        await get().fetchOrders();
      },

      // Custom Requests: Live database persistence with optimistic local state
      customRequests: [],
      isLoadingCustomRequests: false,
      fetchCustomRequests: async () => {
        set({ isLoadingCustomRequests: true });
        try {
          const res = await authFetch('/api/custom-requests');
          if (res.ok) {
            const json = await res.json();
            const data = json?.data;
            if (Array.isArray(data)) {
              // Ensure legacy mock custom request IDs are purged
              const cleanRequests = data.filter(
                (r: any) =>
                  r.id !== 'REQ-9102' &&
                  r.id !== 'REQ-9088' &&
                  r.id !== 'REQ-9071' &&
                  r.id !== 'REQ-9064' &&
                  r.customerName !== 'Aakash Verma' &&
                  r.customerName !== 'Pooja Sundaram' &&
                  r.customerName !== 'Raghavendra Rao'
              );
              set({ customRequests: cleanRequests, isLoadingCustomRequests: false });
              return;
            }
          }
        } catch (err) {
          console.warn('[fetchCustomRequests error]', err);
        }
        set({ isLoadingCustomRequests: false });
      },
      isCustomRequestModalOpen: false,
      customRequestModalInitialCategory: null,
      setCustomRequestModalOpen: (open, initialCategory) =>
        set({ 
          isCustomRequestModalOpen: open, 
          customRequestModalInitialCategory: initialCategory ?? null 
        }),

      addCustomRequest: async (reqData) => {
        const tempId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
        const tempReq: CustomRequest = {
          ...reqData,
          id: tempId,
          status: 'submitted',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          customRequests: [tempReq, ...state.customRequests],
        }));
        try {
          const res = await authFetch('/api/custom-requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqData),
          });
          if (res.ok) {
            const json = await res.json();
            const serverReq = json?.data;
            if (serverReq) {
              set((state) => ({
                customRequests: state.customRequests.map((r) => (r.id === tempId ? serverReq : r)),
              }));
              return serverReq;
            }
          }
        } catch (err) {
          console.warn('[addCustomRequest DB persist warning]', err);
        }
        return tempReq;
      },

      updateCustomRequestStatus: async (id, status, quotedPrice) => {
        set((state) => ({
          customRequests: state.customRequests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status,
                  quotedPrice: quotedPrice !== undefined ? quotedPrice : r.quotedPrice,
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
        try {
          await authFetch(`/api/custom-requests/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, quotedPrice }),
          });
        } catch (err) {
          console.warn('[updateCustomRequestStatus DB sync warning]', err);
        }
      },

      updateCustomRequest: async (id, updates) => {
        set((state) => ({
          customRequests: state.customRequests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
        try {
          await authFetch(`/api/custom-requests/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
        } catch (err) {
          console.warn('[updateCustomRequest DB sync warning]', err);
        }
      },

      deleteCustomRequest: async (id) => {
        set((state) => ({
          customRequests: state.customRequests.filter((r) => r.id !== id),
        }));
        try {
          await authFetch(`/api/custom-requests/${id}`, {
            method: 'DELETE',
          });
        } catch (err) {
          console.warn('[deleteCustomRequest DB sync warning]', err);
        }
      },

      resetCustomRequestsToDefault: async () => {
        await get().fetchCustomRequests();
      },
    }),
    {
      name: 'reparzo-app-storage',
      partialize: (state) => ({
        cart: state.cart,
        user: state.user,
        activeRole: state.activeRole,
        location: state.location,
        savedAddresses: state.savedAddresses,
        serviceHubs: state.serviceHubs,
        activeAddressId: state.activeAddressId,
        recentSearches: state.recentSearches,
        orders: state.orders,
        customRequests: state.customRequests,
      }),
      onRehydrateStorage: () => (state) => {
        // Clean out legacy mock data from persisted localStorage
        if (state) {
          if (state.orders && Array.isArray(state.orders)) {
            state.orders = state.orders.filter(
              (o) =>
                o.id !== 'ORD-8821' &&
                o.id !== 'ORD-8819' &&
                o.id !== 'ORD-8812' &&
                o.id !== 'ORD-8492' &&
                o.id !== 'ORD-8488' &&
                o.id !== 'ORD-8470'
            );
          }
          if (state.customRequests && Array.isArray(state.customRequests)) {
            state.customRequests = state.customRequests.filter(
              (r) =>
                r.id !== 'REQ-9102' &&
                r.id !== 'REQ-9088' &&
                r.id !== 'REQ-9071' &&
                r.id !== 'REQ-9064' &&
                r.customerName !== 'Aakash Verma' &&
                r.customerName !== 'Pooja Sundaram' &&
                r.customerName !== 'Raghavendra Rao'
            );
          }
        }

        // If there is no authenticated user, strictly purge all orders, custom requests, saved addresses, and location
        if (state && !state.user) {
          state.orders = [];
          state.customRequests = [];
          state.savedAddresses = [];
          state.activeAddressId = null;
          state.cart = [];
          state.recentSearches = [];
          state.location = DEFAULT_DAVANGERE_LOCATION;

          // Directly synchronize sanitized state back to localStorage so nothing lingers
          try {
            const raw = localStorage.getItem('reparzo-app-storage');
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed?.state && !parsed.state.user) {
                parsed.state.orders = [];
                parsed.state.customRequests = [];
                parsed.state.savedAddresses = [];
                parsed.state.activeAddressId = null;
                parsed.state.cart = [];
                parsed.state.recentSearches = [];
                parsed.state.location = DEFAULT_DAVANGERE_LOCATION;
                localStorage.setItem('reparzo-app-storage', JSON.stringify(parsed));
              }
            }
          } catch (e) {
            console.warn('[rehydrate storage sync]', e);
          }
        }
        if (state?.user && (state.user.phone?.includes('98450') || state.user.name?.includes('Charan H.S.') || state.user.name === 'Charan H S')) {
          state.user = null;
          state.activeRole = 'user';
          state.orders = [];
          state.customRequests = [];
          state.savedAddresses = [];
          state.activeAddressId = null;
          state.cart = [];
          state.recentSearches = [];
          state.location = DEFAULT_DAVANGERE_LOCATION;
        }
        // Purge legacy dummy addresses from persistent browser storage
        if (state?.savedAddresses) {
          state.savedAddresses = state.savedAddresses.filter(
            (a) =>
              a.id !== 'addr-default-1' &&
              a.id !== 'addr-default-2' &&
              !a.fullAddress?.includes('Green Glen Heights') &&
              !a.fullAddress?.includes('Reparzo Tech Hub')
          );
          if (state.activeAddressId === 'addr-default-1' || state.activeAddressId === 'addr-default-2') {
            state.activeAddressId = state.savedAddresses[0]?.id || null;
          }
        }
        // Clean legacy dummy address string or Bengaluru location in persistent storage
        if (
          state?.location?.fullAddress?.includes('Green Glen Heights') ||
          state?.location?.city === 'Bengaluru' ||
          state?.location?.fullAddress?.includes('Bengaluru') ||
          state?.location?.fullAddress?.includes('HSR Layout')
        ) {
          state.location = {
            area: 'Vidyanagar',
            city: 'Davangere',
            pincode: '577005',
            fullAddress: 'Vidyanagar, Davangere - 577005',
            etaMinutes: 18,
            latitude: 14.4485,
            longitude: 75.9189,
            isServiceable: true,
            hubId: 'hub-dvg-vid',
            hubName: 'Vidyanagar Hub',
            distanceKm: 0.8,
            isDefaultAddress: false,
            addressLabel: undefined,
          };
        }
        // Migrate legacy Bengaluru hubs to Davangere hubs in persistent storage
        if (
          state?.serviceHubs &&
          state.serviceHubs.some((h) => h.city === 'Bengaluru' || h.code?.startsWith('BLR'))
        ) {
          state.serviceHubs = DEFAULT_SERVICE_HUBS;
        }
        // Purge mock partner data from persisted orders
        if (state?.orders && Array.isArray(state.orders)) {
          state.orders = state.orders.map((o) => {
            const hasMockPartner = Boolean(
              o.technicianName && (
                o.technicianName.toLowerCase().includes('suresh') ||
                o.technicianName.toLowerCase().includes('sunil') ||
                o.technicianName.toLowerCase().includes('rajesh') ||
                o.technicianName.toLowerCase().includes('ramesh') ||
                o.technicianName.toLowerCase().includes('arun') ||
                o.technicianName.toLowerCase().includes('manjunath') ||
                o.technicianName.toLowerCase().includes('verified partner') ||
                o.technicianName.toLowerCase().includes('master technician') ||
                o.technicianName.toLowerCase().includes('cold-chain')
              )
            );
            if (hasMockPartner || o.status === 'confirmed') {
              const cleaned = { ...o };
              delete cleaned.technicianName;
              delete cleaned.technicianPhone;
              return cleaned;
            }
            return o;
          });
        }
      },
    }
  )
);
