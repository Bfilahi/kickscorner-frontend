import { TestBed } from '@angular/core/testing';
import 'zone.js';

import { AuthService } from './auth-service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment.development';
import { RegisterRequest } from '../../model/request/register-request';
import { AuthRequest } from '../../model/request/auth-request';
import { AuthResponse } from '../../model/response/auth-response';
import { of } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { UserService } from '../user/user-service';
import { provideRouter, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

describe('AuthService', () => {
  let service: AuthService;
  let mockJwtHelperService: jasmine.SpyObj<JwtHelperService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let httpTestingController: HttpTestingController;
  let mockRouter: Router;

  const url: string = environment.AUTH_URL;
  let registerRequest: RegisterRequest;
  let authRequest: AuthRequest;
  let authResponse: AuthResponse;
  

  beforeEach(() => {
    mockJwtHelperService = jasmine.createSpyObj([
      'isTokenExpired',
      'decodeToken',
    ]);
    mockUserService = jasmine.createSpyObj(['getUserInfo']);
    mockUserService.getUserInfo.and.returnValue(of());

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {provide: PLATFORM_ID, useValue: 'browser'},
        {provide: JwtHelperService, useValue: mockJwtHelperService},
        {provide: UserService, useValue: mockUserService},
      ]
    });

    registerRequest = {
      firstName: 'Mario',
      lastName: 'Rossi',
      email: 'mario.rossi@example.com',
      password: 'password123'
    }

    authRequest = {
      email: 'mario.rossi@example.com',
      password: 'password123'
    }

    authResponse = {
      token: 'mock-token'
    }
    mockRouter = TestBed.inject(Router);
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register()', () => {
    it('should call the method with the correct URL', () => {
      service.register(registerRequest).subscribe(void 0);

      const req = httpTestingController.expectOne(`${url}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerRequest);
      req.flush(null);
    });

    it('should propagate errors', () => {
      service.register(registerRequest).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500)
      });

      httpTestingController.expectOne(`${url}/register`)
      .flush('Server error', {status: 500, statusText: 'Internal Server Error'});
    });
  });

  describe('login()', () => {
    it('should call the method with the correct URL', () => {
      service.login(authRequest).subscribe(res => expect(res).toEqual(authResponse));

      const req = httpTestingController.expectOne(`${url}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(authRequest);
      req.flush(authResponse);
    });

    it('should propagate errors', () => {
      service.login(authRequest).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500)
      });

      httpTestingController.expectOne(`${url}/login`)
      .flush('Server error', {status: 500, statusText: 'Internal Server Error'});
    });

    it('should save the token on a successful response', () => {
      spyOn(service, 'saveToken');
      service.login(authRequest).subscribe();

      const req = httpTestingController.expectOne(`${url}/login`);
      req.flush(authResponse);
      expect(service.saveToken).toHaveBeenCalledWith(authResponse.token);
    });

    it('should emit true on authState$ after login', () => {
      let emittedValue: boolean | undefined;
      spyOn(service, 'saveToken');
      service.authState$.subscribe(res => emittedValue = res);

      service.login(authRequest).subscribe();

      const req = httpTestingController.expectOne(`${url}/login`);
      req.flush(authResponse);
      expect(emittedValue).toBeTrue();
    });

    it('should trigger userService.getUserInfo after login', () => {
      mockUserService.getUserInfo.and.returnValue(of());
      service.login(authRequest).subscribe();

      const req = httpTestingController.expectOne(`${url}/login`);
      req.flush(authResponse);
      expect(mockUserService.getUserInfo).toHaveBeenCalled();
    });
  });

  describe('logout()', () => {
    it('should remove the token from localStoreage', () => {
      spyOn(localStorage, 'removeItem');

      service.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('jwt');
    });

    it('should navigate to /home when in a browser environment', () => {
      spyOn(mockRouter, 'navigate');
    
      service.logout();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should emit false on authState$', () => {
      let emittedValue: boolean | undefined;

      service.authState$.subscribe(res => emittedValue = res);
      service.logout();

      expect(emittedValue).toBeFalse();
    });
  });

  describe('isLoggedIn()', () => {
    it('should return false when no token is present', () => {
      spyOn(service, 'getToken').and.returnValue(null);
      let isLoggedIn = service.isLoggedIn();

      expect(isLoggedIn).toBeFalse();
    });

    it('should return false when the token is expired and should call logout()', () => {
      spyOn(service, 'getToken').and.returnValue('mock-token');
      mockJwtHelperService.isTokenExpired.and.returnValue(true as any);
      spyOn(service, 'logout');

      const result = service.isLoggedIn();

      expect(result).toBeFalse();
      expect(service.logout).toHaveBeenCalled();
    });

    it('should return true when a valid and non-expired token exists', () => {
      spyOn(service, 'getToken').and.returnValue(authResponse.token);
      mockJwtHelperService.isTokenExpired.and.returnValue(false as any);
      spyOn(service, 'logout');

      const result = service.isLoggedIn();

      expect(result).toBeTrue();
      expect(service.logout).not.toHaveBeenCalled();
    });
  });

  describe('saveToken()', () => {
    it('should write to localStorage only in a browser environment', () => {
      spyOn(localStorage, 'setItem');

      service.saveToken(authResponse.token);

      expect(localStorage.setItem).toHaveBeenCalledWith('jwt', authResponse.token);
    });
  });

  describe('getToken()', () => {
    it('should read from localStorage in a browser', () => {
      spyOn(localStorage, 'getItem');

      service.getToken();

      expect(localStorage.getItem).toHaveBeenCalledWith('jwt');
    });
  });

  describe('isAdmin()', () => {
    it('should return true when user has ROLE_ADMIN', () => {
      spyOn(service, 'getToken').and.returnValue(authResponse.token);
      mockJwtHelperService.decodeToken.and.returnValue({authorities: 'ROLE_ADMIN'});

      const result = service.isAdmin();
      expect(result).toBeTrue();
    });

    it('should return false when user does not have ROLE_ADMIN', () => {
      spyOn(service, 'getToken').and.returnValue(authResponse.token);
      mockJwtHelperService.decodeToken.and.returnValue({authorities: 'ROLE_USER'});

      const result = service.isAdmin();
      expect(result).toBeFalse();
    });
  });

  describe('isSuperAdmin()', () => {
    it('should return true when user has ROLE_ADMIN', () => {
      spyOn(service, 'getToken').and.returnValue(authResponse.token);
      mockJwtHelperService.decodeToken.and.returnValue({authorities: 'ROLE_SUPER_ADMIN'});

      const result = service.isSuperAdmin();
      expect(result).toBeTrue();
    });

    it('should return false when user does not have ROLE_ADMIN', () => {
      spyOn(service, 'getToken').and.returnValue(authResponse.token);
      mockJwtHelperService.decodeToken.and.returnValue({authorities: 'ROLE_ADMIN'});

      const result = service.isSuperAdmin();
      expect(result).toBeFalse();
    });
  });

  describe('getDecodedToken()', () => {
    it('should return null when no token exists', () => {
      spyOn(service, 'getToken').and.returnValue(null);

      expect(service['getDecodedToken']()).toBeNull();
    });

    it('should return null and log an error when the token is malformed', () => {
      const invalidToken: string = 'Invalid token';
      spyOn(service, 'getToken').and.returnValue(authResponse.token);
      spyOn(console, 'error');
      mockJwtHelperService.decodeToken.and.throwError(invalidToken);

      expect(service['getDecodedToken']()).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  
});








describe('non-browser environment', () => {
    let service: AuthService;
    let mockJwtHelperService: jasmine.SpyObj<JwtHelperService>;
    let mockRouter: Router;

  beforeEach(() => {
    mockJwtHelperService = jasmine.createSpyObj([
      'isTokenExpired',
      'decodeToken',
    ]);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: JwtHelperService, useValue: mockJwtHelperService },
      ],
    });
    mockRouter = TestBed.inject(Router);
    service = TestBed.inject(AuthService);
  });

  describe('logout()', () => {
    it('should not navigate to /home when not in a browser environment', () => {
      spyOn(mockRouter, 'navigate');
  
      service.logout();
  
      expect(mockRouter.navigate).not.toHaveBeenCalledWith(['/home']);
    });
  });

  describe('getToken()', () => {
    it('should read from localStorage in a browser', () => {
      spyOn(localStorage, 'getItem');

      const result = service.getToken();

      expect(result).toBeNull();
      expect(localStorage.getItem).not.toHaveBeenCalled();
    });
  });
});











// Cross-cutting

// All localStorage interactions are skipped (no errors thrown) when PLATFORM_ID is not browser
// isLoggedIn() side-effect: expired token triggers logout(), which clears storage and updates authState$