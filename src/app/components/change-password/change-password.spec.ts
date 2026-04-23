import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { ChangePassword } from './change-password';
import { UserService } from '../../services/user/user-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { By } from '@angular/platform-browser';
import { NEVER, of, throwError } from 'rxjs';
import { PasswordUpdateRequest } from '../../model/request/password-update-request';
import { HttpErrorResponse } from '@angular/common/http';

describe('ChangePassword', () => {
  let component: ChangePassword;
  let fixture: ComponentFixture<ChangePassword>;

  let mockUserService: jasmine.SpyObj<UserService>;
  let spinnerService: NgxSpinnerService;

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj(['updatePassword']);

    await TestBed.configureTestingModule({
      imports: [ChangePassword],
      providers: [
        NgxSpinnerService,
        {provide: UserService, useValue: mockUserService}
      ]
    })
    .compileComponents();

    spinnerService = TestBed.inject(NgxSpinnerService);
    fixture = TestBed.createComponent(ChangePassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form validation', () => {
    const passwordValidationTests: { value: any; valid: boolean }[] = [
      { value: 'Password1', valid: true },
      { value: 'Abcdefg1', valid: true },
      { value: 'StrongPass123', valid: true },
      { value: 'A1b2c3d4', valid: true },

      { value: 'Pass1', valid: false },
      { value: 'Ab1', valid: false },

      { value: 'password1', valid: false },
      { value: 'PASSWORD1', valid: false },

      { value: 'Password', valid: false },
      { value: '        ', valid: false },

      { value: '', valid: false },
      { value: null, valid: false },
      { value: undefined, valid: false },
    ];

    it('should invalidate the form when any field is empty', () => {
      component.resetPasswordForm.patchValue({
        oldPassword: 'Password12!',
        newPassword1: 'Password123!',
      });

      expect(component.resetPasswordForm.valid).toBeFalse();
    });

    it('should reject oldPassword strings that don\'t match the pattern', () => {
      const oldPasswordControl = component.resetPasswordForm.get('oldPassword');

      passwordValidationTests.forEach(test => {
        oldPasswordControl?.patchValue(test.value);
        expect(oldPasswordControl?.valid).toBe(test.valid);
      })
    });

    it('should reject newPassword strings that don\'t match the pattern', () => {
      const newPasswordControl = component.resetPasswordForm.get('newPassword1');

      passwordValidationTests.forEach(test => {
        newPasswordControl?.patchValue(test.value);
        expect(newPasswordControl?.valid).toBe(test.valid);
      })
    });

    it('should provide newPassword2 and should match newPassword2', () => {
      component.resetPasswordForm.patchValue({
        oldPassword: 'Password12!',
        newPassword1: 'Password123!',
        newPassword2: 'Password123!',
      });

      expect(component.resetPasswordForm.valid).toBeTrue();
    });
  });

  describe('template', () => {
    it('should disable submit button when the form is invalid', () => {
      const btn = fixture.debugElement.query(By.css('button'));
      expect(btn.nativeElement.disabled).toBeTrue();
    });

    it('should set opacity-30 for submit button when the form is invalid', () => {
      const btn = fixture.debugElement.query(By.css('button')).nativeElement;
      expect(btn.classList.contains('opacity-30')).toBeTrue();
    });

    it('should show error message only after the field is both touched and dirty', () => {
      const oldPasswordControl = component.resetPasswordForm.get('oldPassword');
      oldPasswordControl?.markAsTouched();
      oldPasswordControl?.markAsDirty();

      fixture.detectChanges();

      const oldPasswordParentElem = fixture.debugElement.query(By.css('[formControlName="oldPassword"]')).parent;
      const errorTxt = oldPasswordParentElem?.query(By.css('p.text-red-400'));
      expect(errorTxt).toBeTruthy();
      expect(errorTxt?.nativeElement.textContent).toBe('Field is required');
    });

    it('should show the "Passwords do not match" message when noMatch error is present on the form group', () => {
      component.resetPasswordForm.patchValue({
        oldPassword: 'Password12!',
        newPassword1: 'Password123!',
        newPassword2: 'Password1',
      });
      component.resetPasswordForm.get('newPassword2')?.markAsTouched();
      component.resetPasswordForm.get('newPassword2')?.markAsDirty();

      fixture.detectChanges();

      const newPassword2ParentElem = fixture.debugElement.query(
        By.css('[formControlName="newPassword2"]'),
      ).parent;
      const errorTxt = newPassword2ParentElem?.query(By.css('p.text-red-400'));
      expect(errorTxt).toBeTruthy();
      expect(errorTxt?.nativeElement.textContent).toBe('Passwords do not match');
      expect(component.resetPasswordForm?.hasError('noMatch')).toBeTrue();
    });

    it('should show the success message only when successMsg is non-empty and isLoading is false', () => {
      component.successMsg.set('some message');
      component.isLoading.set(false);

      fixture.detectChanges();

      const successMsg = fixture.debugElement.query(By.css('p.text-green-500.text-2xl.tracking-wider.mb-7'));
      expect(successMsg).toBeTruthy();
      expect(successMsg.nativeElement.textContent).toBe('some message');
    });
  });

  describe('onSubmit()', () => {
    it('should call userService.updatePassword with the correct PasswordUpdateRequest payload', () => {
      component.resetPasswordForm.patchValue({
        oldPassword: 'Password123!',
        newPassword1: 'Password12345!',
        newPassword2: 'Password12345!',
      });
      const passwordRequest = component.resetPasswordForm.value as PasswordUpdateRequest;
      mockUserService.updatePassword.and.returnValue(of(true));

      fixture.detectChanges();
      component.onSubmit(component.resetPasswordForm);

      expect(mockUserService.updatePassword).toHaveBeenCalledWith(passwordRequest);
    });

    it('should call spinnerService.show() before the request and spinnerService.hide() after on success', () => {
      component.resetPasswordForm.patchValue({
        oldPassword: 'Password123!',
        newPassword1: 'Password12345!',
        newPassword2: 'Password12345!',
      });
      spyOn(spinnerService, 'show');
      spyOn(spinnerService, 'hide');
      mockUserService.updatePassword.and.returnValue(NEVER);

      fixture.detectChanges();
      component.onSubmit(component.resetPasswordForm);

      expect(spinnerService.show).toHaveBeenCalled();

      mockUserService.updatePassword.and.returnValue(of(true));

      fixture.detectChanges();
      component.onSubmit(component.resetPasswordForm);

      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should call spinnerService.show() before the request and spinnerService.hide() after on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      spyOn(spinnerService, 'show');
      spyOn(spinnerService, 'hide');
      mockUserService.updatePassword.and.returnValue(NEVER);

      fixture.detectChanges();
      component.onSubmit(component.resetPasswordForm);

      expect(spinnerService.show).toHaveBeenCalled();

      mockUserService.updatePassword.and.returnValue(throwError(() => error));

      fixture.detectChanges();
      component.onSubmit(component.resetPasswordForm);

      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should set successMsg to "Password updated successfully", reset the form, and set isLoading to false on success', () => {
      component.resetPasswordForm.patchValue({
        oldPassword: 'Password123!',
        newPassword1: 'Password12345!',
        newPassword2: 'Password12345!',
      });
      mockUserService.updatePassword.and.returnValue(of(true));
      spyOn(component.resetPasswordForm, 'reset');

      fixture.detectChanges();
      component.onSubmit(component.resetPasswordForm);

      expect(component.successMsg()).toBe('Password updated successfully');
      expect(component.resetPasswordForm.reset).toHaveBeenCalled();
      expect(component.isLoading()).toBeFalse();
    });

    it('should empty the successMsg, hide the spinner, and set isLoading to false on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      spyOn(spinnerService, 'hide');
      mockUserService.updatePassword.and.returnValue(throwError(() => error));

      fixture.detectChanges();
      component.onSubmit(component.resetPasswordForm);

      expect(component.successMsg()).toBe('');
      expect(component.isLoading()).toBeFalse();
      expect(spinnerService.hide).toHaveBeenCalled();
    });
  });
});
