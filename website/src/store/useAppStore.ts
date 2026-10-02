import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Category, Service, CartItem, UserProfile, UserRole, LocationData, OrderBooking } from '../types';
import { resolveUserByIdentifier, RecognizedAccount } from '../lib/authConfig';
import { signOutFirebase } from '../lib/firebase';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-ac',
    title: 'AC Services',
    slug: 'ac-services',
    iconName: 'Wind',
    description: 'Jet wash service, gas recharge, cooling repair & installation',
    badge: '50% OFF Rush',
    bgGradient: 'from-blue-600 to-cyan-500',
    isActive: true,
    order: 1,
  },
  {
    id: 'cat-bike',
    title: 'Bike Service',
    slug: 'bike-service',
    iconName: 'Bike',
    description: 'Doorstep 24-point checkup, engine oil change, brake tuning',
    badge: 'Starts ₹199',
    bgGradient: 'from-indigo-600 to-blue-500',
    isActive: true,
    order: 2,
  },
  {
    id: 'cat-home-shift',
    title: 'Home Shifting',
    slug: 'home-shifting',
    iconName: 'Truck',
    description: 'Verified packers & movers, intra-city shifting & fragile packing',
    badge: 'Insured Move',
    bgGradient: 'from-amber-600 to-orange-500',
    isActive: true,
    order: 3,
  },
  {
    id: 'cat-electrical',
    title: 'Electrical Services',
    slug: 'electrical-services',
    iconName: 'Zap',
    description: 'MCB tripping, switchboard wiring, fan & inverter installation',
    badge: '60 Min Arrival',
    bgGradient: 'from-amber-500 to-yellow-400',
    isActive: true,
    order: 4,
  },
  {
    id: 'cat-plumbing',
    title: 'Plumbing Services',
    slug: 'plumbing-services',
    iconName: 'Droplet',
    description: 'Tap & pipe leaks, blockages, bathroom fitting & motor pump fix',
    badge: 'Expert Plumber',
    bgGradient: 'from-cyan-600 to-sky-500',
    isActive: true,
    order: 5,
  },
  {
    id: 'cat-refrigerator',
    title: 'Refrigerator Care',
    slug: 'refrigerator-services',
    iconName: 'Sparkles',
    description: 'Single & double door cooling, gas leakage, compressor check',
    badge: '30-Day Warranty',
    bgGradient: 'from-blue-700 to-indigo-600',
    isActive: true,
    order: 6,
  },
  {
    id: 'cat-washing',
    title: 'Washing Machines',
    slug: 'washing-machine-services',
    iconName: 'Shirt',
    description: 'Top & front load drum spin, water intake & motor repair',
    badge: 'All Brands',
    bgGradient: 'from-teal-600 to-emerald-500',
    isActive: true,
    order: 7,
  },
  {
    id: 'cat-water-tank',
    title: 'Water Tank Cleaning',
    slug: 'water-tank-services',
    iconName: 'Waves',
    description: 'High-pressure anti-bacterial deep cleaning & sludge removal',
    badge: 'Eco Safe',
    bgGradient: 'from-sky-600 to-blue-600',
    isActive: true,
    order: 8,
  },
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-ac-deep',
    slug: 'ac-foam-jet-service',
    title: 'AC Foam Jet Deep Service',
    categorySlug: 'ac-services',
    categoryTitle: 'AC Services',
    description: 'Thorough 2X deeper foam & pressure jet cleaning of indoor and outdoor coils, filters and drain tray. Restores cooling & cuts electricity bill.',
    price: 499,
    originalPrice: 899,
    durationMinutes: 45,
    rating: 4.88,
    reviewsCount: 3410,
    inclusions: [
      'Indoor unit jet wash & antimicrobial foam treatment',
      'Outdoor condenser unit water pressure spray',
      'Gas pressure level check & filter sterilization',
      '30-day post service cooling warranty',
    ],
    warrantyDays: 30,
    image: '/banners/ac-service.jpg',
    isPopular: true,
  },
  {
    id: 'srv-ac-gas',
    slug: 'ac-gas-leak-refill',
    title: 'AC Gas Leak Fix & Complete Refill',
    categorySlug: 'ac-services',
    categoryTitle: 'AC Services',
    description: 'Complete nitrogen pressure leak detection, copper brazing repair, vacuum purging and precision scale gas refill (R32 / R410A).',
    price: 1899,
    originalPrice: 2499,
    durationMinutes: 60,
    rating: 4.92,
    reviewsCount: 1840,
    inclusions: [
      'Nitrogen leak testing & joint tightening',
      'Moisture vacuum flush before refill',
      '100% pure certified refrigerant by weight',
      '60-day gas leakage protection guarantee',
    ],
    warrantyDays: 60,
    image: '/banners/ac-service.jpg',
    isPopular: true,
  },
  {
    id: 'srv-bike-gen',
    slug: 'bike-doorstep-general-service',
    title: 'Doorstep Bike General Service',
    categorySlug: 'bike-service',
    categoryTitle: 'Bike Service',
    description: 'Complete 24-point inspection at your doorstep: engine oil flush, spark plug clean, carburetor tune, brake pad check & chain lubrication.',
    price: 349,
    originalPrice: 599,
    durationMinutes: 60,
    rating: 4.85,
    reviewsCount: 5210,
    inclusions: [
      'Engine oil replacement labour & filter cleaning',
      'Front and rear brake shoe inspection & setting',
      'Drive chain clean, tension setting & lube',
      'Free foam water spray & tyre pressure check',
    ],
    warrantyDays: 15,
    image: '/banners/bike-service.jpg',
    isPopular: true,
  },
  {
    id: 'srv-bike-inspect',
    slug: 'bike-breakdown-inspection',
    title: 'Quick Bike Inspection & Jumpstart',
    categorySlug: 'bike-service',
    categoryTitle: 'Bike Service',
    description: 'Instant mobile mechanic arrival within 45 mins. Battery jumpstart, puncture repair, clutch cable fix, and ignition troubleshooting.',
    price: 199,
    originalPrice: 349,
    durationMinutes: 30,
    rating: 4.9,
    reviewsCount: 1420,
    inclusions: [
      'Instant doorstep arrival in under 45 mins',
      'Battery voltage testing & booster jumpstart',
      'Minor cable, fuse & spark plug inspection',
    ],
    warrantyDays: 7,
    image: '/banners/bike-service.jpg',
  },
  {
    id: 'srv-home-shift-1bhk',
    slug: 'home-shifting-1bhk',
    title: '1 BHK Intra-City Home Relocation',
    categorySlug: 'home-shifting',
    categoryTitle: 'Home Shifting',
    description: 'Dedicated mini-truck, 3 verified packing specialists, bubble wrap for electronics, loading, safe transport and room-wise unloading.',
    price: 3499,
    originalPrice: 4500,
    durationMinutes: 180,
    rating: 4.79,
    reviewsCount: 890,
    inclusions: [
      'Free pre-move video assessment & quotation',
      '3-layer bubble wrapping for furniture & TV',
      'Toll & fuel included within 20 km radius',
      'Zero damage transit guarantee & floor protection',
    ],
    warrantyDays: 30,
    image: '/banners/home-shifting.jpg',
    isPopular: true,
  },
  {
    id: 'srv-elec-mcb',
    slug: 'mcb-wiring-short-circuit-fix',
    title: 'Short Circuit & MCB Tripping Repair',
    categorySlug: 'electrical-services',
    categoryTitle: 'Electrical Services',
    description: 'Master electrician diagnosis for continuous MCB trip, burnt wires, loose phase connections, and heavy appliance load balancing.',
    price: 249,
    originalPrice: 399,
    durationMinutes: 40,
    rating: 4.91,
    reviewsCount: 2180,
    inclusions: [
      'Multi-meter circuit continuity & ground testing',
      'Loose termination tightening in distribution box',
      'Load redistribution across phases',
      'Safety certificate & 30-day rework warranty',
    ],
    warrantyDays: 30,
    image: '/banners/electrical-service.jpg',
    isPopular: true,
  },
  {
    id: 'srv-plumb-leak',
    slug: 'pipe-tap-leakage-repair',
    title: 'Major Tap & Concealed Pipe Leakage',
    categorySlug: 'plumbing-services',
    categoryTitle: 'Plumbing Services',
    description: 'Rapid repair of dripping taps, mixer valves, flushing cisterns, washbasin trap leaks, and concealed wall joint seepages.',
    price: 199,
    originalPrice: 349,
    durationMinutes: 35,
    rating: 4.87,
    reviewsCount: 3900,
    inclusions: [
      'Washer, spindle, and Teflon tape sealing',
      'Waste coupling replacement & alignment',
      'Water pressure checking & no-mess cleanup',
    ],
    warrantyDays: 30,
    image: '/banners/banner-1.png',
    isPopular: true,
  },
  {
    id: 'srv-fridge-cool',
    slug: 'refrigerator-not-cooling-check',
    title: 'Refrigerator Deep Cooling Diagnosis',
    categorySlug: 'refrigerator-services',
    categoryTitle: 'Refrigerator Care',
    description: 'Complete inspection of inverter compressor, defrost heater, thermostat sensor, evaporator fan motor, and gas leak check.',
    price: 299,
    originalPrice: 499,
    durationMinutes: 45,
    rating: 4.83,
    reviewsCount: 1650,
    inclusions: [
      'Compressor relay and capacitor test',
      'Gas pressure & coil frost analysis',
      'Zero inspection charge if repair is approved',
      '30-day warranty on spare replacements',
    ],
    warrantyDays: 30,
    image: '/banners/banner-2.png',
  },
  {
    id: 'srv-wash-drum',
    slug: 'washing-machine-drum-motor-fix',
    title: 'Washing Machine Drum & Drain Repair',
    categorySlug: 'washing-machine-services',
    categoryTitle: 'Washing Machines',
    description: 'Fix heavy vibration/noise, water not draining out, error codes (E1, E2, UE), belt slippage, and front door lock latch issue.',
    price: 349,
    originalPrice: 550,
    durationMinutes: 50,
    rating: 4.86,
    reviewsCount: 2100,
    inclusions: [
      'Drain pump unclogging & filter wash',
      'Motor capacitor & shock absorber check',
      'Door seal gasket & inlet valve test',
    ],
    warrantyDays: 30,
    image: '/banners/banner-3.png',
  },
  {
    id: 'srv-tank-clean',
    slug: 'underground-overhead-water-tank',
    title: 'Overhead & Sump Tank Clean (Up to 1000L)',
    categorySlug: 'water-tank-services',
    categoryTitle: 'Water Tank Cleaning',
    description: '6-stage mechanised deep cleaning: de-watering, high-pressure rotary jet, sludge suction, anti-bacterial spray, and UV sterilization.',
    price: 699,
    originalPrice: 1199,
    durationMinutes: 90,
    rating: 4.94,
    reviewsCount: 1120,
    inclusions: [
      'High-pressure water jet de-scaling',
      'Industrial sludge slurry pump evacuation',
      'Food-grade organic anti-bacterial wash',
      'UV wand microbial disinfection',
    ],
    warrantyDays: 60,
    image: '/banners/banner-1.png',
    isPopular: true,
  },
];

