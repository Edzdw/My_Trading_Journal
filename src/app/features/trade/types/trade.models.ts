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

export type UpdateTradeRequest = Partial<CreateTradeRequest>;

export interface TradeImportPreviewSummary {
  sourceType: 'MT5_HTML';
  originalFilename: string;
  accountNo: string | null;
  accountName: string | null;
  brokerName: string | null;
  brokerServer: string | null;
  reportDate: string | null;
  totalRows: number;
  parsedRows: number;
  skippedRows: number;
}

export interface TradeImportPreviewTradeRow {
  externalPositionId: string;
  externalOrderId: string | null;
  symbol: string;
  side: string;
  quantity: string | null;
  entryPrice: string | null;
  stopLoss: string | null;
  takeProfit: string | null;
  openTime: string | null;
  exitPrice: string | null;
  closeTime: string | null;
  commission: string | null;
  swap: string | null;
  fee: string | null;
  profit: string | null;
  closeReason: 'TP' | 'SL' | 'UNKNOWN' | null;
  rawComment: string | null;
}

export interface TradeImportPreviewResponse {
  summary: TradeImportPreviewSummary;
  trades: TradeImportPreviewTradeRow[];
  warnings: string[];
  errors: string[];
}

export interface TradeImportConfirmSummary {
  sourceType: 'MT5_HTML';
  originalFilename: string;
  importBatchId: string;
  accountNo: string | null;
  accountName: string | null;
  brokerName: string | null;
  brokerServer: string | null;
  reportDate: string | null;
  totalRows: number;
  importedRows: number;
  skippedRows: number;
}

export interface TradeImportConfirmResponse {
  summary: TradeImportConfirmSummary;
  warnings: string[];
  errors: string[];
}
