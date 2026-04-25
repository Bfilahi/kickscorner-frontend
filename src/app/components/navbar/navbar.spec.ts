import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { Navbar } from './navbar';
import { CartService } from '../../services/cart-service';
import { AuthService } from '../../services/auth/auth-service';
import { provideRouter } from '@angular/router';
import { UserService } from '../../services/user/user-service';
import { BehaviorSubject, of } from 'rxjs';
import { CartItem } from '../../model/cart-item';
import { By } from '@angular/platform-browser';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  let mockCartService: jasmine.SpyObj<CartService>;
  let mockAuthService: jasmine.SpyObj<AuthService>; 
  let mockUserService: jasmine.SpyObj<UserService>;

  let mockCartItems: CartItem[];
  let cartSubject: BehaviorSubject<CartItem[]>;

  beforeEach(async () => {
    cartSubject = new BehaviorSubject<CartItem[]>([]);

    mockCartService = jasmine.createSpyObj<CartService>(
      'CartService',
      [],
      { cartItems$: cartSubject.asObservable() }
    );
    mockAuthService = jasmine.createSpyObj(['isAdmin', 'isLoggedIn', 'logout']);
    mockUserService = jasmine.createSpyObj(['']);

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideRouter([]),
        {provide: CartService, useValue: mockCartService},
        {provide: AuthService, useValue: mockAuthService},
        {provide: UserService, useValue: mockUserService}
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

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should assign items$ from cartService.cartItems$ on ngOnInit', () => {
      cartSubject.next(mockCartItems);

      fixture.detectChanges();

      component.items$.subscribe(item => expect(item).toEqual(mockCartItems));
    });

    it('should render the cart count', () => {
      fixture.detectChanges();

      cartSubject.next(mockCartItems);
      fixture.detectChanges();

      const elem = fixture.debugElement.query(By.css('.fa-cart-shopping + span'));
      expect(elem.nativeElement.textContent.trim()).toBe(`${mockCartItems.length}`);
    });
  });

  describe('template', () => {
    it('should show Admin nav section when auth.isAdmin() returns true', () => {
      mockAuthService.isAdmin.and.returnValue(true);

      fixture.detectChanges();

      let adminList = fixture.debugElement.query(By.css('.admin'));
      expect(adminList).toBeTruthy();

      mockAuthService.isAdmin.and.returnValue(false);

      fixture.detectChanges();

      adminList = fixture.debugElement.query(By.css('.admin'));
      expect(adminList).toBeNull();
    });

    it('should show login link when unauthenticated', () => {
      mockAuthService.isLoggedIn.and.returnValue(false);

      fixture.detectChanges();

      let link = fixture.debugElement.query(By.css('a[routerLink="/login"]'));
      expect(link).toBeTruthy();

      mockAuthService.isLoggedIn.and.returnValue(true);

      fixture.detectChanges();

      link = fixture.debugElement.query(By.css('a[routerLink="/login"]'));
      expect(link).toBeNull();
    });

    it('should show My Account, My Orders, and Logout when authenticated', () => {
      mockAuthService.isLoggedIn.and.returnValue(true);
      
      fixture.detectChanges();

      let userMenu = fixture.debugElement.query(By.css('.user'));
      let btns = userMenu.queryAll(By.css('.btn'));
      expect(btns.length).toBe(3);

      mockAuthService.isLoggedIn.and.returnValue(false);

      fixture.detectChanges();

      userMenu = fixture.debugElement.query(By.css('.user'));
      btns = userMenu.queryAll(By.css('.btn'));
      expect(btns).toEqual([]);
    });

  });

  describe('logout', () => {
    it('should call auth.logout() exactly once when invoked', () => {
      mockAuthService.logout.and.returnValue(void 0);

      fixture.detectChanges();
      component.logout();

      expect(mockAuthService.logout).toHaveBeenCalledOnceWith();
    });

    it('should have the logout button in the template wired to (click)="logout()', () => {
      mockAuthService.isLoggedIn.and.returnValue(true);
      spyOn(component, 'logout');

      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('.btn-logout'));
      btn.triggerEventHandler('click', null);
      expect(component.logout).toHaveBeenCalledOnceWith();
    });
  });

  describe('cart badge', () => {
    it('should display the correct item count from items$', () => {
      const cartSubject = new BehaviorSubject<CartItem[]>([]);
      Object.defineProperty(mockCartService, 'cartItems$', {
        value: cartSubject.asObservable()
      });
      cartSubject.next(mockCartItems);

      fixture.detectChanges();

      component.items$.subscribe(res => expect(res.length).toBe(mockCartItems.length));
    });

    it('should render 0 when the cart is empty', () => {
      const cartSubject = new BehaviorSubject<CartItem[]>([]);
      Object.defineProperty(mockCartService, 'cartItems$', {
        value: cartSubject.asObservable()
      });
      cartSubject.next([]);

      fixture.detectChanges();

      component.items$.subscribe(res => expect(res.length).toBe(0));
    });
  });

});
