import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { Register } from './register';
import { AuthService } from '../../../services/auth/auth-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { NEVER, of, throwError } from 'rxjs';
import { RegisterRequest } from '../../../model/request/register-request';
import { HttpErrorResponse } from '@angular/common/http';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;

  let mockAuthService: jasmine.SpyObj<AuthService>;
  let spinnerService: NgxSpinnerService;
  let router: Router;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj(['isLoggedIn', 'register']);

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        NgxSpinnerService,
        provideRouter([]),
        {provide: AuthService, useValue: mockAuthService}
      ]
    })
    .compileComponents();

    spinnerService = TestBed.inject(NgxSpinnerService);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('form validation', () => {
    it('should show "Field is required" error when firstName field is touched/dirty and empty', () => {
      const firstNameControl = component.registerForm.get('firstName');

      firstNameControl?.patchValue('');
      firstNameControl?.markAsTouched();
      firstNameControl?.markAsDirty();

      fixture.detectChanges();

      expect(firstNameControl?.valid).toBeFalse();
      const firstNameParentElem = fixture.debugElement.query(
        By.css('[formControlName="firstName"]'),
      ).parent;
      const textError = firstNameParentElem?.query(By.css('p.text-red-400'));
      expect(textError).toBeTruthy();
      expect(textError?.nativeElement.textContent).toBe('Field is required');
    });

    it('shoud show "First Name should be at least 3 characters long" error when firstName field pattern doesn\'n match', () => {
      const firstNameControl = component.registerForm.get('firstName');

      firstNameControl?.patchValue('aa');
      firstNameControl?.markAsTouched();
      firstNameControl?.markAsDirty();

      fixture.detectChanges();

      expect(firstNameControl?.valid).toBeFalse();
      const firstNameParentElem = fixture.debugElement.query(By.css('[formControlName="firstName"]')).parent;
      const textError = firstNameParentElem?.query(By.css('p.text-red-400'));
      expect(textError).toBeTruthy();
      expect(textError?.nativeElement.textContent).toBe('First Name should be at least 3 characters long');
    });

    it('should show "Field is required" error when lastName field is touched/dirty and empty', () => {
      const lastNameControl = component.registerForm.get('lastName');

      lastNameControl?.patchValue('');
      lastNameControl?.markAsTouched();
      lastNameControl?.markAsDirty();

      fixture.detectChanges();

      expect(lastNameControl?.valid).toBeFalse();
      const lastNameParentElem = fixture.debugElement.query(
        By.css('[formControlName="lastName"]'),
      ).parent;
      const textError = lastNameParentElem?.query(By.css('p.text-red-400'));
      expect(textError).toBeTruthy();
      expect(textError?.nativeElement.textContent).toBe('Field is required');
    });

    it('shoud show "First Name should be at least 3 characters long" error when lastName field pattern doesn\'n match', () => {
      const lastNameControl = component.registerForm.get('lastName');

      lastNameControl?.patchValue('aa');
      lastNameControl?.markAsTouched();
      lastNameControl?.markAsDirty();

      fixture.detectChanges();

      expect(lastNameControl?.valid).toBeFalse();
      const lastNameParentElem = fixture.debugElement.query(By.css('[formControlName="lastName"]')).parent;
      const textError = lastNameParentElem?.query(By.css('p.text-red-400'));
      expect(textError).toBeTruthy();
      expect(textError?.nativeElement.textContent).toBe('Last Name should be at least 3 characters long');
    });

    it('should show "Field is required" error when email field is touched/dirty and empty', () => {
      const emailControl = component.registerForm.get('email');

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
      const emailControl = component.registerForm.get('email');

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
      const passwordControl = component.registerForm.get('password');

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
      const passwordControl = component.registerForm.get('password');

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

    it('should disable signup button when form is invalid', () => {
      fixture.detectChanges();

      expect(component.registerForm.invalid).toBeTrue();
      const registerBtn = fixture.debugElement.query(By.css('button'));
      expect(registerBtn.nativeElement.disabled).toBeTrue();
    });

    it('should reduce the opacity for signup button when form is invalid', () => {
      fixture.detectChanges();

      expect(component.registerForm.invalid).toBeTrue();
      const registerBtn = fixture.debugElement.query(By.css('button'));
      expect(registerBtn.nativeElement.classList.contains('opacity-30')).toBeTrue();
    });

    it('should enable signup button when both fields are valid', () => {
      component.registerForm.patchValue({
        firstName: 'mario',
        lastName: 'rossi',
        email: 'mario.rossi@example.com',
        password: 'Password123!',
      });

      fixture.detectChanges();

      expect(component.registerForm.valid).toBeTrue();
      const registerBtn = fixture.debugElement.query(By.css('button'));
      expect(registerBtn.nativeElement.disabled).toBeFalse();
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
  
  describe('onRegister()', () => {
    it('should do nothing if the form is invalid', () => {
      spyOn(spinnerService, 'show');

      fixture.detectChanges();
      component.onRegister(component.registerForm);

      expect(spinnerService.show).not.toHaveBeenCalled();
    });
  
    it('should clear any existing errorMsg before submitting', () => {
      mockAuthService.register.and.returnValue(NEVER);

      fixture.detectChanges();
      component.onRegister(component.registerForm);

      expect(component.errorMsg()).toEqual('');
    });
  
    it('should call spinnerService.show() on submission', () => {
      component.registerForm.setValue({
        firstName: 'mario',
        lastName: 'rossi',
        email: 'mario.rossi@example.com',
        password: 'Password1!'
      });
      mockAuthService.register.and.returnValue(NEVER);
      spyOn(spinnerService, 'show');

      fixture.detectChanges();
      component.onRegister(component.registerForm);

      expect(spinnerService.show).toHaveBeenCalled();
    });
  
    it('should call auth.register() with the correct AuthRequest payload', () => {
      const registerRequest: RegisterRequest = {
        firstName: 'mario',
        lastName: 'rossi',
        email: 'mario.rossi@example.com',
        password: 'Password123!',
      };
      component.registerForm.patchValue({
        firstName: 'mario',
        lastName: 'rossi',
        email: 'mario.rossi@example.com',
        password: 'Password123!',
      });
      mockAuthService.register.and.returnValue(of(true));

      fixture.detectChanges();
      component.onRegister(component.registerForm);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerRequest);
    });
  
    it('should navigate to /login, and hide the spinner on success', () => {
      component.registerForm.setValue({
        firstName: 'mario',
        lastName: 'rossi',
        email: 'test@example.com',
        password: 'Password1',
      });
      mockAuthService.register.and.returnValue(of(true));
      spyOn(spinnerService, 'hide');
      spyOn(router, 'navigate');

      fixture.detectChanges();
      component.onRegister(component.registerForm);

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      expect(spinnerService.hide).toHaveBeenCalled();
    });
  
    it('should set errorMsg with the server\'s message, hide the spinner, and not navigate on error', () => {
      component.registerForm.setValue({
        firstName: 'mario',
        lastName: 'rossi',
        email: 'test@example.com',
        password: 'Password1',
      });
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockAuthService.register.and.returnValue(throwError(() => error));
      spyOn(spinnerService, 'hide');
      spyOn(router, 'navigate');

      fixture.detectChanges();
      component.onRegister(component.registerForm);

      expect(component.errorMsg()).toBe(error.error.message);
      expect(spinnerService.hide).toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  
    it('should fall back to "Registration failed" on error with no err.error.message', () => {
      component.registerForm.setValue({
        firstName: 'mario',
        lastName: 'rossi',
        email: 'test@example.com',
        password: 'Password1',
      });
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: null}
      });
      mockAuthService.register.and.returnValue(throwError(() => error));

      fixture.detectChanges();
      component.onRegister(component.registerForm);

      expect(component.errorMsg()).toBe('Registration failed');
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
  
    it('should make "log in" link point to /login', () => {
      fixture.detectChanges();

      const link = fixture.debugElement.query(By.css('a.text-yellow-400'));
      expect(link.attributes['routerLink']).toBe('/login');
    });
  });
});
