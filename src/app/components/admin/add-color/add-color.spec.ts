import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { AddColor } from './add-color';
import { NgxSpinnerService } from 'ngx-spinner';
import { AdminProductService } from '../../../services/admin/admin-product-service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgForm, NgModel } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { NEVER, of, throwError } from 'rxjs';
import { ColorRequest } from '../../../model/request/color-request';
import { ColorResponse } from '../../../model/response/color-response';
import { HttpErrorResponse } from '@angular/common/http';

describe('AddColor', () => {
  let component: AddColor;
  let fixture: ComponentFixture<AddColor>;

  let mockAdminProductService: jasmine.SpyObj<AdminProductService>;
  let spinnerService: NgxSpinnerService;
  let toastr: ToastrService;
  let form: NgForm;
  let colorResponse: ColorResponse;
  let request: ColorRequest;



  beforeEach(async () => {
    mockAdminProductService = jasmine.createSpyObj(['addColor']);

    await TestBed.configureTestingModule({
      imports: [AddColor, ToastrModule.forRoot(), NoopAnimationsModule],
      providers: [
        NgxSpinnerService,
        {provide: AdminProductService, useValue: mockAdminProductService}
      ]
    })
    .compileComponents();

    form = {
      value: {color: 'blue'},
      reset: jasmine.createSpy('reset'),
      invalid: true
    } as unknown as NgForm;

    colorResponse = {
      id: 1,
      name: 'blue'
    }

    request = { name: 'blue' };

    spinnerService = TestBed.inject(NgxSpinnerService);
    toastr = TestBed.inject(ToastrService);
    fixture = TestBed.createComponent(AddColor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form validation', () => {
    let input: DebugElement;
    let inputModel: NgModel;

    beforeEach(() => {
      input = fixture.debugElement.query(By.css('input[type="text"]'));
      inputModel = input.injector.get(NgModel);
    });

    it('should invalidate the form when the input is empty', async () => {
      inputModel.control.setValue('');

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const formElem = fixture.debugElement
        .query(By.directive(NgForm))
        .injector.get(NgForm);
      expect(formElem.invalid).toBeTrue();
    });

    it('should invalidate the form when the input length is less than 3 characters', async () => {
      inputModel.control.setValue('re');

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const formElem = fixture.debugElement.query(By.directive(NgForm)).injector.get(NgForm);
      expect(formElem.invalid).toBeTrue();
    });

    it('should validate the form when input has 3 or more characters', async () => {
      inputModel.control.setValue('red');

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const formElem = fixture.debugElement.query(By.directive(NgForm)).injector.get(NgForm);
      expect(formElem.valid).toBeTrue();
    });

    it('should disable submit button when form is invalid', async () => {
      inputModel.control.setValue('re');

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.disabled).toBeTrue();
    });

    it('should enable submit button when form is valid', async () => {
      inputModel.control.setValue('blue');

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.disabled).toBeFalse();
    });

    it('should not show error messages before field is touched/dirty', async () => {
      inputModel.control.setValue('');
      inputModel.control.markAsUntouched();
      inputModel.control.markAsPristine();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const errorTxt = fixture.debugElement.query(By.css('.text-red-400'));
      expect(errorTxt).toBeNull();
    });

    it('should show an error message when field is empty, touched, and dirty', async () => {
      inputModel.control.setValue('');
      inputModel.control.markAsTouched();
      inputModel.control.markAsDirty();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const errorTxt = fixture.debugElement.query(By.css('.text-red-400'));
      expect(errorTxt.nativeElement.textContent).toBe('Field is required');
    });

    it('should show an error message when field has fewer than 3 characters, touched, and dirty', async () => {
      inputModel.control.setValue('re');
      inputModel.control.markAsTouched();
      inputModel.control.markAsDirty();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const errorTxt = fixture.debugElement.query(By.css('.text-red-400'));
      expect(errorTxt.nativeElement.textContent).toBe(
        'The minimum length is 3 character',
      );
    });
  });

  describe('addColor()', () => {
    it('should call adminProductService.addColor() with the correctly shaped ColorRequest', () => {
      mockAdminProductService.addColor.and.returnValue(of(colorResponse));

      component.addColor(form);

      expect(mockAdminProductService.addColor).toHaveBeenCalledWith(request);
    });

    it('should call spinnerService.show() before the request', () => {
      mockAdminProductService.addColor.and.returnValue(NEVER);
      spyOn(spinnerService, 'show');

      component.addColor(form);

      expect(spinnerService.show).toHaveBeenCalled();
    });

    it('should call spinnerService.hide() after success', () => {
      mockAdminProductService.addColor.and.returnValue(of(colorResponse));
      spyOn(spinnerService, 'hide');

      component.addColor(form);

      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should reset the form on success', () => {
      mockAdminProductService.addColor.and.returnValue(of(colorResponse));

      component.addColor(form);

      expect(form.reset).toHaveBeenCalled();
    });

    it('should call toastr.success() with the response name and correct message', () => {
      mockAdminProductService.addColor.and.returnValue(of(colorResponse));
      spyOn(toastr, 'success');

      component.addColor(form);

      expect(toastr.success).toHaveBeenCalledWith(
        colorResponse.name,
        'Color added successfully',
        { progressBar: true },
      );
    });
  });

  describe('addColor()', () => {
    it('should call spinnerService.hide() on error', () => {
      const error = new HttpErrorResponse({
        status: 500,
        error: { message: 'Request failed' },
      });
      mockAdminProductService.addColor.and.returnValue(throwError(() => error));
      spyOn(spinnerService, 'hide');

      component.addColor(form);

      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should call toastr.error() with err.error.message and err.name', () => {
      const error = new HttpErrorResponse({
        status: 500,
        error: { message: 'Request failed' },
      });
      mockAdminProductService.addColor.and.returnValue(throwError(() => error));
      spyOn(toastr, 'error');

      component.addColor(form);

      expect(toastr.error).toHaveBeenCalledWith(
        error.error.message,
        'HttpErrorResponse',
        { progressBar: true },
      );
    });

    it('should not reset the form on error', () => {
      const error = new HttpErrorResponse({
        status: 500,
        error: { message: 'Request failed' },
      });
      mockAdminProductService.addColor.and.returnValue(
        throwError(() => error),
      );

      component.addColor(form);

      expect(form.reset).not.toHaveBeenCalled();
    });
  });

});
