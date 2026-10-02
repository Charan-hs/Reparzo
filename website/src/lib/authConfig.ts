import type { UserRole, UserProfile } from '../types';

export interface RecognizedAccount {
  phone: string;
  displayPhone: string;
  email: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  avatar: string;
  designation: string;
  badge: string;
  targetRoute: string;
  accentColor: string;
  description: string;
}

export const PRESET_ACCOUNTS: Record<UserRole, RecognizedAccount> = {
  admin: {
    phone: '9999999999',
    displayPhone: '99999 99999',
    email: 'admin@reparzo.com',
    name: 'Reparzo Executive Admin',
    role: 'admin',
    roleLabel: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    designation: 'Operations Director & SuperAdmin',
    badge: 'Executive Admin',
    targetRoute: '/admin',
    accentColor: '#E32402',
    description: 'Access full CMS, live dispatches, partner fleet and platform pricing.',
  },
  partner: {
    phone: '9876543210',
    displayPhone: '98765 43210',
    email: 'partner@reparzo.com',
    name: 'Sunil Gowda (Verified Partner)',
    role: 'partner',
    roleLabel: 'Partner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    designation: 'Master AC & Electrical Technician',
    badge: 'Verified Partner',
    targetRoute: '/partner',
    accentColor: '#F59E0B',
    description: 'Accept local repair jobs in your neighborhood and track daily earnings.',
  },
  user: {
    phone: '9845012345',
    displayPhone: '98450 12345',
    email: 'charan@reparzo.com',
    name: 'Charan H.S. (Customer)',
    role: 'user',
    roleLabel: 'Customer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    designation: 'Reparzo Verified Customer',
    badge: 'Customer Account',
    targetRoute: '/',
    accentColor: '#2563EB',
    description: 'Book doorstep technicians in 60-90 mins with 30-day warranty.',
  },
};

/**
 * Detects the user's role and profile automatically based on their phone or email.
 * No manual role selection required on the login screen.
 */
export function resolveUserByIdentifier(identifier: string): RecognizedAccount {
  const digits = identifier.replace(/\D/g, '');
  const lower = identifier.trim().toLowerCase();

  // 1. Admin detection
  if (
    digits === '9999999999' || 
    digits === '9888888888' || 
    lower === 'admin@reparzo.com' ||
    lower.startsWith('admin')
  ) {
    return PRESET_ACCOUNTS.admin;
  }

  // 2. Partner / Technician detection
  if (
    digits === '9876543210' || 
    digits === '9111111111' || 
    lower === 'partner@reparzo.com' ||
    lower.includes('partner') || 
    lower.includes('tech')
  ) {
    return PRESET_ACCOUNTS.partner;
  }

  // 3. Known Demo Customer
  if (digits === '9845012345' || lower.includes('charan')) {
    return PRESET_ACCOUNTS.user;
  }

  // 4. Any other phone number or email is automatically a standard Customer (User)
  const isEmail = identifier.includes('@');
  return {
    phone: digits ? (digits.length === 10 ? `+91 ${digits}` : digits) : '+91 98450 12345',
    displayPhone: digits || 'Customer',
    email: isEmail ? identifier : `user.${digits.slice(-4) || 'member'}@reparzo.com`,
    name: digits ? `Customer (+91 ${digits.slice(0, 5)} ${digits.slice(5)})` : 'Reparzo Customer',
    role: 'user',
    roleLabel: 'Customer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    designation: 'Reparzo Verified Customer',
    badge: 'Customer Account',
    targetRoute: '/',
    accentColor: '#2563EB',
    description: 'Book verified doorstep repairs with 30-day warranty.',
  };
}
