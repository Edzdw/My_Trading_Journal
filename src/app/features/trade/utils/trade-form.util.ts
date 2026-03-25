import { FormBuilder, Validators } from '@angular/forms';

import { CreateTradeRequest, Trade, TradeMarketType, TradeSide, UpdateTradeRequest } from '../types/trade.models';

export interface TradeFormValue {
  symbol: string;
  marketType: TradeMarketType;
  side: TradeSide;
  entryPrice: string;
  stopLoss: string;
  takeProfit: string;
  quantity: string;
  openTime: string;
  thesis: string;
  note: string;
}

export function buildTradeForm(formBuilder: FormBuilder, trade?: Trade) {
  return formBuilder.nonNullable.group({
    symbol: [trade?.symbol ?? '', [Validators.required]],
    marketType: [trade?.marketType ?? 'CRYPTO', [Validators.required]],
    side: [trade?.side ?? 'BUY', [Validators.required]],
    entryPrice: [trade?.entryPrice ?? '', [Validators.required]],
    stopLoss: [trade?.stopLoss ?? '', [Validators.required]],
    takeProfit: [trade?.takeProfit ?? '', [Validators.required]],
    quantity: [trade?.quantity ?? '', [Validators.required]],
    openTime: [trade ? toDateTimeLocalValue(trade.openTime) : '', [Validators.required]],
    thesis: [trade?.thesis ?? ''],
    note: [trade?.note ?? '']
  });
}

export function mapTradeFormValueToCreateRequest(formValue: TradeFormValue): CreateTradeRequest {
  return {
    symbol: formValue.symbol.trim().toUpperCase(),
    marketType: formValue.marketType,
    side: formValue.side,
    entryPrice: formValue.entryPrice.trim(),
    stopLoss: formValue.stopLoss.trim(),
    takeProfit: formValue.takeProfit.trim(),
    quantity: formValue.quantity.trim(),
    openTime: new Date(formValue.openTime).toISOString(),
    thesis: nullableText(formValue.thesis),
    note: nullableText(formValue.note)
  };
}

export function mapTradeFormValueToUpdateRequest(formValue: TradeFormValue): UpdateTradeRequest {
  return mapTradeFormValueToCreateRequest(formValue);
}

export function toDateTimeLocalValue(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  const offsetMinutes = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offsetMinutes * 60_000);

  return localDate.toISOString().slice(0, 16);
}

function nullableText(value: string): string | null {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}
