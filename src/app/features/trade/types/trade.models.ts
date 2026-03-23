export type TradeMarketType = 'CRYPTO' | 'FOREX' | 'STOCK' | 'FUTURES';
export type TradeSide = 'BUY' | 'SELL';
export type TradeStatus = 'OPEN' | 'CLOSED' | 'CANCELLED';

export interface Trade {
  tradeId: string;
  tradeNo: string;
  userId: string;
  symbol: string;
  marketType: TradeMarketType;
  side: TradeSide;
  entryPrice: string;
  exitPrice: string | null;
  stopLoss: string;
  takeProfit: string;
  quantity: string;
  openTime: string;
  closeTime: string | null;
  status: TradeStatus;
  thesis: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateTradeRequest {
  symbol: string;
  marketType: TradeMarketType;
  side: TradeSide;
  entryPrice: string;
  stopLoss: string;
  takeProfit: string;
  quantity: string;
  openTime: string;
  thesis: string | null;
  note: string | null;
}
