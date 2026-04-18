import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { AddSize } from './add-size';
import { AdminProductService } from '../../../services/admin/admin-product-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgForm, NgModel } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { SizeRequest } from '../../../model/request/size-request';
import { NEVER, of, throwError } from 'rxjs';
import { SizeResponse } from '../../../model/response/size-response';
import { HttpErrorResponse } from '@angular/common/http';

describe('AddSize', () => {
  let component: AddSize;
  let fixture: ComponentFixture<AddSize>;

  let spinnerService: NgxSpinnerService;
  let toastr: ToastrService;
  let mockAdminProductService: jasmine.SpyObj<AdminProductService>;

  let form: NgForm;
  let sizeRequest: SizeRequest;
  let sizeResponse: SizeResponse;

  beforeEach(async () => {
    mockAdminProductService = jasmine.createSpyObj(['addSize']);

    await TestBed.configureTestingModule({
      imports: [AddSize, ToastrModule.forRoot(), NoopAnimationsModule],
      providers: [
        NgxSpinnerService,
        {provide: AdminProductService, useValue: mockAdminProductService}
      ]
    })
    .compileComponents();

    form = {
      value: { size: 'XL' },
      reset: jasmine.createSpy('reset'),
      invalid: true,
    } as unknown as NgForm;

    sizeRequest = {
      name: 'XL'
    };

    sizeResponse = {
      id: 1,
      name: 'XL'
    }

    spinnerService = TestBed.inject(NgxSpinnerService);
    toastr = TestBed.inject(ToastrService);
    fixture = TestBed.createComponent(AddSize);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('template', () => {
    let input: DebugElement;
    let inputModel: NgModel;

    beforeEach(() => {
      input = fixture.debugElement.query(By.css('input[type="text"]'));
      inputModel = input.injector.get(NgModel);
    });

    it('should invalidate the form when the input is empty', async () => {
      inputModel.control.setValue('');
      inputModel.control.markAsDirty();
      inputModel.control.markAsTouched();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const formElem = fixture.debugElement.query(By.directive(NgForm)).injector.get(NgForm);
      expect(formElem.invalid).toBeTrue();
    });

    it('should validate form when the input has a value', async () => {
      inputModel.control.setValue('L');
      inputModel.control.markAsDirty();
      inputModel.control.markAsTouched();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const formElem = fixture.debugElement
        .query(By.directive(NgForm))
        .injector.get(NgForm);
      expect(formElem.invalid).toBeFalse();
    });

    it('should render an error message only when the field is both touched and dirty', async () => {
      inputModel.control.setValue('');
      inputModel.control.markAsTouched();
      inputModel.control.markAsDirty();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const errorTxt = fixture.debugElement.query(By.css('p.text-red-400'));
      expect(errorTxt.nativeElement.textContent).toBe('Field is required');
    });

    it('should not render an error message when the field is pristine', async () => {
      inputModel.control.markAsDirty();
      inputModel.control.markAsPristine();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const errorTxt = fixture.debugElement.query(By.css('p.text-red-400'));
      expect(errorTxt).toBeNull();
    });

    it('should disable submit button when the form is invalid', async () => {
      inputModel.control.setValue('');
      inputModel.control.markAsDirty();
      inputModel.control.markAsPristine();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.disabled).toBeTrue();
    });

    it('should assign opacity-30 class to submit button when form is invalid', async () => {
      inputModel.control.setValue('');
      inputModel.control.markAsDirty();
      inputModel.control.markAsPristine();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.classList).toContain('opacity-30');
    });

    it('should enable submit button when form is valid', async () => {
      inputModel.control.setValue('L');
      inputModel.control.markAsDirty();
      inputModel.control.markAsPristine();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.disabled).toBeFalse();
    });
  });

  describe('addSize()', () => {
    it('should call adminProductService.addSize() with the correct SizeRequest payload', () => {
      mockAdminProductService.addSize.and.returnValue(of(sizeResponse));

      component.addSize(form);

      expect(mockAdminProductService.addSize).toHaveBeenCalledWith(sizeRequest);
    });

    it('should call spinnerService.show() before the request', () => {
      mockAdminProductService.addSize.and.returnValue(NEVER);
      spyOn(spinnerService, 'show');

      component.addSize(form);

      expect(spinnerService.show).toHaveBeenCalled();
    });

    describe('on success', () => {
      beforeEach(() => {
        mockAdminProductService.addSize.and.returnValue(of(sizeResponse));
      });

      it('should call pinnerService.hide() on success', () => {
        spyOn(spinnerService, 'hide');
  
        component.addSize(form);
  
        expect(spinnerService.hide).toHaveBeenCalled();
      });
  
      it('should call sizeForm.reset() on success', () => {
        component.addSize(form);
  
        expect(form.reset).toHaveBeenCalled();
      });
  
      it('should call toastr.success() with the correct arguments on success', () => {
        spyOn(toastr, 'success');

        component.addSize(form);

        expect(toastr.success).toHaveBeenCalledWith(
          sizeResponse.name,
          'Size added successfully',
          { progressBar: true },
        );
      });
    });

    describe('on error', () => {
      let error: HttpErrorResponse;

      beforeEach(() => {
        error = new HttpErrorResponse({status: 500, error: { message: 'Request failed' }});
        mockAdminProductService.addSize.and.returnValue(throwError(() => error));
      });

      it('should call spinnerService.hide() on error', () => {
        spyOn(spinnerService, 'hide');

        component.addSize(form);

        expect(spinnerService.hide).toHaveBeenCalled();
      });

      it('should not call sizeForm.reset() on error', () => {
        component.addSize(form);

        expect(form.reset).not.toHaveBeenCalled();
      });

      it('should call toastr.error() with the correct arguments on error', () => {
        spyOn(toastr, 'error');

        component.addSize(form);

        expect(toastr.error).toHaveBeenCalledWith(
          error.error.message,
          'HttpErrorResponse',
          { progressBar: true },
        );
      });

      it('should log an error to console.error', () => {
        spyOn(console, 'error');

        component.addSize(form);

        expect(console.error).toHaveBeenCalledWith(error);
      });
    });
  });
});
