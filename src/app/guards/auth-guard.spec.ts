import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';

import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth/auth-service';


describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let mockAuthService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj(['isLoggedIn']);

    TestBed.configureTestingModule({
      providers: [
        {provide: AuthService, useValue: mockAuthService}
      ]
    });

    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should return true when the user is authenticated', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);

    const result = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    expect(result).toBeTrue();
  });

  it('should not trigger the navigation when user is authenticated', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);
    spyOn(router, 'navigate');

    executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should return false when the user is not authenticated', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);

    const result = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    expect(result).toBeFalse();
  });

  it('should call router.navigate with /login if not logged in', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);
    spyOn(router, 'navigate');

    executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

});
