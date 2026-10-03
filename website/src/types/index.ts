export type UserRole = 'user' | 'partner' | 'admin';

export interface SubCategory {
  id: string;
  categoryId: string;
  categorySlug: string;
  title: string;
  slug: string;
  iconName?: string;
  description: string;
  badge?: string;
  startingPrice: number;
  originalPrice?: number;
  durationMinutes: number;
  warrantyDays: number;
  isActive: boolean;
  order: number;
  features?: string[];
  image?: string;
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  iconName: string;
  description: string;
  badge?: string;
  bgGradient: string;
  isActive: boolean;
  order: number;
  subCategories?: SubCategory[];
  image?: string;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  categorySlug: string;
  categoryTitle: string;
  subCategorySlug?: string;
  subCategoryTitle?: string;
  description: string;
  price: number;
  originalPrice: number;
  durationMinutes: number;
  rating: number;
  reviewsCount: number;
  inclusions: string[];
  warrantyDays: number;
  image: string;
  isPopular?: boolean;
}

export interface CartItem {
  service: Service;
  quantity: number;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  partnerStatus?: 'online' | 'offline';
  partnerRating?: number;
  earningsToday?: number;
}

export interface LocationData {
  area: string;
  city: string;
  pincode: string;
  fullAddress: string;
  etaMinutes: number;
}

export interface BookingSlot {
  type: 'instant' | 'scheduled';
  dateLabel: string;
  timeSlot: string;
}

export interface OrderBooking {
  id: string;
  items: CartItem[];
  itemTotal: number;
  platformFee: number;
  discount: number;
  grandTotal: number;
  address: string;
  customerName: string;
  customerPhone: string;
  slot: BookingSlot;
  paymentMethod: 'upi' | 'card' | 'cash';
  paymentStatus: 'paid' | 'pending';
  status: 'confirmed' | 'technician_assigned' | 'in_progress' | 'completed';
  createdAt: string;
  technicianName: string;
  technicianPhone: string;
}
