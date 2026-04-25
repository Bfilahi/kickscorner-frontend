import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { ProductDetail } from './product-detail';
import { ProductService } from '../../services/product-service';
import { CartService } from '../../services/cart-service';
import { AuthService } from '../../services/auth/auth-service';
import { Payment } from '../../services/payment';
import { AdminProductService } from '../../services/admin/admin-product-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, convertToParamMap, ParamMap, provideRouter, Router } from '@angular/router';
import { BehaviorSubject, NEVER, Observable, of, throwError } from 'rxjs';
import { CartItem } from '../../model/cart-item';
import { ProductResponse } from '../../model/response/product-response';
import { StripeResponse } from '../../model/response/stripe-response';
import { PaymentRequest } from '../../model/request/payment-request';
import { HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';

describe('ProductDetail', () => {
  let component: ProductDetail;
  let fixture: ComponentFixture<ProductDetail>;

  let router: Router;

  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockCartService: jasmine.SpyObj<CartService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockPaymentService: jasmine.SpyObj<Payment>;
  let mockAdminProductService: jasmine.SpyObj<AdminProductService>;
  let spinnerService: NgxSpinnerService;

  let cartSubject: BehaviorSubject<CartItem[]>;
  let routeStub: {paramMap: Observable<ParamMap>, snapshot: {paramMap: Observable<ParamMap>}}

  let mockCartItems: CartItem[];
  let mockProductResponse: ProductResponse;
  let stripeResponse: StripeResponse;
  let paymentRequest: PaymentRequest;

  beforeEach(async () => {
    cartSubject = new BehaviorSubject<CartItem[]>([]);

    mockProductService = jasmine.createSpyObj(['getProduct']);
    mockCartService = jasmine.createSpyObj(['addToCart'], { cartItems$: cartSubject.asObservable() });
    mockAuthService = jasmine.createSpyObj(['isLoggedIn']);
    mockPaymentService = jasmine.createSpyObj(['checkout']);
    mockAdminProductService = jasmine.createSpyObj(['getSizes']);

    mockAdminProductService.getSizes.and.returnValue(NEVER);
    mockProductService.getProduct.and.returnValue(of(mockProductResponse));

    routeStub = { 
      paramMap: of(convertToParamMap({ id: '1' })),
      snapshot: { paramMap: of(convertToParamMap({ id: '1' })) }
    };

    await TestBed.configureTestingModule({
      imports: [ProductDetail],
      providers: [
        provideRouter([]),
        NgxSpinnerService,
        {provide: ProductService, useValue: mockProductService},
        {provide: CartService, useValue: mockCartService},
        {provide: AuthService, useValue: mockAuthService},
        {provide: Payment, useValue: mockPaymentService},
        {provide: AdminProductService, useValue: mockAdminProductService},
        {provide: ActivatedRoute, useValue: routeStub}
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

    mockProductResponse = {
      id: 1,
      name: 'Nike air',
      description: 'mock description',
      price: 200,
      unitsInStock: 30,

      sizes: [
        { id: 1, name: 'XL' },
        { id: 2, name: 'L' },
      ],
      brand: { id: 1, name: 'Nike' },
      colors: [
        { id: 1, name: 'red' },
        { id: 2, name: 'blue' },
      ],
      images: [{ publicId: 'mock-pid1', imgUrl: '/mock_path_1' }],
    };

    stripeResponse = {
      status: 'ERROR',
      message: 'mock stripe message',
      sessionId: 'mock stripe session id',
      sessionUrl: '/mock-stripe-session-url',
    };

    paymentRequest = {
      currency: 'EUR',
      lineItems: [
        {
          name: mockProductResponse.name,
          description: mockProductResponse.description,
          amount: Math.round(mockProductResponse.price! * 100),
          quantity: 1,
          imgUrl: mockProductResponse.images[0].imgUrl
        }
      ]
    }

    router = TestBed.inject(Router);
    spinnerService = TestBed.inject(NgxSpinnerService);
    fixture = TestBed.createComponent(ProductDetail);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should fetch the product when a route id param is present', () => {
      spyOn<any>(component, 'getProduct');

      fixture.detectChanges();

      expect(component['getProduct']).toHaveBeenCalled();
    });

    it('should not fetch the product when no id param is present', () => {
      routeStub.paramMap = of(convertToParamMap({}));
      spyOn<any>(component, 'getProduct');

      fixture.detectChanges();

      expect(component['getProduct']).not.toHaveBeenCalled();
    });

    it('should always fetch sizes on init when id param is present', () => {
      spyOn<any>(component, 'listSizes');

      fixture.detectChanges();

      expect(component['listSizes']).toHaveBeenCalled();
    });

    it('should always fetch sizes on init when id param is absent', () => {
      routeStub.paramMap = of(convertToParamMap({}));
      spyOn<any>(component, 'listSizes');

      fixture.detectChanges();

      expect(component['listSizes']).toHaveBeenCalled();
    });

    it('should get cart items from cartService.cartItems$', () => {
      cartSubject.next(mockCartItems);

      fixture.detectChanges();

      expect(component.cartItems).toEqual(mockCartItems);
    });
  });

  describe('doesSizeExist', () => {
    it('should return true when the product has a size matching the given id', () => {
      component.product = mockProductResponse;

      fixture.detectChanges();
      const result = component.doesSizeExist(1);

      expect(result).toBeTrue();
    });

    it('should return false when no matching size exists', () => {
      routeStub.paramMap = of(convertToParamMap({id: '1'}));
      component.product = mockProductResponse;

      fixture.detectChanges();
      const result = component.doesSizeExist(4);

      expect(result).toBeFalse();
    });
  });

  describe('selectSize', () => {
    it('should set selectedSize to true', () => {
      fixture.detectChanges();
      component.selectSize();

      expect(component.selectedSize).toBeTrue();
    });
  });

  describe('addToCart', () => {
    it('should call cartService.addToCart with a CartItem built from the current product', () => {
      mockCartService.addToCart.and.returnValue(void 0);
      component.product = mockProductResponse;

      fixture.detectChanges();
      component.addToCart();

      expect(mockCartService.addToCart).toHaveBeenCalledWith(new CartItem(mockProductResponse));
    });
  });

  describe('checkout', () => {
    it('should redirect to /login if the user is not logged in and should not call the payment service', () => {
      mockAuthService.isLoggedIn.and.returnValue(false);
      mockPaymentService.checkout.and.returnValue(NEVER);
      spyOn(router, 'navigate');

      fixture.detectChanges();
      component.checkout();

      expect(router.navigate).toHaveBeenCalled();
      expect(mockPaymentService.checkout).not.toHaveBeenCalled();
    });

    it('should call paymentService.checkout with correctly shaped PaymentRequest', () => {
      mockAuthService.isLoggedIn.and.returnValue(true);
      mockPaymentService.checkout.and.returnValue(NEVER);
      component.product = mockProductResponse;

      fixture.detectChanges();
      component.checkout();

      expect(mockPaymentService.checkout).toHaveBeenCalledWith(paymentRequest);
    });

    it('should log an error and hide the spinner when the status is not SUCCESS', () => {
      mockProductService.getProduct.and.returnValue(of(mockProductResponse));
      mockPaymentService.checkout.and.returnValue(of(stripeResponse));
      mockAuthService.isLoggedIn.and.returnValue(true);
      component.product = mockProductResponse;
      spyOn(spinnerService, 'hide');
      spyOn(console, 'error');

      fixture.detectChanges();
      component.checkout();

      expect(console.error).toHaveBeenCalledWith('Payment initialization failed');
      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should hide the spinner and log an error on HTTP failure', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockProductService.getProduct.and.returnValue(of(mockProductResponse));
      mockPaymentService.checkout.and.returnValue(throwError(() => error));
      mockAuthService.isLoggedIn.and.returnValue(true);
      component.product = mockProductResponse;
      spyOn(spinnerService, 'hide');
      spyOn(console, 'error');

      fixture.detectChanges();
      component.checkout();

      expect(console.error).toHaveBeenCalledWith('Payment error', error);
      expect(spinnerService.hide).toHaveBeenCalled();
    });
  });

  describe('template', () => {
    it('should disable buy and cart buttons when no size is selected', () => {
      mockProductService.getProduct.and.returnValue(of(mockProductResponse));
      fixture.detectChanges();

      const btns = fixture.debugElement.queryAll(By.css('.buy-btn'));
      btns.forEach(btn => expect(btn.nativeElement.disabled).toBeTrue());
    });

    it('should enable buy and cart buttons when size is selected', () => {
      mockProductService.getProduct.and.returnValue(of(mockProductResponse));
      component.selectedSize = true;

      fixture.detectChanges();

      const btns = fixture.debugElement.queryAll(By.css('.buy-btn'));
      btns.forEach((btn) => expect(btn.nativeElement.disabled).toBeFalse());
    });

    it('should render showError paragraph only when showError is true', () => {
      mockProductService.getProduct.and.returnValue(of(mockProductResponse));
      component.showError = true;

      fixture.detectChanges();

      const paragraph = fixture.debugElement.query(By.css('.text-red-400'));
      expect(paragraph).toBeTruthy();
    });

    it('should add opacity-60 class to size label when size is not in product', () => {
      mockProductService.getProduct.and.returnValue(of(mockProductResponse));
      mockAdminProductService.getSizes.and.returnValue(of([
        { id: 1, name: 'XL' },
        { id: 99, name: 'XXL' }
      ]));

      fixture.detectChanges();

      const labels = fixture.nativeElement.querySelectorAll('label');
      const disabledLabel = Array.from(labels).find((label: any) => label.textContent.trim() === 'XXL') as HTMLElement;

      expect(disabledLabel.classList).toContain('opacity-60');
    });

    it('should update selectedImage when clicking thumbnail', () => {
      component.product = {
        ...mockProductResponse,
        images: [
          { publicId: 'mock-pid1', imgUrl: 'mock_img_url_1' },
          { publicId: 'mock-pid2', imgUrl: 'mock_img_url_2' },
        ],
      };

      fixture.detectChanges();

      const thumbnail = fixture.nativeElement.querySelectorAll('div.flex.items-center button')[1];
      thumbnail.click();
      fixture.detectChanges();

      expect(component.selectedImage).toBe('mock_img_url_2');
    });

    it('should format the price with EUR currency pipe', () => {
      component.product = mockProductResponse;

      fixture.detectChanges();

      const btn = fixture.debugElement.queryAll(By.css('.buy-btn'))[0];
      expect(btn.nativeElement.textContent).toBe('\u20AC200.00');
      console.log(btn.nativeElement.textContent);
    });
  });

});
