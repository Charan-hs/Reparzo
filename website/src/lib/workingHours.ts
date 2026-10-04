import { OrderBooking } from '../types';

export const REPARZO_WORKING_HOURS = {
  startHour: 10, // 10:00 AM
  endHour: 18,   // 06:00 PM
  label: '10:00 AM – 06:00 PM',
  startFormatted: '10:00 AM',
  endFormatted: '06:00 PM',
};

/**
 * Format a Date object into a readable number-based date:
 * e.g. "4 Oct 2026" or "04 Oct 2026"
 */
export function formatNumericDate(date: Date, includeDayName: boolean = false): string {
  const day = date.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  if (includeDayName) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[date.getDay()];
    return `${dayName}, ${day} ${month} ${year}`;
  }

  return `${day} ${month} ${year}`;
}

/**
 * Returns a short numeric day-month string:
 * e.g. "4 Oct" or "04/10"
 */
export function formatShortDate(date: Date): string {
  const day = date.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${monthNames[date.getMonth()]}`;
}

export interface WorkingScheduleInfo {
  isClosed: boolean;
  statusBadgeText: string;
  statusBadgeVariant: 'active-today' | 'outside-hours' | 'scheduled-future' | 'completed' | 'cancelled';
  scheduleTitle: string;
  scheduleSubtitle: string;
  targetDateNumeric: string;
  serviceWindowLabel: string;
  stepperSubtext: string;
  isWithinWorkingHoursNow: boolean;
  isAfterHoursNow: boolean;
  isBeforeHoursNow: boolean;
}

/**
 * Computes the real-time working schedule for any booking.
 * 
 * Rules:
 * 1. Working hours are 10:00 AM – 06:00 PM.
 * 2. If order is completed or cancelled -> marked as closed.
 * 3. If user opens during working hours (10 AM - 6 PM):
 *    - If booked previously (yesterday or older) and still unserviced -> technician will visit TODAY (10 AM - 6 PM).
 *    - If booked today within working hours and confirmed -> technician will visit TODAY (10 AM - 6 PM).
 * 4. If user opens outside working hours (after 6 PM):
 *    - Today's working hours are closed -> technician will visit TOMORROW during working hours (10 AM - 6 PM).
 * 5. If user opens before 10 AM:
 *    - Technician will visit TODAY starting from 10 AM (10 AM - 6 PM).
 * 6. If scheduled for a future specific date (e.g. 2+ days ahead):
 *    - Shows that exact numeric date with working hours (10 AM - 6 PM).
 * 7. This evaluation is dynamic every day until order is closed/completed!
 */
export function getOrderWorkingSchedule(
  order: OrderBooking,
  currentTime: Date = new Date()
): WorkingScheduleInfo {
  // If order is already completed
  if (order.status === 'completed') {
    const completionDate = order.createdAt ? new Date(order.createdAt) : currentTime;
    const formatted = !isNaN(completionDate.getTime()) ? formatNumericDate(completionDate) : 'Completed';
    return {
      isClosed: true,
      statusBadgeText: 'Service Completed',
      statusBadgeVariant: 'completed',
      scheduleTitle: 'Doorstep Service Completed',
      scheduleSubtitle: `Work verified and completed on ${formatted}`,
      targetDateNumeric: formatted,
      serviceWindowLabel: 'Completed',
      stepperSubtext: 'Work Finished',
      isWithinWorkingHoursNow: false,
      isAfterHoursNow: false,
      isBeforeHoursNow: false,
    };
  }

  // If order is cancelled
  if (order.status === 'cancelled') {
    return {
      isClosed: true,
      statusBadgeText: 'Booking Cancelled',
      statusBadgeVariant: 'cancelled',
      scheduleTitle: 'Booking Cancelled',
      scheduleSubtitle: 'This service request was cancelled',
      targetDateNumeric: 'N/A',
      serviceWindowLabel: 'Cancelled',
      stepperSubtext: 'Cancelled',
      isWithinWorkingHoursNow: false,
      isAfterHoursNow: false,
      isBeforeHoursNow: false,
    };
  }

  const currentHour = currentTime.getHours();
  const isWithinWorkingHoursNow = currentHour >= REPARZO_WORKING_HOURS.startHour && currentHour < REPARZO_WORKING_HOURS.endHour;
  const isAfterHoursNow = currentHour >= REPARZO_WORKING_HOURS.endHour;
  const isBeforeHoursNow = currentHour < REPARZO_WORKING_HOURS.startHour;

  const today = new Date(currentTime);
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(currentTime);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Check if order has an explicit scheduled date
  let orderScheduledDate: Date | null = null;
  if (order.slot?.scheduledDate) {
    const parsed = new Date(order.slot.scheduledDate);
    if (!isNaN(parsed.getTime())) {
      orderScheduledDate = parsed;
      orderScheduledDate.setHours(0, 0, 0, 0);
    }
  }

  // If order was explicitly booked for a date strictly beyond tomorrow
  const dayAfterTomorrow = new Date(currentTime);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
  dayAfterTomorrow.setHours(23, 59, 59, 999);

  if (orderScheduledDate && orderScheduledDate > dayAfterTomorrow) {
    const formattedFuture = formatNumericDate(orderScheduledDate);
    const shortFuture = formatShortDate(orderScheduledDate);
    return {
      isClosed: false,
      statusBadgeText: `Scheduled for ${shortFuture}`,
      statusBadgeVariant: 'scheduled-future',
      scheduleTitle: `Scheduled for ${formattedFuture}`,
      scheduleSubtitle: `Doorstep appointment booked for ${formattedFuture} during working hours (${REPARZO_WORKING_HOURS.label})`,
      targetDateNumeric: formattedFuture,
      serviceWindowLabel: `${formattedFuture} • ${REPARZO_WORKING_HOURS.label}`,
      stepperSubtext: `${shortFuture} • 10 AM–6 PM`,
      isWithinWorkingHoursNow,
      isAfterHoursNow,
      isBeforeHoursNow,
    };
  }

  // If user opens during working hours (10 AM - 6 PM)
  if (isWithinWorkingHoursNow) {
    const todayFormatted = formatNumericDate(currentTime);
    const todayShort = formatShortDate(currentTime);

    const isOngoing = order.status === 'in_progress';
    const subtitle = isOngoing
      ? `Doorstep service / delivery is currently underway at customer address.`
      : `Doorstep appointment scheduled today (${todayFormatted}) during active working hours (${REPARZO_WORKING_HOURS.label}).`;

    return {
      isClosed: false,
      statusBadgeText: isOngoing ? 'Order Underway' : 'Visiting Today (Working Hours)',
      statusBadgeVariant: 'active-today',
      scheduleTitle: isOngoing ? 'Order Underway' : `Visiting Today, ${todayFormatted}`,
      scheduleSubtitle: subtitle,
      targetDateNumeric: todayFormatted,
      serviceWindowLabel: `Today (${todayFormatted}) • ${REPARZO_WORKING_HOURS.label}`,
      stepperSubtext: `Today (${todayShort}) • 10 AM–6 PM`,
      isWithinWorkingHoursNow,
      isAfterHoursNow,
      isBeforeHoursNow,
    };
  }

  // If user opens after working hours (after 6 PM)
  if (isAfterHoursNow) {
    const tomorrowFormatted = formatNumericDate(tomorrow);
    const tomorrowShort = formatShortDate(tomorrow);

    return {
      isClosed: false,
      statusBadgeText: 'Visiting Tomorrow (10 AM – 6 PM)',
      statusBadgeVariant: 'outside-hours',
      scheduleTitle: `Next Service: Tomorrow, ${tomorrowFormatted}`,
      scheduleSubtitle: `Today's working hours (${REPARZO_WORKING_HOURS.label}) have closed. Doorstep appointment scheduled for tomorrow (${tomorrowFormatted}) during working hours (${REPARZO_WORKING_HOURS.label}).`,
      targetDateNumeric: tomorrowFormatted,
      serviceWindowLabel: `Tomorrow (${tomorrowFormatted}) • ${REPARZO_WORKING_HOURS.label}`,
      stepperSubtext: `Tomorrow (${tomorrowShort}) • 10 AM–6 PM`,
      isWithinWorkingHoursNow,
      isAfterHoursNow,
      isBeforeHoursNow,
    };
  }

  // If user opens early morning before 10 AM
  const todayFormatted = formatNumericDate(currentTime);
  const todayShort = formatShortDate(currentTime);

  return {
    isClosed: false,
    statusBadgeText: 'Starts Today at 10:00 AM',
    statusBadgeVariant: 'active-today',
    scheduleTitle: `Visiting Today, ${todayFormatted}`,
    scheduleSubtitle: `Working hours start at 10:00 AM. Doorstep appointment scheduled today (${todayFormatted}) between 10:00 AM and 06:00 PM.`,
    targetDateNumeric: todayFormatted,
    serviceWindowLabel: `Today (${todayFormatted}) • ${REPARZO_WORKING_HOURS.label}`,
    stepperSubtext: `Today (${todayShort}) • 10 AM–6 PM`,
    isWithinWorkingHoursNow,
    isAfterHoursNow,
    isBeforeHoursNow,
  };
}
