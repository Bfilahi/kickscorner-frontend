import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { Cart } from './cart';
import { CartService } from '../../../services/cart-service';
import { AuthService } from '../../../services/auth/auth-service';
import { Payment } from '../../../services/payment';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, NEVER, of, throwError } from 'rxjs';
import { CartItem } from '../../../model/cart-item';
import { provideRouter, Router } from '@angular/router';
import { PaymentRequest } from '../../../model/request/payment-request';
import { StripeResponse } from '../../../model/response/stripe-response';
import { HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';

describe('Cart', () => {
  let component: Cart;
  let fixture: ComponentFixture<Cart>;

  let mockCartService: jasmine.SpyObj<CartService>;
  let mockAuthService: jasmine.SpyObj<AuthService>
  let mockPaymentService: jasmine.SpyObj<Payment>;
  let spinnerService: NgxSpinnerService
  let router: Router;

  let mockCartItems: CartItem[];
  let stripeResponse: StripeResponse;

  let cartSubject: BehaviorSubject<CartItem[]>;

  beforeEach(async () => {
    cartSubject = new BehaviorSubject<CartItem[]>([]);

    mockCartService = jasmine.createSpyObj(
      'CartService',
      ['clearCart', 'decrementQuantity', 'incrementQuantity', 'removeFromCart', 'getTotal'],
      { cartItems$: cartSubject.asObservable() },
    );
    mockAuthService = jasmine.createSpyObj(['isLoggedIn']);
    mockPaymentService = jasmine.createSpyObj(['checkout']);

    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [
        provideRouter([]),
        NgxSpinnerService,
        { provide: CartService, useValue: mockCartService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Payment, useValue: mockPaymentService }
      ]
    })
    .compileComponents();

    mockCartItems = [
      {
        id: 1,
        name: 'Classic White T-Shirt',
        description: 'Comfortable cotton t-shirt for everyday wear',
        brand: {
          id: 101,
          name: 'Nike',
        },
        selectedSize: 'M',
        price: 19.99,
        quantity: 2,
        images: [
          {
            publicId: 'tshirt_white_1',
            imgUrl: 'https://example.com/images/tshirt-white-1.jpg',
          },
          {
            publicId: 'tshirt_white_2',
            imgUrl: 'https://example.com/images/tshirt-white-2.jpg',
          },
        ],
      },
      {
        id: 2,
        name: 'Running Sneakers',
        description: 'Lightweight running shoes with great cushioning',
        brand: {
          id: 102,
          name: 'Adidas',
        },
        selectedSize: '42',
        price: 89.99,
        quantity: 1,
        images: [
          {
            publicId: 'sneakers_1',
            imgUrl: 'https://example.com/images/sneakers-1.jpg',
          },
        ],
      },
    ];

    stripeResponse = {
      status: 'ERROR',
      message: 'mock stripe message',
      sessionId: 'mock stripe session id',
      sessionUrl: '/mock-stripe-session-url',
    };

    spinnerService = TestBed.inject(NgxSpinnerService);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Cart);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should call listCartItems on init', () => {
      spyOn(component, 'listCartItems');
      fixture.detectChanges();
      expect(component.listCartItems).toHaveBeenCalled();
    });

    it('should populate cartItems from cartItems$ observable', () => {
      cartSubject.next(mockCartItems);
      fixture.detectChanges();
      expect(component.cartItems).toEqual(mockCartItems);
    });
  });

  describe('clearCart', () => {
    it('should delegate to cartService.clearCart()', () => {
      mockCartService.clearCart.and.returnValue(void 0);

      component.clearCart();

      expect(mockCartService.clearCart).toHaveBeenCalled();
    });
  });

  describe('checkout', () => {
    it('should redirect to /login if the user is not logged in', () => {
      mockAuthService.isLoggedIn.and.returnValue(false);
      spyOn(router, 'navigate');

      component.checkout();

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should return early if the cart is empty', () => {
      mockAuthService.isLoggedIn.and.returnValue(true);
      cartSubject.next([]);
      spyOn(spinnerService, 'show');

      fixture.detectChanges();
      component.checkout();

      expect(spinnerService.show).not.toHaveBeenCalled();
    });

    it('should call spinnerService.show() before the payment request', () => {
      mockAuthService.isLoggedIn.and.returnValue(true);
      mockPaymentService.checkout.and.returnValue(NEVER);
      cartSubject.next(mockCartItems);
      spyOn(spinnerService, 'show');

      fixture.detectChanges();
      component.checkout();

      expect(spinnerService.show).toHaveBeenCalled();
    });

    it('should build PaymentRequest payload correctly', () => {
      mockAuthService.isLoggedIn.and.returnValue(true);
      mockPaymentService.checkout.and.returnValue(NEVER);
      cartSubject.next(mockCartItems);
      const cart: PaymentRequest = {
        currency: 'EUR',
        lineItems: [],
      };
      mockCartItems.forEach(item => cart.lineItems.push({
        name: item.name,
        description: item.description,
        amount: Math.round(item.price! * 100),
        quantity: item.quantity,
        imgUrl: item.images[0].imgUrl
      }));

      fixture.detectChanges();
      component.checkout();

      expect(mockPaymentService.checkout).toHaveBeenCalledWith(cart);
    });

    it('should log an error and should not redirect when status is not "SUCCESS"', () => {
      mockAuthService.isLoggedIn.and.returnValue(true);
      mockPaymentService.checkout.and.returnValue(of(stripeResponse));
      cartSubject.next(mockCartItems);
      spyOn(console, 'error');

      fixture.detectChanges();
      component.checkout();

      expect(console.error).toHaveBeenCalledWith('Payment initialization failed');
    });

    it('should call spinnerService.hide() on success', () => {
      mockAuthService.isLoggedIn.and.returnValue(true);
      mockPaymentService.checkout.and.returnValue(of(stripeResponse));
      cartSubject.next(mockCartItems);
      spyOn(spinnerService, 'hide');

      fixture.detectChanges();
      component.checkout();

      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should call spinnerService.hide() on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockAuthService.isLoggedIn.and.returnValue(true);
      mockPaymentService.checkout.and.returnValue(throwError(() => error));
      cartSubject.next(mockCartItems);
      spyOn(spinnerService, 'hide');

      fixture.detectChanges();
      component.checkout();

      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should log the error on HTTP failure', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockAuthService.isLoggedIn.and.returnValue(true);
      mockPaymentService.checkout.and.returnValue(throwError(() => error));
      cartSubject.next(mockCartItems);
      spyOn(console, 'error');

      fixture.detectChanges();
      component.checkout();

      expect(console.error).toHaveBeenCalledWith('Payment error', error);
    });
  });

  describe('template', () => {
    it('should show cart items when cartItems.length > 0', () => {
      cartSubject.next(mockCartItems);

      fixture.detectChanges();

      const itemsContainer = fixture.debugElement.query(By.css('.container'));
      expect(itemsContainer).toBeTruthy();
    });

    it('should show the empty state when cartItems.length < 0', () => {
      cartSubject.next([]);

      fixture.detectChanges();

      const itemsContainer = fixture.debugElement.query(By.css('.container'));
      expect(itemsContainer).toBeNull();
    });

    it('should show the "Login to checkout" link when not logged in', () => {
      mockAuthService.isLoggedIn.and.returnValue(false);

      fixture.detectChanges();

      const loginBtn = fixture.debugElement.query(By.css('a[routerLink="/login"]'));
      const checkoutBtn = fixture.debugElement.query(By.css('.checkout-btn'));
      expect(loginBtn).toBeTruthy();
      expect(checkoutBtn).toBeNull();
    });

    it('should show the "Checkout" link when logged in', () => {
      mockAuthService.isLoggedIn.and.returnValue(true);

      fixture.detectChanges();

      const loginBtn = fixture.debugElement.query(By.css('a[routerLink="/login"]'));
      const checkoutBtn = fixture.debugElement.query(By.css('.checkout-btn'));
      expect(loginBtn).toBeNull();
      expect(checkoutBtn).toBeTruthy();
    });

    it('should make increment, decrement, and remove buttons call the correct cartService methods', () => {
      cartSubject.next(mockCartItems);

      fixture.detectChanges();

      const decBtn = fixture.debugElement.query(By.css('.dec-btn'));
      const incBtn = fixture.debugElement.query(By.css('.inc-btn'));
      const removeBtn = fixture.debugElement.query(By.css('.remove-btn'));

      decBtn.triggerEventHandler('click', null);
      incBtn.triggerEventHandler('click', null);
      removeBtn.triggerEventHandler('click', null);

      expect(mockCartService.incrementQuantity).toHaveBeenCalled();
      expect(mockCartService.decrementQuantity).toHaveBeenCalled();
      expect(mockCartService.removeFromCart).toHaveBeenCalled();
    });

    it('should make "Clear cart" button call clearCart', () => {
      cartSubject.next(mockCartItems);
      spyOn(component, 'clearCart');

      fixture.detectChanges();

      const decBtn = fixture.debugElement.query(By.css('.clear-btn'));
      decBtn.triggerEventHandler('click', null);

      expect(component.clearCart).toHaveBeenCalled();
    });

    it('should render total using cartService.getTotal()', () => {
      mockCartService.getTotal.and.returnValue(129.97);

      fixture.detectChanges();

      const totalItem = fixture.debugElement.query(By.css('h4 + small'));
      expect(totalItem.nativeElement.textContent.trim()).toBe('\u20AC129.97')
    });
  });

});