interface AppState {
  // Categories (Admin-editable)
  categories: Category[];
  updateCategory: (id: string, updates: Partial<Category>) => void;
  addCategory: (newCat: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (newCats: Category[]) => void;

  // Services
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

  // Location
  location: LocationData;
  isLocationModalOpen: boolean;
  setLocationModalOpen: (open: boolean) => void;
  setLocation: (loc: LocationData) => void;

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

export const INITIAL_ORDERS: OrderBooking[] = [
  {
    id: 'ORD-8492',
    items: [
      {
        service: INITIAL_SERVICES[0],
        quantity: 1,
      },
    ],
    itemTotal: 499,
    platformFee: 19,
    discount: 400,
    grandTotal: 518,
    address: '14th Main, HSR Layout Sector 2, Bengaluru, Karnataka - 560102',
    customerName: 'Charan H.S.',
    customerPhone: '+91 98450 12345',
    slot: {
      type: 'instant',
      dateLabel: 'Today',
      timeSlot: 'Doorstep arrival in 25 mins',
    },
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    technicianName: 'Sunil Gowda (Verified Partner)',
    technicianPhone: '+91 98765 43210',
  },
  {
    id: 'ORD-8488',
    items: [
      {
        service: INITIAL_SERVICES[2],
        quantity: 1,
      },
    ],
    itemTotal: 349,
    platformFee: 19,
    discount: 250,
    grandTotal: 368,
    address: 'Flat 402, Green Glen Heights, Bellandur, Bengaluru - 560103',
    customerName: 'Arun Prasad',
    customerPhone: '+91 98111 22334',
    slot: {
      type: 'instant',
      dateLabel: 'Today',
      timeSlot: 'Doorstep arrival in 40 mins',
    },
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    status: 'technician_assigned',
    createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    technicianName: 'Rajesh Kumar',
    technicianPhone: '+91 98444 55667',
  },
  {
    id: 'ORD-8470',
    items: [
      {
        service: INITIAL_SERVICES[7],
        quantity: 1,
      },
    ],
    itemTotal: 299,
    platformFee: 19,
    discount: 200,
    grandTotal: 318,
    address: 'House #22, 5th Cross, Koramangala 4th Block, Bengaluru',
    customerName: 'Kavitha R.',
    customerPhone: '+91 97444 88990',
    slot: {
      type: 'scheduled',
      dateLabel: 'Yesterday',
      timeSlot: '11:00 AM - 01:00 PM',
    },
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    status: 'completed',
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    technicianName: 'Sunil Gowda (Verified Partner)',
    technicianPhone: '+91 98765 43210',
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      categories: INITIAL_CATEGORIES,
      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      addCategory: (newCat) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { ...newCat, id: `cat-${Date.now()}` },
          ],
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),
      reorderCategories: (newCats) => set({ categories: newCats }),

      services: INITIAL_SERVICES,
      activeCategorySlug: 'all',
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
          (sum, item) => sum + (item.service.originalPrice - item.service.price) * item.quantity,
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
        
        // Auto-detect role from the Google Account identity
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

      // Location
      location: {
        area: 'HSR Layout, Sector 2',
        city: 'Bengaluru',
        pincode: '560102',
        fullAddress: '14th Main, HSR Layout Sector 2, Bengaluru, Karnataka',
        etaMinutes: 25,
      },
      isLocationModalOpen: false,
      setLocationModalOpen: (open) => set({ isLocationModalOpen: open }),
      setLocation: (loc) => set({ location: loc, isLocationModalOpen: false }),

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
        categories: state.categories,
        user: state.user,
        activeRole: state.activeRole,
        location: state.location,
        recentSearches: state.recentSearches,
        orders: state.orders,
      }),
    }
  )
);
