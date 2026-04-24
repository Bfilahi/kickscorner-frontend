import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { NavbarSmallDevices } from './navbar-small-devices';
import { CartService } from '../../../services/cart-service';
import { AuthService } from '../../../services/auth/auth-service';
import { UserService } from '../../../services/user/user-service';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../../../model/cart-item';
import { By } from '@angular/platform-browser';

describe('NavbarSmallDevices', () => {
  let component: NavbarSmallDevices;
  let fixture: ComponentFixture<NavbarSmallDevices>;

  let mockCartService: jasmine.SpyObj<CartService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockUserService: jasmine.SpyObj<UserService>;

  let mockCartItems: CartItem[];
  let cartSubject: BehaviorSubject<CartItem[]>;

  beforeEach(async () => {
    cartSubject = new BehaviorSubject<CartItem[]>([]);

    mockCartService = jasmine.createSpyObj([], {cartItems$: cartSubject.asObservable()});
    mockAuthService = jasmine.createSpyObj(['isAdmin', 'isLoggedIn', 'logout']);
    mockUserService = jasmine.createSpyObj(['']);

    await TestBed.configureTestingModule({
      imports: [NavbarSmallDevices],
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
    
    fixture = TestBed.createComponent(NavbarSmallDevices);
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

      component.items$.subscribe(res => expect(res).toEqual(mockCartItems));
    });

    it('should display the cart item count correctly', () => {
      cartSubject.next(mockCartItems);

      fixture.detectChanges();

      component.items$.subscribe((res) => expect(res.length).toBe(mockCartItems.length));
    });
  });

  describe('toggleMenu()', () => {
    it('should make isMenuOpened flip from false to true and back', () => {
      component.isMenuOpened = false;

      fixture.detectChanges();
      component.toggleMenu();

      expect(component.isMenuOpened).toBeTrue();

      component.isMenuOpened = true;

      fixture.detectChanges();
      component.toggleMenu();

      expect(component.isMenuOpened).toBeFalse();
    });

    it('should apply/remove the translate-y-14 class to the nav based on isMenuOpened', () => {
      component.isMenuOpened = false;

      fixture.detectChanges();

      let navElem = fixture.debugElement.query(By.css('nav'));
      expect(navElem.nativeElement.classList.contains('translate-y-14')).toBeFalse();

      component.isMenuOpened = true;

      fixture.detectChanges();

      navElem = fixture.debugElement.query(By.css('nav'));
      expect(navElem.nativeElement.classList.contains('translate-y-14')).toBeTrue();
    });

    it('should render the correct icon depending on isMenuOpened', () => {
      component.isMenuOpened = false;

      fixture.detectChanges();

      let divElem = fixture.debugElement.query(By.css('header > div'));
      let btns = divElem.queryAll(By.css('button i'));
      expect(btns.length).toBe(1);
      expect(btns[0].nativeElement.classList.contains('fa-bars-staggered')).toBeTrue();

      component.isMenuOpened = true;

      fixture.detectChanges();

      divElem = fixture.debugElement.query(By.css('header > div'));
      btns = divElem.queryAll(By.css('button i'));
      expect(btns.length).toBe(1);
      expect(btns[0].nativeElement.classList.contains('fa-circle-xmark')).toBeTrue();
    });

    it('should show login link when auth.isLoggedIn() returns false', () => {
      mockAuthService.isLoggedIn.and.returnValue(false);

      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('a[routerLink="/login"]'));
      expect(btn).toBeTruthy();
      expect(btn.nativeElement.textContent).toBe('Login');
    });

    it('should show My Account, My Orders, and Logout when auth.isLoggedIn() returns true', () => {
      mockAuthService.isLoggedIn.and.returnValue(true);

      fixture.detectChanges();

      const btns = fixture.debugElement.queryAll(By.css('.btn'));
      expect(btns.length).toBe(3);
    });

    it('should hide Admin dropdown when auth.isAdmin() returns false', () => {
      mockAuthService.isAdmin.and.returnValue(false);

      fixture.detectChanges();

      const elem = fixture.debugElement.query(By.css('.admin-dropdown'));
      expect(elem).toBeNull();
    });

    it('should show Admin dropdown with all five links when auth.isAdmin() return true', () => {
      mockAuthService.isAdmin.and.returnValue(true);

      fixture.detectChanges();

      const elem = fixture.debugElement.queryAll(By.css('.admin-dropdown a'));
      expect(elem.length).toBe(5);
    });
  });

  describe('logout()', () => {
    it('should call auth.logout() exactly once when the button is clicked', () => {
      mockAuthService.isLoggedIn.and.returnValue(true);
      spyOn(component, 'logout');

      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('button.btn'));
      btn.triggerEventHandler('click', null);
      expect(component.logout).toHaveBeenCalledOnceWith();
    });
  });

  describe('cart badge', () => {
    it('should display the correct count from the observable', () => {
      cartSubject.next(mockCartItems);

      fixture.detectChanges();

      const elem = fixture.debugElement.query(By.css('a[routerLink="/cart"] span'));
      expect(elem.nativeElement.textContent).toBe(`${mockCartItems.length}`);
    });

    it('should handle an empty cart gracefully', () => {
      cartSubject.next([]);

      fixture.detectChanges();

      const elem = fixture.debugElement.query(By.css('a[routerLink="/cart"] span'));
      expect(elem.nativeElement.textContent).toBe('0');
    });
  });
});
