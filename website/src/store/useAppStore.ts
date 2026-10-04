import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Category, SubCategory, Service, CartItem, UserProfile, UserRole, LocationData, OrderBooking, UserAddress, ServiceHub } from '../types';
import { resolveUserByIdentifier, RecognizedAccount } from '../lib/authConfig';
import { signOutFirebase } from '../lib/firebase';
import { DEFAULT_SERVICE_HUBS, checkServiceability, reverseGeocode, calculateDistanceKm, estimateEtaMinutes } from '../lib/geo';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_SUBCATEGORIES, 
  INITIAL_SERVICES, 
  INITIAL_ORDERS 
} from '../data/fallbackCatalog';

// Re-export fallback constants for backwards-compatibility with scripts and types
export { INITIAL_CATEGORIES, INITIAL_SUBCATEGORIES, INITIAL_SERVICES, INITIAL_ORDERS };

export interface AppState {
  // Backend Catalog State & Async Sync
  isLoadingCatalog: boolean;
  catalogError: string | null;
  fetchCatalog: () => Promise<void>;

  // Categories (Admin-editable & Persisted in Cloudflare D1)
  categories: Category[];
  updateCategory: (id: string, updates: Partial<Category>) => Promise<boolean>;
  addCategory: (newCat: Omit<Category, 'id'>) => Promise<Category | null>;
  deleteCategory: (id: string) => Promise<boolean>;
  reorderCategories: (newCats: Category[]) => void;

  // SubCategories (Two-Step Admin Hierarchy & Persisted in Cloudflare D1)
  subCategories: SubCategory[];
  activeSubCategorySlug: string;
  setActiveSubCategorySlug: (slug: string) => void;
  addSubCategory: (newSub: Omit<SubCategory, 'id'>) => Promise<SubCategory | null>;
  updateSubCategory: (id: string, updates: Partial<SubCategory>) => Promise<boolean>;
  deleteSubCategory: (id: string) => Promise<boolean>;
  getSubCategoriesByCategory: (categorySlug: string) => SubCategory[];

  // Services (Catalog from Cloudflare D1)
  services: Service[];
  activeCategorySlug: string;
  setActiveCategorySlug: (slug: string) => void;

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

  // Orders
  orders: OrderBooking[];
  addOrder: (order: OrderBooking) => void;
  updateOrderStatus: (orderId: string, status: OrderBooking['status']) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Catalog state: booted from fallback constants, hydrated from Cloudflare D1
      isLoadingCatalog: false,
      catalogError: null,
      categories: INITIAL_CATEGORIES,
      subCategories: INITIAL_SUBCATEGORIES,
      services: INITIAL_SERVICES,
      activeCategorySlug: 'all',
      activeSubCategorySlug: 'all',

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

              set((state) => ({
                categories: normalizedCats,
                subCategories: extractedSubs.length > 0 ? extractedSubs : state.subCategories,
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
              set({ services: normalizedServices });
            }
          }

          set({ isLoadingCatalog: false });
        } catch (err: any) {
          console.error('[fetchCatalog error]', err);
          set({ isLoadingCatalog: false, catalogError: err?.message || 'Failed to fetch catalog' });
        }
      },

      // Categories Management (persisting to D1)
      addCategory: async (newCat) => {
        try {
          const res = await fetch('/api/categories', {
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
          const res = await fetch(`/api/categories/${id}`, {
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
          const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete category');
          return true;
        } catch (err) {
          console.warn('[deleteCategory network error]', err);
          return false;
        }
      },

      reorderCategories: (newCats) => set({ categories: newCats }),

      // SubCategories Management (persisting to D1)
      setActiveSubCategorySlug: (slug) => set({ activeSubCategorySlug: slug }),

      addSubCategory: async (newSub) => {
        try {
          const res = await fetch('/api/subcategories', {
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
          const res = await fetch(`/api/subcategories/${id}`, {
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
          const res = await fetch(`/api/subcategories/${id}`, { method: 'DELETE' });
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
        set((state) => {
          const existing = state.cart.find((item) => item.service.id === service.id);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.service.id === service.id ? { ...item, quantity: item.quantity + 1 } : item
              ),
            };
          }
          return { cart: [...state.cart, { service, quantity: 1 }] };
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
        const inspectionFee = subtotal > 499 || subtotal === 0 ? 0 : 49;
        const platformFee = totalItems > 0 ? 19 : 0;
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
      setUser: (user) => set({ user }),
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
        set({ user: newUser, activeRole: role, isAuthModalOpen: false });
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

        set({ user: newUser, activeRole: role, isAuthModalOpen: false });
        return detected;
      },
      logout: () => {
        signOutFirebase().catch(() => {});
        set({ user: null, activeRole: 'user' });
      },

      // Location & Serviceability
      location: {
        area: 'HSR Layout, Sector 2',
        city: 'Bengaluru',
        pincode: '560102',
        fullAddress: '14th Main, HSR Layout Sector 2, Bengaluru, Karnataka',
        etaMinutes: 20,
        latitude: 12.9116,
        longitude: 77.6389,
        isServiceable: true,
        hubId: 'hub-blr-hsr',
        hubName: 'HSR Layout Sector 2 Hub',
        distanceKm: 0.5,
        isDefaultAddress: false,
        addressLabel: 'Hub',
      },
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

        if (makeDefault) {
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
              isDefaultAddress: true,
              addressLabel: newAddress.label,
            },
          });
        } else {
          set({
            savedAddresses: updatedAddresses,
            isAddressModalOpen: false,
          });
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
      },

      deleteAddress: (id) => {
        set((state) => ({
          savedAddresses: state.savedAddresses.filter((a) => a.id !== id),
          activeAddressId: state.activeAddressId === id ? null : state.activeAddressId,
        }));
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
          const res = await fetch('/api/service-hubs', {
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
          const res = await fetch(`/api/service-hubs/${id}`, {
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
          const res = await fetch(`/api/service-hubs/${id}`, { method: 'DELETE' });
          return res.ok;
        } catch {
          return true;
        }
      },

      initLocationLifecycle: async () => {
        const state = get();
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

      // Orders
      orders: INITIAL_ORDERS,
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        })),
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
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.user && (state.user.phone?.includes('98450') || state.user.name?.includes('Charan H.S.') || state.user.name === 'Charan H S')) {
          state.user = null;
          state.activeRole = 'user';
        }
      },
    }
  )
);
