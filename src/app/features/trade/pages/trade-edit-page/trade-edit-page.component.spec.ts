import { HttpRequest, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { FormGroupDirective } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { I18nService } from '../../../../core/services/i18n.service';
import { AuthService } from '../../../auth/data-access/auth.service';
import { Trade } from '../../types/trade.models';
import { TradeEditPageComponent } from './trade-edit-page.component';

describe('TradeEditPageComponent update request', () => {
  let httpTestingController: HttpTestingController;

  const existingTrade: Trade = {
    tradeId: 'trade-1',
    tradeNo: '1',
    userId: 'user-1',
    symbol: 'BTCUSD',
    marketType: 'CRYPTO',
    side: 'BUY',
    entryPrice: '2200',
    exitPrice: null,
    stopLoss: '2300',
    takeProfit: '2500',
    quantity: '1',
    openTime: '2026-10-01T10:00:00.000Z',
    closeTime: null,
    status: 'OPEN',
    thesis: null,
    note: null,
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
    deletedAt: null,
    exitReason: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradeEditPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: () => 'trade-1' },
            },
          },
        },
        { provide: I18nService, useValue: { t: (key: string) => key } },
        {
          provide: AuthService,
          useValue: {
            restoreSession: () => undefined,
            getAccessToken: () => null,
          },
        },
      ],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('sends null for cleared TP and SL when editing an existing OPEN trade', () => {
    const fixture = TestBed.createComponent(TradeEditPageComponent);
    fixture.detectChanges();

    httpTestingController
      .expectOne((request) => request.method === 'GET' && request.url.endsWith('/trades/trade-1'))
      .flush(existingTrade);
    fixture.detectChanges();

    const form = fixture.debugElement
      .query(By.directive(FormGroupDirective))
      .injector.get(FormGroupDirective).form;

    expect(form.getRawValue().takeProfit).toBe('2500');
    expect(form.getRawValue().stopLoss).toBe('2300');

    const takeProfitInput = fixture.nativeElement.querySelector(
      '[formControlName="takeProfit"]',
    ) as HTMLInputElement;
    const stopLossInput = fixture.nativeElement.querySelector(
      '[formControlName="stopLoss"]',
    ) as HTMLInputElement;

    takeProfitInput.value = '';
    takeProfitInput.dispatchEvent(new Event('input'));
    stopLossInput.value = '';
    stopLossInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(form.getRawValue().takeProfit).toBe('');
    expect(form.getRawValue().stopLoss).toBe('');
    for (const field of [
      'symbol',
      'marketType',
      'side',
      'openTime',
      'entryPrice',
      'quantity',
      'stopLoss',
      'takeProfit',
    ]) {
      expect(form.get(field)?.enabled).toBe(true);
    }
    expect(form.get('thesis')?.enabled).toBe(true);
    expect(form.get('note')?.enabled).toBe(true);

    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );

    const patchRequest = httpTestingController.expectOne(
      (request) => request.method === 'PATCH' && request.url.endsWith('/trades/trade-1'),
    );
    const body = patchRequest.request.body as Record<string, unknown>;
    const serializedBody = patchRequest.request.serializeBody();

    expect(body['takeProfit']).toBeNull();
    expect(body['stopLoss']).toBeNull();
    expect(serializedBody).toContain('"takeProfit":null');
    expect(serializedBody).toContain('"stopLoss":null');

    fixture.destroy();
  });

  it('preserves a zero TP when editing an existing OPEN trade', () => {
    const fixture = TestBed.createComponent(TradeEditPageComponent);
    fixture.detectChanges();

    httpTestingController
      .expectOne((request) => request.method === 'GET' && request.url.endsWith('/trades/trade-1'))
      .flush(existingTrade);
    fixture.detectChanges();

    const form = fixture.debugElement
      .query(By.directive(FormGroupDirective))
      .injector.get(FormGroupDirective).form;
    const takeProfitInput = fixture.nativeElement.querySelector(
      '[formControlName="takeProfit"]',
    ) as HTMLInputElement;

    takeProfitInput.value = '0';
    takeProfitInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(form.getRawValue().takeProfit).toBe('0');

    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );

    const patchRequest = httpTestingController.expectOne(
      (request) => request.method === 'PATCH' && request.url.endsWith('/trades/trade-1'),
    );
    const body = patchRequest.request.body as Record<string, unknown>;

    expect(body['takeProfit']).toBe('0');
    fixture.destroy();
  });

  it('sends only journal fields when editing an existing CLOSED trade', () => {
    const fixture = TestBed.createComponent(TradeEditPageComponent);
    fixture.detectChanges();

    httpTestingController
      .expectOne((request) => request.method === 'GET' && request.url.endsWith('/trades/trade-1'))
      .flush({ ...existingTrade, status: 'CLOSED' });
    fixture.detectChanges();

    const form = fixture.debugElement
      .query(By.directive(FormGroupDirective))
      .injector.get(FormGroupDirective).form;

    for (const field of [
      'symbol',
      'marketType',
      'side',
      'openTime',
      'entryPrice',
      'quantity',
      'stopLoss',
      'takeProfit',
    ]) {
      expect(form.get(field)?.disabled).toBe(true);
    }
    expect(form.get('thesis')?.enabled).toBe(true);
    expect(form.get('note')?.enabled).toBe(true);

    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );

    const patchRequest = httpTestingController.expectOne(
      (request) => request.method === 'PATCH' && request.url.endsWith('/trades/trade-1'),
    );
    const body = patchRequest.request.body as Record<string, unknown>;

    expect(Object.keys(body).sort()).toEqual(['note', 'thesis']);

    fixture.destroy();
  });
});
