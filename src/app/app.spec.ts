import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter } from '@angular/router';
import { CartService } from './services/cart-service';
import { AuthService } from './services/auth/auth-service';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from './model/cart-item';
import { UserService } from './services/user/user-service';

describe('App', () => {
  let app: App;
  let fixture: ComponentFixture<App>;

  let mockCartService: jasmine.SpyObj<CartService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockUserService: jasmine.SpyObj<UserService>;

  let cartSubject: BehaviorSubject<CartItem[]>;

  beforeEach(async () => {
    cartSubject = new BehaviorSubject<CartItem[]>([]);

    mockCartService = jasmine.createSpyObj([''], { cartItems$: cartSubject.asObservable() });
    mockAuthService = jasmine.createSpyObj(['isAdmin', 'isLoggedIn', 'logout']);
    mockUserService = jasmine.createSpyObj(['']);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: CartService, useValue: mockCartService }, 
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    app = fixture.componentInstance;
  });

  it('should create the app', () => {
    fixture.detectChanges();
    expect(app).toBeTruthy();
  });
});
