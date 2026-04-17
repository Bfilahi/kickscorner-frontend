import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { AddBrand } from './add-brand';
import { AdminProductService } from '../../../services/admin/admin-product-service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgForm, NgModel } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NEVER, of, throwError } from 'rxjs';
import { BrandResponse } from '../../../model/response/brand-response';
import { BrandRequest } from '../../../model/request/brand-request';
import { HttpErrorResponse } from '@angular/common/http';

describe('AddBrand', () => {
  let component: AddBrand;
  let fixture: ComponentFixture<AddBrand>;

  let mockAdminProductService: jasmine.SpyObj<AdminProductService>;
  let toastr: ToastrService;
  let spinnerService: NgxSpinnerService;

  let brandResponse: BrandResponse;

  let form: NgForm;

  beforeEach(async () => {
    mockAdminProductService = jasmine.createSpyObj(['addBrand']);
    form = jasmine.createSpyObj('NgForm', ['reset']);

    await TestBed.configureTestingModule({
      imports: [AddBrand, ToastrModule.forRoot(), NoopAnimationsModule],
      providers: [
        NgxSpinnerService,
        { provide: AdminProductService, useValue: mockAdminProductService },
      ],
    }).compileComponents();

    brandResponse = {
      id: 1,
      name: 'Adidas'
    }

    toastr = TestBed.inject(ToastrService);
    spinnerService = TestBed.inject(NgxSpinnerService);
    fixture = TestBed.createComponent(AddBrand);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('template', () => {
    it('should disable submit button when the form is invalid', async () => {
      const buttonElem = fixture.debugElement.query(By.css('button')).nativeElement;

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(buttonElem.disabled).toBeTrue();
    });
    
    it('should enable submit button when the form is valid', async () => {
      const email = fixture.debugElement.query(By.css('input[type="text"]'));
      const emailModel = email.injector.get(NgModel);

      emailModel.control.setValue('some-name');

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const buttonElem = fixture.debugElement.query(By.css('button')).nativeElement;
      expect(buttonElem.disabled).toBeFalse();
    });

    it('should show an error message when field is touched, dirty, and empty', async () => {
      const email = fixture.debugElement.query(By.css('input[type="text"]'));
      const emailModel = email.injector.get(NgModel);

      emailModel.control.markAllAsTouched();
      emailModel.control.markAsDirty();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const errorTxt = fixture.debugElement.query(By.css('p.text-red-400')).nativeElement;
      expect(errorTxt.textContent.trim()).toEqual('Field is required');
    });

    it('should show an error message when input is shorter than 2 characters', async () => {
      const email = fixture.debugElement.query(By.css('input[type="text"]'));
      const emailModel = email.injector.get(NgModel);

      emailModel.control.setValue('a');
      emailModel.control.markAllAsTouched();
      emailModel.control.markAsDirty();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const errorTxt = fixture.debugElement.query(By.css('p.text-red-400')).nativeElement;
      expect(errorTxt.textContent.trim()).toEqual('The minimum length is 2 characters');
    });

    it('should hide the error messages when the field is untouched', async () => {
      const email = fixture.debugElement.query(By.css('input[type="text"]'));
      const emailModel = email.injector.get(NgModel);

      emailModel.control.markAsUntouched();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const errorTxts = fixture.debugElement.queryAll(By.css('p.text-red-400'));
      expect(errorTxts).toEqual([]);
    });
  });

  describe('addBrand()', () => {
    let request: BrandRequest;

    beforeEach(() => {
      form = {
        value: { brand: 'nike' },
        reset: jasmine.createSpy('reset'),
        invalid: true,
      } as unknown as NgForm;

      request = { name: 'nike' };
    });

    it('should call toastr.error and reset the form when the trimmed value is empty', () => {
      form.value.brand = ' ';
      spyOn(toastr, 'error');

      component.addBrand(form);

      expect(toastr.error).toHaveBeenCalled();
    });

    it('should call spinnerService.show() before the HTTP call', () => {
      mockAdminProductService.addBrand.and.returnValue(NEVER);
      spyOn(spinnerService, 'show');

      component.addBrand(form);

      expect(spinnerService.show).toHaveBeenCalled();
    });

    it('should call adminProductService.addBrand() with the correct BandRequest', () => {
      mockAdminProductService.addBrand.and.returnValue(of(brandResponse));

      component.addBrand(form);

      expect(mockAdminProductService.addBrand).toHaveBeenCalledWith(request);
    });

    it('should reset the form, hide the spinner, and call toastr.success on success', () => {
      mockAdminProductService.addBrand.and.returnValue(of(brandResponse));
      spyOn(spinnerService, 'hide');
      spyOn(toastr, 'success');

      component.addBrand(form);

      expect(form.reset).toHaveBeenCalled();
      expect(spinnerService.hide).toHaveBeenCalled();
      expect(toastr.success).toHaveBeenCalledWith(brandResponse.name, 'Brand added successfully', {progressBar: true});
    });

    it('should hide the spinner and call toastr.error on error', () => {
      const error = new HttpErrorResponse({status: 500, error: {message: 'Request failed'}});
      mockAdminProductService.addBrand.and.returnValue(throwError(() => error));
      spyOn(spinnerService, 'hide');
      spyOn(toastr, 'error');

      component.addBrand(form);

      expect(spinnerService.hide).toHaveBeenCalled();
      expect(toastr.error).toHaveBeenCalledWith(
        error.error.message,
        'HttpErrorResponse',
        { progressBar: true },
      );
    });
  });
});
