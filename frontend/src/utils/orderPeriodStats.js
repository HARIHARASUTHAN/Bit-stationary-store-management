/**
 * Safely parse a date value from an order.
 * Handles ISO strings, timestamps, Date objects, and YYYY-MM-DD date strings.
 */
export function parseDateSafe(raw) {
  if (!raw) return null;
  if (typeof raw === 'object') {
    if (typeof raw.toDate === 'function') return raw.toDate();
    if (typeof raw.seconds === 'number') return new Date(raw.seconds * 1000);
    if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw;
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    const dateOnlyMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) {
      return new Date(
        parseInt(dateOnlyMatch[1], 10),
        parseInt(dateOnlyMatch[2], 10) - 1,
        parseInt(dateOnlyMatch[3], 10)
      );
    }
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof raw === 'number') {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/**
 * Checks if a given date falls on the exact same local calendar day as the target (e.g. today).
 */
export function isSameCalendarDay(d1, d2) {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Calculates daily (current calendar day only), weekly (last 7 days), and monthly (last 30 days)
 * order counts and revenue metrics.
 */
export function getOrderPeriodStats(orders = []) {
  const now = new Date();

  // Local calendar boundaries
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);

  const isCollected = (o) => (o.status || '').toLowerCase().trim() === 'collected';
  const isNotCancelled = (o) => (o.status || '').toLowerCase().trim() !== 'cancelled';

  const sumRevenue = (list, collectedOnly = true) => {
    return list
      .filter((o) => (collectedOnly ? isCollected(o) : isNotCancelled(o)))
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  };

  const getStatusCounts = (list) => {
    let pending = 0;
    let ready = 0;
    let collected = 0;
    let cancelled = 0;

    for (const o of list) {
      const s = (o.status || '').toLowerCase().trim();
      if (s === 'pending') pending++;
      else if (s === 'ready') ready++;
      else if (s === 'collected') collected++;
      else if (s === 'cancelled') cancelled++;
    }

    return { pending, ready, collected, cancelled };
  };

  const safeOrders = Array.isArray(orders) ? orders : [];

  // 1. Daily Orders (Strictly the current calendar day only)
  // An order counts as daily if it was placed today OR collected today
  const dailyOrders = safeOrders.filter((o) => {
    const placed = parseDateSafe(o.placedAt || o.createdAt);
    const picked = parseDateSafe(o.pickedUpAt);
    return isSameCalendarDay(placed, now) || (isCollected(o) && isSameCalendarDay(picked, now));
  });

  // 2. Weekly Orders (Last 7 Days up to end of today)
  const weeklyOrders = safeOrders.filter((o) => {
    const placed = parseDateSafe(o.placedAt || o.createdAt);
    const picked = parseDateSafe(o.pickedUpAt);
    const d = placed || picked;
    if (!d) return false;
    const t = d.getTime();
    return t >= startOfWeek.getTime() && t <= endOfToday.getTime();
  });

  // 3. Monthly Orders (Last 30 Days or current month up to end of today)
  const monthlyOrders = safeOrders.filter((o) => {
    const placed = parseDateSafe(o.placedAt || o.createdAt);
    const picked = parseDateSafe(o.pickedUpAt);
    const d = placed || picked;
    if (!d) return false;
    const t = d.getTime();
    return (
      (t >= startOfMonth.getTime() && t <= endOfToday.getTime()) ||
      (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth())
    );
  });

  const dailyStatus = getStatusCounts(dailyOrders);
  const weeklyStatus = getStatusCounts(weeklyOrders);
  const monthlyStatus = getStatusCounts(monthlyOrders);
  const allTimeStatus = getStatusCounts(safeOrders);

  return {
    daily: {
      count: dailyOrders.length,
      orders: dailyOrders,
      collectedRevenue: sumRevenue(dailyOrders, true),
      grossRevenue: sumRevenue(dailyOrders, false),
      pendingCount: dailyStatus.pending,
      readyCount: dailyStatus.ready,
      collectedCount: dailyStatus.collected,
      cancelledCount: dailyStatus.cancelled,
    },
    weekly: {
      count: weeklyOrders.length,
      orders: weeklyOrders,
      collectedRevenue: sumRevenue(weeklyOrders, true),
      grossRevenue: sumRevenue(weeklyOrders, false),
      pendingCount: weeklyStatus.pending,
      readyCount: weeklyStatus.ready,
      collectedCount: weeklyStatus.collected,
      cancelledCount: weeklyStatus.cancelled,
    },
    monthly: {
      count: monthlyOrders.length,
      orders: monthlyOrders,
      collectedRevenue: sumRevenue(monthlyOrders, true),
      grossRevenue: sumRevenue(monthlyOrders, false),
      pendingCount: monthlyStatus.pending,
      readyCount: monthlyStatus.ready,
      collectedCount: monthlyStatus.collected,
      cancelledCount: monthlyStatus.cancelled,
    },
    allTime: {
      count: safeOrders.length,
      orders: safeOrders,
      collectedRevenue: sumRevenue(safeOrders, true),
      grossRevenue: sumRevenue(safeOrders, false),
      pendingCount: allTimeStatus.pending,
      readyCount: allTimeStatus.ready,
      collectedCount: allTimeStatus.collected,
      cancelledCount: allTimeStatus.cancelled,
    },
  };
}
