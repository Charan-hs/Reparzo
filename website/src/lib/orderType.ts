import type { CartItem } from '../types';

export type OrderCategoryKind = 'meat' | 'parcel' | 'courier' | 'shifting' | 'delivery' | 'service';

export interface OrderTypeDetails {
  kind: OrderCategoryKind;
  badge: string;
  checkoutTitle: string;
  addressSectionTitle: string;
  addressCardTitle: string;
  slotSectionTitle: string;
  instantSlotLabel: string;
  instantSlotDesc: string;
  summaryTitle: string;
  confirmCtaText: string;
  toastSuccess: string;
  partnerName: string;
  partnerPhone: string;
  partnerInitial: string;
  partnerRoleTitle: string;
  confirmedTitle: string;
  confirmedSubtitle: string;
  step1: string;
  step2: string;
  step3: string;
  pinTitle: string;
  pinSubtitle: string;
  cancellationText: string;
  partnerCallAction: string;
}

export function getOrderCategoryKind(items: CartItem[]): OrderCategoryKind {
  if (!items || items.length === 0) return 'service';
  
  const identifiers = items.map((i) => {
    const slug = i.service?.categorySlug?.toLowerCase() || '';
    const catTitle = i.service?.categoryTitle?.toLowerCase() || '';
    const title = i.service?.title?.toLowerCase() || '';
    return `${slug} ${catTitle} ${title}`;
  });

  const hasMeat = identifiers.some((s) => s.includes('meat') || s.includes('chicken') || s.includes('mutton') || s.includes('fish') || s.includes('prawn'));
  const hasParcel = identifiers.some((s) => s.includes('parcel') || s.includes('pick-drop') || s.includes('pick and drop') || s.includes('pick & drop'));
  const hasCourier = identifiers.some((s) => s.includes('courier') || s.includes('docket') || s.includes('intercity parcel'));
  const hasShifting = identifiers.some((s) => s.includes('shift') || s.includes('moving') || s.includes('relocation'));

  if (identifiers.every((s) => s.includes('meat') || s.includes('chicken') || s.includes('mutton') || s.includes('fish') || s.includes('prawn'))) return 'meat';
  if (identifiers.every((s) => s.includes('parcel') || s.includes('pick-drop') || s.includes('pick and drop') || s.includes('pick & drop'))) return 'parcel';
  if (identifiers.every((s) => s.includes('courier') || s.includes('docket') || s.includes('intercity parcel'))) return 'courier';
  if (identifiers.every((s) => s.includes('shift') || s.includes('moving') || s.includes('relocation'))) return 'shifting';
  
  if (hasMeat && !hasParcel && !hasCourier && !hasShifting) return 'meat';
  if (hasParcel && !hasMeat && !hasCourier && !hasShifting) return 'parcel';
  if (hasCourier && !hasMeat && !hasParcel && !hasShifting) return 'courier';
  if (hasShifting && !hasMeat && !hasParcel && !hasCourier) return 'shifting';

  if (hasMeat || hasParcel || hasCourier) return 'delivery';

  return 'service';
}

