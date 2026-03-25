import { Trade } from '../types/trade.models';

export type TradeRangeKey = '1D' | '7D' | '30D';

export interface TradeAnalyticsSummary {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  mostTradedSymbol: string;
  estimatedPnl: number | null;
  pnlTradeCount: number;
}

export interface TradeBarDatum {
  label: string;
  value: number;
}

const RANGE_TO_DAYS: Record<TradeRangeKey, number> = {
  '1D': 1,
  '7D': 7,
  '30D': 30
};

export function filterTradesByRange(trades: Trade[], range: TradeRangeKey, now = new Date()): Trade[] {
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - (RANGE_TO_DAYS[range] - 1));

  return trades.filter((trade) => {
    const tradeDate = new Date(trade.openTime);
    return !Number.isNaN(tradeDate.getTime()) && tradeDate >= startDate && tradeDate <= now;
  });
}

export function computeTradeAnalytics(trades: Trade[]): TradeAnalyticsSummary {
  const symbolCounts = new Map<string, number>();
  let openTrades = 0;
  let closedTrades = 0;
  let estimatedPnl = 0;
  let pnlTradeCount = 0;

  for (const trade of trades) {
    symbolCounts.set(trade.symbol, (symbolCounts.get(trade.symbol) ?? 0) + 1);

    if (isTradeClosed(trade)) {
      closedTrades += 1;
    } else {
      openTrades += 1;
    }

    const pnl = calculateTradePnl(trade);
    if (pnl !== null) {
      estimatedPnl += pnl;
      pnlTradeCount += 1;
    }
  }

  const mostTradedSymbol =
    [...symbolCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'N/A';

  return {
    totalTrades: trades.length,
    openTrades,
    closedTrades,
    mostTradedSymbol,
    estimatedPnl: pnlTradeCount > 0 ? estimatedPnl : null,
    pnlTradeCount
  };
}

export function buildTradesOverTime(trades: Trade[], range: TradeRangeKey, now = new Date()): TradeBarDatum[] {
  const dayCount = RANGE_TO_DAYS[range];
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - (dayCount - 1));

  const buckets = new Map<string, number>();

  for (let index = 0; index < dayCount; index += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    buckets.set(formatDayKey(date), 0);
  }

  for (const trade of trades) {
    const tradeDate = new Date(trade.openTime);
    const key = formatDayKey(tradeDate);

    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }

  return [...buckets.entries()].map(([key, value]) => ({
    label: key,
    value
  }));
}

export function buildSymbolDistribution(trades: Trade[], limit = 5): TradeBarDatum[] {
  return buildDistribution(trades.map((trade) => trade.symbol), limit);
}

export function buildSideDistribution(trades: Trade[]): TradeBarDatum[] {
  return buildDistribution(trades.map((trade) => trade.side), 2);
}

function buildDistribution(values: string[], limit: number): TradeBarDatum[] {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }));
}

function calculateTradePnl(trade: Trade): number | null {
  if (!trade.exitPrice || !trade.quantity) {
    return null;
  }

  const entryPrice = Number(trade.entryPrice);
  const exitPrice = Number(trade.exitPrice);
  const quantity = Number(trade.quantity);

  if ([entryPrice, exitPrice, quantity].some((value) => Number.isNaN(value))) {
    return null;
  }

  if (trade.side === 'BUY') {
    return (exitPrice - entryPrice) * quantity;
  }

  return (entryPrice - exitPrice) * quantity;
}

function isTradeClosed(trade: Trade): boolean {
  return trade.status !== 'OPEN' || trade.closeTime !== null || trade.exitPrice !== null;
}

function formatDayKey(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(date);
}
