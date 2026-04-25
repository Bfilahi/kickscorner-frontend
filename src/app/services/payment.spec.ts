import { TestBed } from '@angular/core/testing';
import 'zone.js';

import { Payment } from './payment';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { AuthService } from './auth/auth-service';
import { PaymentRequest } from '../model/request/payment-request';
import { environment } from '../../environments/environment.development';
import { StripeResponse } from '../model/response/stripe-response';


describe('Payment', () => {
  let service: Payment;

  let mockAuthService: jasmine.SpyObj<AuthService>;
  let httpTestingController: HttpTestingController;

  let paymentRequest: PaymentRequest;
  let stripeResponse: StripeResponse;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj(['isLoggedIn']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: AuthService, useValue: mockAuthService},
      ]
    });

    paymentRequest = {
      currency: 'EUR',
      lineItems: [
        {
          name: 'mock-line-item-1 name',
          description: 'mock-line-item-1 description',
          amount: 20,
          quantity: 5,
          imgUrl: '/mock-img-url',
        },
        {
          name: 'mock-line-item-2 name',
          description: 'mock-line-item-2 description',
          amount: 70,
          quantity: 10,
          imgUrl: '/mock-img-url',
        }
      ]
    }

    stripeResponse = {
      status: 'SUCCESS',
      message: 'mock stripe message',
      sessionId: 'mock stripe session id',
      sessionUrl: '/mock-stripe-session-url'
    }

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(Payment);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call checkout with the correct URL', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);

    service.checkout(paymentRequest).subscribe();

    let req = httpTestingController.expectOne(`${environment.PAYMENT_URL}/checkout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(paymentRequest);
    req.flush(stripeResponse);
  });

  it('should throw an error when checkout is called and use is logged out', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);

    expect(() => service.checkout(paymentRequest)).toThrowError('User not authenticated');

    httpTestingController.expectNone(`${environment.PAYMENT_URL}/checkout`);
  });
});
