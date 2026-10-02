import type { UserRole } from '../types';

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

export const ADMIN_IDENTIFIERS = [
  '9999999999',
  'admin@reparzo.com',
];

export const PARTNER_IDENTIFIERS = [
  '9876543210',
  'partner@reparzo.com',
];

/**
 * Detects the user's role and profile automatically based on their phone or email.
 * No manual role selection required on the login screen.
 */
export function resolveUserByIdentifier(identifier: string, displayName?: string | null): RecognizedAccount {
  const digits = identifier.replace(/\D/g, '');
  const lower = identifier.trim().toLowerCase();

  // 1. Admin detection
  if (
    digits === '9999999999' || 
    lower === 'admin@reparzo.com' ||
    lower.startsWith('admin@')
  ) {
    return {
      phone: digits ? `+91 ${digits}` : '+91 99999 99999',
      displayPhone: '99999 99999',
      email: lower.includes('@') ? lower : 'admin@reparzo.com',
      name: displayName || 'Reparzo Executive Admin',
      role: 'admin',
      roleLabel: 'Admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      designation: 'Operations Director',
      badge: 'Executive Admin',
      targetRoute: '/admin',
      accentColor: '#E32402',
      description: 'Operations, live dispatch, and fleet management.',
    };
  }

  // 2. Partner / Technician detection
  if (
    digits === '9876543210' || 
    lower === 'partner@reparzo.com' ||
    lower.includes('partner@') || 
    lower.includes('tech@')
  ) {
    return {
      phone: digits ? `+91 ${digits}` : '+91 98765 43210',
      displayPhone: '98765 43210',
      email: lower.includes('@') ? lower : 'partner@reparzo.com',
      name: displayName || 'Verified Service Partner',
      role: 'partner',
      roleLabel: 'Partner',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      designation: 'Verified Technician',
      badge: 'Service Partner',
      targetRoute: '/partner',
      accentColor: '#F59E0B',
      description: 'Accept local repair bookings and track daily earnings.',
    };
  }

  // 3. Standard Customer (User)
  const isEmail = identifier.includes('@');
  const formattedPhone = digits.length === 10 ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` : (digits ? `+${digits}` : '');
  const fallbackName = displayName || (isEmail ? identifier.split('@')[0] : (digits ? `User ${digits.slice(-4)}` : 'Customer'));

  return {
    phone: formattedPhone || (isEmail ? '' : '+91 Mobile'),
    displayPhone: digits || identifier,
    email: isEmail ? identifier : '',
    name: fallbackName,
    role: 'user',
    roleLabel: 'Customer',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fallbackName)}&backgroundColor=0E1B4D,2563EB`,
    designation: 'Customer',
    badge: 'Member',
    targetRoute: '/',
    accentColor: '#2563EB',
    description: 'Book verified doorstep repairs with 30-day warranty.',
  };
}
