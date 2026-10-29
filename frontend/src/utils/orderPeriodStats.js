/**
 * Calculates daily, weekly, and monthly order counts and revenue metrics.
 */
export function getOrderPeriodStats(orders = []) {
  const now = new Date();
  const nowMs = now.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const weekMs = 7 * dayMs;
  const monthMs = 30 * dayMs;

  const todayDateStr = now.toDateString();
  const todayIsoStr = now.toISOString().slice(0, 10);

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

  const validOrders = orders.filter((o) => o && o.placedAt);

  // 1. Daily Orders (Today)
  const dailyOrders = validOrders.filter((o) => {
    const d = new Date(o.placedAt);
    if (isNaN(d.getTime())) return false;
    return (
      d.toDateString() === todayDateStr ||
      d.toISOString().slice(0, 10) === todayIsoStr ||
      (nowMs - d.getTime() <= dayMs && nowMs >= d.getTime())
    );
  });

  // 2. Weekly Orders (Last 7 Days)
  const weeklyOrders = validOrders.filter((o) => {
    const d = new Date(o.placedAt);
    if (isNaN(d.getTime())) return false;
    return nowMs - d.getTime() <= weekMs && nowMs >= d.getTime();
  });

  // 3. Monthly Orders (Last 30 Days)
  const monthlyOrders = validOrders.filter((o) => {
    const d = new Date(o.placedAt);
    if (isNaN(d.getTime())) return false;
    return (
      nowMs - d.getTime() <= monthMs ||
      (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth())
    );
  });

  const dailyStatus = getStatusCounts(dailyOrders);
  const weeklyStatus = getStatusCounts(weeklyOrders);
  const monthlyStatus = getStatusCounts(monthlyOrders);
  const allTimeStatus = getStatusCounts(orders);

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
      count: orders.length,
      orders,
      collectedRevenue: sumRevenue(orders, true),
      grossRevenue: sumRevenue(orders, false),
      pendingCount: allTimeStatus.pending,
      readyCount: allTimeStatus.ready,
      collectedCount: allTimeStatus.collected,
      cancelledCount: allTimeStatus.cancelled,
    },
  };
}

