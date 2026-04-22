import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { Login } from './login';
import { AuthService } from '../../../services/auth/auth-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { NEVER, of, throwError } from 'rxjs';
import { AuthResponse } from '../../../model/response/auth-response';
import { AuthRequest } from '../../../model/request/auth-request';
import { HttpErrorResponse } from '@angular/common/http';


describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  let mockAuthService: jasmine.SpyObj<AuthService>;
  let spinnerService: NgxSpinnerService;
  let router: Router;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj([
      'isLoggedIn',
      'login',
      'saveToken',
    ]);

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        {provide: AuthService, useValue: mockAuthService},
        NgxSpinnerService,
        provideRouter([])
      ]
    })
    .compileComponents();

    router = TestBed.inject(Router);
    spinnerService = TestBed.inject(NgxSpinnerService);
    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('form validation', () => {
    it('should show "Field is required" error when email field is touched/dirty and empty', () => {
      const emailControl = component.loginForm.get('email');

      emailControl?.patchValue('');
      emailControl?.markAsTouched();
      emailControl?.markAsDirty();

      fixture.detectChanges();

      expect(emailControl?.valid).toBeFalse();
      const emailParentElem = fixture.debugElement.query(By.css('[formControlName="email"]')).parent;
      const textError = emailParentElem?.query(By.css('p.text-red-400'));
      expect(textError).toBeTruthy();
      expect(textError?.nativeElement.textContent).toBe('Field is required');
    });

    it('shoud show "invalid email" error when email field pattern doesn\'n match', () => {
      const emailControl = component.loginForm.get('email');

      emailControl?.patchValue('mario.rossi');
      emailControl?.markAsTouched();
      emailControl?.markAsDirty();

      fixture.detectChanges();

      expect(emailControl?.valid).toBeFalse();
      const emailParentElem = fixture.debugElement.query(By.css('[formControlName="email"]')).parent;
      const textError = emailParentElem?.query(By.css('p.text-red-400'));
      expect(textError).toBeTruthy();
      expect(textError?.nativeElement.textContent).toBe('Invalid email');
    });

    it('should show "Field is required" error when password field is touched/dirty and empty', () => {
      const passwordControl = component.loginForm.get('password');

      passwordControl?.patchValue('');
      passwordControl?.markAsTouched();
      passwordControl?.markAsDirty();

      fixture.detectChanges();

      expect(passwordControl?.valid).toBeFalse();
      const passwordParentElem = fixture.debugElement.query(By.css('[formControlName="password"]')).parent;
      const textError = passwordParentElem?.query(By.css('p.text-red-400'));
      expect(textError).toBeTruthy();
      expect(textError?.nativeElement.textContent).toBe('Field is required');
    });

    it('should show pattern error when password field is invalid', () => {
      const passwordControl = component.loginForm.get('password');

      passwordControl?.patchValue('password');
      passwordControl?.markAsTouched();
      passwordControl?.markAsDirty();

      fixture.detectChanges();

      expect(passwordControl?.valid).toBeFalse();
      const passwordParentElem = fixture.debugElement.query(By.css('[formControlName="password"]')).parent;
      const textError = passwordParentElem?.query(By.css('p.text-red-400'));
      expect(textError).toBeTruthy();
      expect(passwordControl?.hasError('pattern')).toBeTrue();
    });

    it('should disable login button when form is invalid', () => {
      fixture.detectChanges();

      expect(component.loginForm.invalid).toBeTrue();
      const loginBtn = fixture.debugElement.query(By.css('button'));
      expect(loginBtn.nativeElement.disabled).toBeTrue();
    });

    it('should reduce the opacity for login button when form is invalid', () => {
      fixture.detectChanges();

      expect(component.loginForm.invalid).toBeTrue();
      const loginBtn = fixture.debugElement.query(By.css('button'));
      expect(loginBtn.nativeElement.classList.contains('opacity-30')).toBeTrue();
    });

    it('should enable login button when both fields are valid', () => {
      component.loginForm.get('email')?.patchValue('mario.rossi@example.com');
      component.loginForm.get('password')?.patchValue('Password123!');

      fixture.detectChanges();

      expect(component.loginForm.valid).toBeTrue();
      const loginBtn = fixture.debugElement.query(By.css('button'));
      expect(loginBtn.nativeElement.disabled).toBeFalse();
    });
  });

  describe('ngOnInit', () => {
    it('should redirect to /home if the user is already logged in', () => {
      mockAuthService.isLoggedIn.and.returnValue(true);
      spyOn(router, 'navigate');

      fixture.detectChanges();
      
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should not redirect to /home if the user is not logged in', () => {
      mockAuthService.isLoggedIn.and.returnValue(false);
      spyOn(router, 'navigate');

      fixture.detectChanges();

      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('onLogin()', () => {
    it('should do nothing if the form is invalid', () => {
      spyOn(spinnerService, 'show');

      fixture.detectChanges();
      component.onLogin(component.loginForm);

      expect(spinnerService.show).not.toHaveBeenCalled();
    });

    it('should clear any existing errorMsg before submitting', () => {
      mockAuthService.login.and.returnValue(NEVER);

      fixture.detectChanges();
      component.onLogin(component.loginForm);

      expect(component.errorMsg()).toEqual('');
    });

    it('should call spinnerService.show() on submission', () => {
      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'Password1'
      });
      mockAuthService.login.and.returnValue(NEVER);
      spyOn(spinnerService, 'show');

      fixture.detectChanges();
      component.onLogin(component.loginForm);

      expect(spinnerService.show).toHaveBeenCalled();
    });

    it('should call auth.login() with the correct AuthRequest payload', () => {
      const authResponse: AuthResponse = {token: 'mock-token'};
      const authRequest: AuthRequest = {
        email: 'mario.rossi@example.com',
        password: 'Password123!'
      };
      component.loginForm.get('email')?.patchValue('mario.rossi@example.com');
      component.loginForm.get('password')?.patchValue('Password123!');
      mockAuthService.login.and.returnValue(of(authResponse));

      fixture.detectChanges();
      component.onLogin(component.loginForm);

      expect(mockAuthService.login).toHaveBeenCalledWith(authRequest);
    });

    it('should save the token via auth.saveToken(), navigate to /home, and hide the spinner on success', () => {
      const authResponse: AuthResponse = {token: 'mock-token'};
      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'Password1',
      });
      mockAuthService.login.and.returnValue(of(authResponse));
      mockAuthService.saveToken.and.returnValue(void 0);
      spyOn(spinnerService, 'hide');
      spyOn(router, 'navigate');

      fixture.detectChanges();
      component.onLogin(component.loginForm);

      expect(mockAuthService.saveToken).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should not call saveToken or navigate on success with no taken', () => {
      const authResponse: AuthResponse = {token: ''};
      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'Password1',
      });
      mockAuthService.login.and.returnValue(of(authResponse));
      spyOn(router, 'navigate');

      fixture.detectChanges();
      component.onLogin(component.loginForm);

      expect(mockAuthService.saveToken).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should set errorMsg with the server\'s message, hide the spinner, and not navigate on error', () => {
      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'Password1',
      });
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockAuthService.login.and.returnValue(throwError(() => error));
      spyOn(spinnerService, 'hide');
      spyOn(router, 'navigate');

      fixture.detectChanges();
      component.onLogin(component.loginForm);

      expect(component.errorMsg()).toBe(error.error.message);
      expect(spinnerService.hide).toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should fall back to "Invalid email or password" on error with no err.error.message', () => {
      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'Password1',
      });
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: null}
      });
      mockAuthService.login.and.returnValue(throwError(() => error));

      fixture.detectChanges();
      component.onLogin(component.loginForm);

      expect(component.errorMsg()).toBe('Invalid email or password');
    });
  });

  describe('template', () => {
    it('should render error message paragraph when errorMsg is non-empty', () => {
      component.errorMsg.set('some error');

      fixture.detectChanges();

      const errorParagraph = fixture.debugElement.query(By.css('button + p'));
      expect(errorParagraph).toBeTruthy();
    });

    it('should not render error message paragraph when errorMsg is empty', () => {
      component.errorMsg.set('');

      fixture.detectChanges();

      const errorParagraph = fixture.debugElement.query(By.css('button + p'));
      expect(errorParagraph).toBeNull();
    });

    it('should make "sign up" link point to /register', () => {
      fixture.detectChanges();

      const link = fixture.debugElement.query(By.css('a.text-yellow-400'));
      expect(link.attributes['routerLink']).toBe('/register');
    });
  });

});
