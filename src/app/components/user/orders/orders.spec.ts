import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { Orders } from './orders';
import { NgxSpinnerService } from 'ngx-spinner';
import { Order } from '../../../services/user/order';
import { NEVER, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { OrderResponse } from '../../../model/response/order-response';
import { By } from '@angular/platform-browser';
import { OrderItemDTO } from '../../../model/OrderItemDTO';

describe('Orders', () => {
  let component: Orders;
  let fixture: ComponentFixture<Orders>;

  let mockOrderService: jasmine.SpyObj<Order>;
  let spinnerService: NgxSpinnerService;

  let mockOrdersResponse: OrderResponse[];

  beforeEach(async () => {
    mockOrderService = jasmine.createSpyObj(['getOrders']);

    mockOrderService.getOrders.and.returnValue(NEVER);

    await TestBed.configureTestingModule({
      imports: [Orders],
      providers: [
        NgxSpinnerService,
        { provide: Order, useValue: mockOrderService }
      ]
    })
    .compileComponents();

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

    spinnerService = TestBed.inject(NgxSpinnerService);
    fixture = TestBed.createComponent(Orders);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should call listOrders(), which triggers orderService.getOrders()', () => {
      fixture.detectChanges();

      expect(mockOrderService.getOrders).toHaveBeenCalled();
    });
    
    it('should show the spinner before calling orderService.getOrders()', () => {
      spyOn(spinnerService, 'show');

      fixture.detectChanges();

      expect(spinnerService.show).toHaveBeenCalled();
    });

    it('should hide spinner during loading the response on success', () => {
      mockOrderService.getOrders.and.returnValue(of([]));
      spyOn(spinnerService, 'hide');

      fixture.detectChanges();

      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should hide spinner after the response on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockOrderService.getOrders.and.returnValue(throwError(() => error));
      spyOn(spinnerService, 'hide');

      fixture.detectChanges();

      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should isLoading to false on success', () => {
      mockOrderService.getOrders.and.returnValue(of([]));

      fixture.detectChanges();

      expect(component.isLoading).toBeFalse();
    });

    it('should isLoading to false on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockOrderService.getOrders.and.returnValue(throwError(() => error));

      fixture.detectChanges();

      expect(component.isLoading).toBeFalse();
    });
  });

  describe('template', () => {
    it('should render orders table correctly when orders has data', () => {
      component.orders = mockOrdersResponse;

      fixture.detectChanges();

      const table = fixture.debugElement.query(By.css('tbody tr'));
      expect(table).toBeTruthy();
    });

    it('should show "LIST IS EMPTY" message when orders is empty and isLoading is false', () => {
      component.isLoading = false;

      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.list-msg-container p'));
      expect(container).toBeTruthy();
    });

    it('should not show "LIST IS EMPTY" message while still loading', () => {
      component.isLoading = true;

      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.list-msg-container p'));
      expect(container).toBeNull();
    });

    it('should apply the bg-gray-800 class to even-indexed rows', () => {
      component.orders = mockOrdersResponse;

      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('tbody tr:nth-of-type(odd)'));
      rows.forEach(row => expect(row.nativeElement.classList.contains('bg-gray-800')).toBeTrue());
    });
  });

  describe('modal', () => {
    it('should make showOrderItems() set showModal = true and populates orderItems', () => {
      const orderItemDTO: OrderItemDTO[] = [{
        id: 1,
        name: 'Nike air',
        unitPrice: 200,
        quantity: 1,
        imageUrl: '/nike-image-url',
        productId: 3
      }]

      fixture.detectChanges();
      component.showOrderItems(orderItemDTO);

      expect(component.showModal).toBeTrue();
      expect(component.orderItems).toEqual(orderItemDTO);
    });

    it('should make closeModal() sets showModal = false', () => {
      component.showModal = true;

      fixture.detectChanges();
      component.closeModal();

      expect(component.showModal).toBeFalse();
    });

    it('should render modal when showModal is true', () => {
      component.showModal = true;

      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('.overlay + div'));
      expect(modal).toBeTruthy();
    });

    it('should not render modal when showModal is false', () => {
      component.showModal = false;

      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('.overlay + div'));
      expect(modal).toBeNull();
    });

    it('should call closeModal() when overlay is clicked', () => {
      component.showModal = true;
      spyOn(component, 'closeModal');

      fixture.detectChanges();

      const overlay = fixture.debugElement.query(By.css('.overlay'));
      overlay.triggerEventHandler('click', null);
      expect(component.closeModal).toHaveBeenCalled();
    });

    it('should call closeModal() when the X button is clicked', () => {
      component.showModal = true;
      spyOn(component, 'closeModal');

      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('.overlay + div button'));
      btn.triggerEventHandler('click', null);
      expect(component.closeModal).toHaveBeenCalled();
    });

    it('should call showOrderItems() with the correct order\'s items when a row is clicked', () => {
      component.orders = mockOrdersResponse;
      spyOn(component, 'showOrderItems');

      fixture.detectChanges();

      const items = fixture.debugElement.queryAll(By.css('tbody tr'));

      items.forEach((item, index) => {
        item.triggerEventHandler('click', null);
        expect(component.showOrderItems).toHaveBeenCalledWith(mockOrdersResponse[index].orderItems);
      });
    });
  });

});
