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
  partnerRoleTitle: string;
  partnerPendingTitle: string;
  partnerPendingSubtitle: string;
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
        toastSuccess: 'Meat Order Placed! Dispatch scheduled.',
        partnerRoleTitle: 'Assigned Delivery Partner',
        partnerPendingTitle: 'Assigning Delivery Partner',
        partnerPendingSubtitle: 'Cold-chain delivery partner will be assigned from your nearest hub prior to departure.',
        confirmedTitle: 'Fresh Meat Order Confirmed!',
        confirmedSubtitle: 'Your order is confirmed. Fresh cuts will be packed in chilled insulated bags and dispatched.',
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
        toastSuccess: 'Parcel Order Placed! Runner dispatch scheduled.',
        partnerRoleTitle: 'Assigned Express Runner',
        partnerPendingTitle: 'Assigning Express Runner',
        partnerPendingSubtitle: 'A verified dispatch runner will be assigned from your local hub for doorstep pickup.',
        confirmedTitle: 'Parcel Pick-Drop Confirmed!',
        confirmedSubtitle: 'Your parcel request is confirmed. A verified runner will arrive to collect your package.',
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
        toastSuccess: 'Courier Order Placed! Logistics pickup scheduled.',
        partnerRoleTitle: 'Assigned Courier Partner',
        partnerPendingTitle: 'Assigning Courier Partner',
        partnerPendingSubtitle: 'A logistics agent will be assigned from your local hub for doorstep docket pickup.',
        confirmedTitle: 'Express Courier Order Confirmed!',
        confirmedSubtitle: 'Your courier order is confirmed. A logistics agent will arrive for doorstep package booking.',
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
        toastSuccess: 'Relocation Booking Placed! Crew scheduled.',
        partnerRoleTitle: 'Assigned Moving Supervisor',
        partnerPendingTitle: 'Assigning Moving Crew & Supervisor',
        partnerPendingSubtitle: 'Moving supervisor and transport truck team will be assigned prior to move date.',
        confirmedTitle: 'Home Relocation Confirmed!',
        confirmedSubtitle: 'Your relocation booking is confirmed. Moving team and transport vehicle are scheduled.',
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
        toastSuccess: 'Order Placed! Delivery partner scheduled.',
        partnerRoleTitle: 'Assigned Delivery Partner',
        partnerPendingTitle: 'Assigning Delivery Partner',
        partnerPendingSubtitle: 'Delivery partner from your nearest hub will be assigned prior to dispatch.',
        confirmedTitle: 'Doorstep Delivery Confirmed!',
        confirmedSubtitle: 'Your doorstep delivery order is confirmed and scheduled for dispatch.',
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
        toastSuccess: 'Booking Confirmed! Service scheduled.',
        partnerRoleTitle: 'Assigned Service Technician',
        partnerPendingTitle: 'Assigning Service Technician',
        partnerPendingSubtitle: 'Certified technician from your nearest hub will be assigned prior to arrival window.',
        confirmedTitle: 'Doorstep Service Confirmed!',
        confirmedSubtitle: 'Your service booking is confirmed. Certified technician will arrive with proper equipment.',
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
