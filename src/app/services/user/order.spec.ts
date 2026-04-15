import { TestBed } from '@angular/core/testing';
import 'zone.js';

import { Order } from './order';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { OrderResponse } from '../../model/response/order-response';
import { environment } from '../../../environments/environment.development';

describe('Order', () => {
  let service: Order;
  let httpTestingController: HttpTestingController;

  let url: string = environment.ORDERS_URL;
  let mockOrdersResponse: OrderResponse[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    mockOrdersResponse = [
      {
        id: 1,
        stripeSessionId: 'cs_test_123456789',
        totalQuantity: 3,
        totalPrice: 89.97,
        dateCreated: new Date('2026-04-10T14:32:00'),
        shippingAddress: {
          line1: '123 Main Street',
          line2: 'Apt 4B',
          city: 'Modena',
          state: 'MO',
          postalCode: '41121',
          country: 'Italy',
        },
        orderItems: [
          {
            id: 1,
            name: 'Gaming Mouse',
            unitPrice: 29.99,
            quantity: 1,
            imageUrl: 'https://example.com/images/mouse.jpg',
            productId: 101,
          },
          {
            id: 2,
            name: 'Mechanical Keyboard',
            unitPrice: 59.98,
            quantity: 2,
            imageUrl: 'https://example.com/images/keyboard.jpg',
            productId: 102,
          },
        ],
      },
      {
        id: 2,
        stripeSessionId: 'cs_test_987654321',
        totalQuantity: 2,
        totalPrice: 49.98,
        dateCreated: new Date('2026-04-12T09:15:00'),
        shippingAddress: {
          line1: '456 Via Emilia',
          line2: '',
          city: 'Bologna',
          state: 'BO',
          postalCode: '40100',
          country: 'Italy',
        },
        orderItems: [
          {
            id: 3,
            name: 'Wireless Headphones',
            unitPrice: 24.99,
            quantity: 1,
            imageUrl: 'https://example.com/images/headphones.jpg',
            productId: 103,
          },
          {
            id: 4,
            name: 'USB-C Cable',
            unitPrice: 24.99,
            quantity: 1,
            imageUrl: 'https://example.com/images/cable.jpg',
            productId: 104,
          },
        ],
      },
    ];

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(Order);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOrders()', () => {
    it('should call the method with the correct URL', () => {
      service.getOrders().subscribe(res => expect(res).toEqual(mockOrdersResponse));

      let req = httpTestingController.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush(mockOrdersResponse);
    });

    it('should propaget errors', () => {
      service.getOrders().subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500)
      });

      httpTestingController.expectOne(url)
      .flush('Server error', {status: 500, statusText: 'Internal Server Error'});
    });
  });

  
});
