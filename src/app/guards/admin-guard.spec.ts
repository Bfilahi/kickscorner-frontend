import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';

import { adminGuard } from './admin-guard';
import { AuthService } from '../services/auth/auth-service';

describe('adminGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => adminGuard(...guardParameters));

  let mockAuthService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj(['isLoggedIn', 'isAdmin']);

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

  it('should return true when the user is authenticated and admin', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);
    mockAuthService.isAdmin.and.returnValue(true);

    const result = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    expect(result).toBeTrue();
  });

  it('should not trigger the navigation when user is authenticated and admin', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);
    mockAuthService.isAdmin.and.returnValue(true);
    spyOn(router, 'navigate');

    executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should return false when the user is not authenticated or is not admin', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);
    mockAuthService.isAdmin.and.returnValue(true);

    const result = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    expect(result).toBeFalse();
  });

  it('should call router.navigate with /home if not logged in or not admin', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);
    mockAuthService.isAdmin.and.returnValue(true);
    spyOn(router, 'navigate');

    executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });
});
