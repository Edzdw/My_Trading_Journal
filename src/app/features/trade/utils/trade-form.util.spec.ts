import {
  mapTradeJournalValueToUpdateRequest,
  mapTradeFormValueToUpdateRequest,
  TradeFormValue,
} from './trade-form.util';

describe('trade form request mapping', () => {
  const formValue: TradeFormValue = {
    symbol: 'BTCUSD',
    marketType: 'CRYPTO',
    side: 'BUY',
    entryPrice: '2300',
    stopLoss: '2300',
    takeProfit: '2500',
    quantity: '1',
    openTime: '2026-10-01T10:00',
    thesis: '',
    note: '',
  };

  it('sends cleared nullable prices as null and preserves numeric zero strings', () => {
    const request = mapTradeFormValueToUpdateRequest({
      ...formValue,
      stopLoss: '',
      takeProfit: '  ',
      quantity: '0',
    });

    expect(request.stopLoss).toBeNull();
    expect(request.takeProfit).toBeNull();
    expect(request.quantity).toBe('0');
  });

  it('builds a journal-only update without lifecycle or execution fields', () => {
    expect(mapTradeJournalValueToUpdateRequest({ thesis: '  ', note: 'Review' })).toEqual({
      thesis: null,
      note: 'Review',
    });
  });
});