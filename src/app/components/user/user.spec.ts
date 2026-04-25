import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { User } from './user';
import { AuthService } from '../../services/auth/auth-service';
import { UserService } from '../../services/user/user-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NEVER, of, throwError } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { UserResponse } from '../../model/response/user-response';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';

describe('User', () => {
  let component: User;
  let fixture: ComponentFixture<User>;

  let mockAuthService: jasmine.SpyObj<AuthService>; 
  let mockUserService: jasmine.SpyObj<UserService>;
  let spinnerService: NgxSpinnerService;
  let router: Router;

  let mockUserResponse: UserResponse;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj(['logout']);
    mockUserService = jasmine.createSpyObj(['getUserInfo', 'deleteProfile']);

    mockUserService.getUserInfo.and.returnValue(NEVER);

    await TestBed.configureTestingModule({
      imports: [User],
      providers: [
        provideRouter([]),
        NgxSpinnerService,
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService }
      ]
    })
    .compileComponents();

    mockUserResponse = {
      id: 1,
      fullName: 'Mario rossi',
      email: 'mario.rossi@example.com',
      authorities: [{ authority: 'ROLE_USER' }],
    };

    spinnerService = TestBed.inject(NgxSpinnerService);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(User);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should assign the user$ observable on ngOnInit by calling userService.getUserInfo()', () => {
      mockUserService.getUserInfo.and.returnValue(of(mockUserResponse));

      fixture.detectChanges();

      component.user$.subscribe(res => expect(res).toEqual(mockUserResponse));
    });

    it('should render the user\'s fullName correctly in the template from the async pipe', () => {
      mockUserService.getUserInfo.and.returnValue(of(mockUserResponse));
      const capitalizedName = mockUserResponse.fullName.split(' ').map(name =>  name[0].toUpperCase() + name.substring(1));

      fixture.detectChanges();

      const paragraph = fixture.debugElement.query(By.css('p span'));
      expect(paragraph.nativeElement.textContent).toBe(`${capitalizedName[0]} ${capitalizedName[1]}`);
    });
  });

  describe('deleteAccount()', () => {
    it('should not do anything if the user cancels the confirm dialog', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      spyOn(spinnerService, 'show');

      component.deleteAccount();

      expect(spinnerService.show).not.toHaveBeenCalled();
    });

    it('should call spinnerService.show() before the delete request', () => {
      mockUserService.deleteProfile.and.returnValue(NEVER);
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(spinnerService, 'show');

      component.deleteAccount();

      expect(spinnerService.show).toHaveBeenCalled();
    });

    it('should hide the spinner and navigate to /home on success', () => {
      mockUserService.deleteProfile.and.returnValue(of({}));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(spinnerService, 'hide');
      spyOn(router, 'navigate');

      component.deleteAccount();

      expect(spinnerService.hide).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should hide the spinner and log the error on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockUserService.deleteProfile.and.returnValue(throwError(() => error));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(spinnerService, 'hide');
      spyOn(console, 'error');

      component.deleteAccount();

      expect(spinnerService.hide).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(error);
    });
  });

  describe('logout()', () => {
    it('should delegate to auth.logout()', () => {
      mockAuthService.logout.and.returnValue(void 0);

      component.logout();

      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

  describe('template', () => {
    it('should make the "My orders" link point to /orders', () => {
      fixture.detectChanges();

      const link = fixture.debugElement.query(By.css('a[routerLink="/orders"]'));
      expect(link.attributes['routerLink']).toBe('/orders');
    });

    it('should make the "Change password" link point to /password', () => {
      fixture.detectChanges();

      const link = fixture.debugElement.query(By.css('a[routerLink="/password"]'));
      expect(link.attributes['routerLink']).toBe('/password');
    });

    it('should make the delete button trigger deleteAccount()', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(component, 'deleteAccount');

      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('.delete-btn'));
      btn.triggerEventHandler('click', null);
      expect(component.deleteAccount).toHaveBeenCalled();
    });

    it('should make the logout button trigger logout()', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(component, 'logout');

      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('.logout-btn'));
      btn.triggerEventHandler('click', null);
      expect(component.logout).toHaveBeenCalled();
    });

    it('should display the username with titlecase applied', () => {
      mockUserService.getUserInfo.and.returnValue(of(mockUserResponse));
      const capitalizedName = mockUserResponse.fullName.split(' ').map((name) => name[0].toUpperCase() + name.substring(1));

      fixture.detectChanges();

      const paragraph = fixture.debugElement.query(By.css('p span'));
      expect(paragraph.nativeElement.textContent).toBe(`${capitalizedName[0]} ${capitalizedName[1]}`);
    });
  });
});