export function getOrderTypeDetails(items: CartItem[]): OrderTypeDetails {
  const kind = getOrderCategoryKind(items);

  switch (kind) {
    case 'meat':
      return {
        kind: 'meat',
        badge: 'Fresh Meat Checkout',
        checkoutTitle: 'Confirm Fresh Meat Order & Delivery',
        addressSectionTitle: '1. Doorstep Delivery Address & Contact',
        addressCardTitle: 'Delivery Address',
        slotSectionTitle: '2. Preferred Delivery Slot',
        instantSlotLabel: 'Express Meat Delivery Slot',
        instantSlotDesc: 'Cold-chain insulated packing & delivery within working hours today (10 AM - 6 PM)',
        summaryTitle: 'Meat Order Summary',
        confirmCtaText: 'Confirm Order • Pay on Delivery',
        toastSuccess: 'Meat Order Confirmed! Cold-chain delivery partner assigned.',
        partnerName: 'Suresh Kumar (Verified Cold-Chain Delivery Partner)',
        partnerPhone: '+91 98450 66219',
        partnerInitial: 'SK',
        partnerRoleTitle: 'Assigned Delivery Partner',
        confirmedTitle: 'Fresh Meat Order Confirmed!',
        confirmedSubtitle: 'Our delivery partner is packing fresh cuts in chilled insulated bags and dispatched to your location.',
        step1: 'Order Placed',
        step2: 'Delivery Partner Assigned',
        step3: 'Doorstep Delivery Slot',
        pinTitle: 'Delivery Verification PIN (OTP)',
        pinSubtitle: 'Share this PIN with your delivery partner only after receiving and inspecting your package.',
        cancellationText: 'Zero cancellation fee before delivery partner dispatch',
        partnerCallAction: 'Call Partner',
      };

    case 'parcel':
      return {
        kind: 'parcel',
        badge: 'Parcel Pick & Drop Checkout',
        checkoutTitle: 'Confirm Parcel Pick & Drop Order',
        addressSectionTitle: '1. Pickup / Delivery Address & Contact',
        addressCardTitle: 'Pickup / Drop Address',
        slotSectionTitle: '2. Preferred Pickup Slot',
        instantSlotLabel: 'Express Pickup & Drop Slot',
        instantSlotDesc: 'Dedicated runner arrives for pickup within working hours today (10 AM - 6 PM)',
        summaryTitle: 'Parcel Order Summary',
        confirmCtaText: 'Confirm Dispatch • Pay on Handoff / Delivery',
        toastSuccess: 'Parcel Order Confirmed! Express runner assigned.',
        partnerName: 'Vikram Singh (Express Dispatch Runner)',
        partnerPhone: '+91 98450 77123',
        partnerInitial: 'VS',
        partnerRoleTitle: 'Assigned Express Runner',
        confirmedTitle: 'Parcel Pick-Drop Confirmed!',
        confirmedSubtitle: 'Our verified dispatch runner is en route to collect your package from your doorstep.',
        step1: 'Pickup Confirmed',
        step2: 'Express Runner Assigned',
        step3: 'Scheduled Package Handoff',
        pinTitle: 'Package Handover PIN (OTP)',
        pinSubtitle: 'Share this PIN with your runner only after package pickup or safe delivery.',
        cancellationText: 'Zero cancellation fee before runner arrival',
        partnerCallAction: 'Call Runner',
      };

    case 'courier':
      return {
        kind: 'courier',
        badge: 'Express Courier Checkout',
        checkoutTitle: 'Confirm Express Courier Order',
        addressSectionTitle: '1. Courier Pickup Address & Contact',
        addressCardTitle: 'Courier Address',
        slotSectionTitle: '2. Preferred Courier Slot',
        instantSlotLabel: 'Express Courier Slot',
        instantSlotDesc: 'Courier logistics partner arrives for package booking today (10 AM - 6 PM)',
        summaryTitle: 'Courier Order Summary',
        confirmCtaText: 'Confirm Courier • Pay on Dispatch / Delivery',
        toastSuccess: 'Courier Order Confirmed! Logistics specialist assigned.',
        partnerName: 'Arun Kumar (Logistics Specialist)',
        partnerPhone: '+91 98450 88312',
        partnerInitial: 'AK',
        partnerRoleTitle: 'Assigned Courier Partner',
        confirmedTitle: 'Express Courier Order Confirmed!',
        confirmedSubtitle: 'Our logistics courier runner has been assigned and scheduled for doorstep pickup.',
        step1: 'Courier Confirmed',
        step2: 'Logistics Agent Assigned',
        step3: 'Scheduled Doorstep Pickup',
        pinTitle: 'Docket Handover PIN',
        pinSubtitle: 'Share this PIN with the courier agent upon physical handover.',
        cancellationText: 'Zero cancellation fee before courier pickup',
        partnerCallAction: 'Call Partner',
      };

    case 'shifting':
      return {
        kind: 'shifting',
        badge: 'Home Relocation Checkout',
        checkoutTitle: 'Confirm Home Shifting & Relocation',
        addressSectionTitle: '1. Moving Address & Contact',
        addressCardTitle: 'Relocation Address',
        slotSectionTitle: '2. Moving & Loading Time Slot',
        instantSlotLabel: 'Today Shifting Slot',
        instantSlotDesc: 'Moving crew and transport truck arranged within working hours today (10 AM - 6 PM)',
        summaryTitle: 'Relocation Summary',
        confirmCtaText: 'Confirm Move • Pay After Unloading',
        toastSuccess: 'Relocation Confirmed! Moving crew assigned.',
        partnerName: 'Manjunath K (Moving Fleet Supervisor)',
        partnerPhone: '+91 98450 99451',
        partnerInitial: 'MK',
        partnerRoleTitle: 'Assigned Moving Supervisor',
        confirmedTitle: 'Home Relocation Confirmed!',
        confirmedSubtitle: 'Our moving supervisor and truck team have been assigned for your move.',
        step1: 'Move Confirmed',
        step2: 'Moving Crew Assigned',
        step3: 'Scheduled Loading & Transit',
        pinTitle: 'Move Completion PIN',
        pinSubtitle: 'Share this PIN with the supervisor only after unloading and inspection.',
        cancellationText: 'Zero cancellation fee before truck arrival',
        partnerCallAction: 'Call Supervisor',
      };

    case 'delivery':
      return {
        kind: 'delivery',
        badge: 'Express Delivery Checkout',
        checkoutTitle: 'Confirm Doorstep Delivery Order',
        addressSectionTitle: '1. Doorstep Delivery Address & Contact',
        addressCardTitle: 'Delivery Address',
        slotSectionTitle: '2. Preferred Delivery Slot',
        instantSlotLabel: 'Express Delivery Slot',
        instantSlotDesc: 'Delivery partner arrives within working hours today (10 AM - 6 PM)',
        summaryTitle: 'Delivery Order Summary',
        confirmCtaText: 'Confirm Order • Pay on Delivery',
        toastSuccess: 'Order Confirmed! Delivery partner assigned.',
        partnerName: 'Suresh Kumar (Verified Delivery Partner)',
        partnerPhone: '+91 98450 66219',
        partnerInitial: 'SK',
        partnerRoleTitle: 'Assigned Delivery Partner',
        confirmedTitle: 'Doorstep Delivery Confirmed!',
        confirmedSubtitle: 'Our verified delivery partner has been dispatched to your location.',
        step1: 'Order Placed',
        step2: 'Delivery Partner Assigned',
        step3: 'Doorstep Delivery Slot',
        pinTitle: 'Delivery Verification PIN (OTP)',
        pinSubtitle: 'Share this PIN with your delivery partner only after receiving and inspecting your order.',
        cancellationText: 'Zero cancellation fee before delivery partner dispatch',
        partnerCallAction: 'Call Partner',
      };

    default: // 'service'
      return {
        kind: 'service',
        badge: 'Doorstep Service Checkout',
        checkoutTitle: 'Confirm Doorstep Service Booking',
        addressSectionTitle: '1. Doorstep Address & Contact',
        addressCardTitle: 'Doorstep Service Address',
        slotSectionTitle: '2. Choose Preferred Arrival Time',
        instantSlotLabel: 'Today (Working Hours)',
        instantSlotDesc: 'Technician arrives today (10 AM - 6 PM)',
        summaryTitle: 'Booking Summary',
        confirmCtaText: 'Confirm Booking • Pay After Service',
        toastSuccess: 'Booking Confirmed! Technician assigned.',
        partnerName: 'Ramesh Gowda (Certified Master Technician)',
        partnerPhone: '+91 98450 88219',
        partnerInitial: 'RG',
        partnerRoleTitle: 'Assigned Service Technician',
        confirmedTitle: 'Doorstep Service Confirmed!',
        confirmedSubtitle: 'Our verified technician is preparing tools and dispatched to your location.',
        step1: 'Booking Confirmed',
        step2: 'Technician Assigned',
        step3: 'Scheduled Doorstep Visit',
        pinTitle: 'Service Completion PIN',
        pinSubtitle: 'Share this PIN with your technician only after physical work is verified and tested.',
        cancellationText: 'Zero cancellation fee before technician arrival',
        partnerCallAction: 'Call Technician',
      };
  }
}
