import { TestBed } from '@angular/core/testing';
import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';

import { authInterceptor } from './auth-interceptor';
import { AuthService } from '../services/auth/auth-service';
import { environment } from '../../environments/environment.development';

describe('authInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) => 
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  const authUrl: string = environment.AUTH_URL;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj(['getToken']);

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    });
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should NOT add Authorization header for login request', () => {
    const req = new HttpRequest('POST', `${authUrl}/login`, null);

    const next: HttpHandlerFn = jasmine.createSpy().and.callFake((request) => {
      expect(request.headers.has('Authorization')).toBeFalse();
      return null;
    });

    interceptor(req, next);
  });

  it('should add Authorization header when token exists', () => {
    mockAuthService.getToken.and.returnValue('mock-token');
    const req = new HttpRequest('GET', `${authUrl}/products`);

    const next: HttpHandlerFn = jasmine.createSpy().and.callFake((request) => {
      expect(request.headers.get('Authorization')).toBe('Bearer mock-token');
      return null;
    });

    interceptor(req, next);
  });

  it('should NOT add Authorization header when token is null', () => {
    mockAuthService.getToken.and.returnValue(null);
    const req = new HttpRequest('GET', `${authUrl}/products`);

    const next: HttpHandlerFn = jasmine.createSpy().and.callFake((request) => {
      expect(request.headers.has('Authorization')).toBeFalse();
      return null;
    });

    interceptor(req, next);
  });
});
