import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { AddProduct } from './add-product';
import { AdminProductService } from '../../../services/admin/admin-product-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormGroup } from '@angular/forms';
import { ProductResponse } from '../../../model/response/product-response';
import { NEVER, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('AddProduct', () => {
  let component: AddProduct;
  let fixture: ComponentFixture<AddProduct>;

  let mockAdminProductService: jasmine.SpyObj<AdminProductService>;
  let spinnerService: NgxSpinnerService;
  let toastr: ToastrService;

  let productForm: FormGroup = new FormGroup({});
  let mockProductResponse: ProductResponse;

  beforeEach(async () => {
    mockAdminProductService = jasmine.createSpyObj(['addProduct']);

    await TestBed.configureTestingModule({
      imports: [AddProduct, ToastrModule.forRoot(), NoopAnimationsModule], 
      providers: [
        NgxSpinnerService,
        {provide: AdminProductService, useValue: mockAdminProductService}
      ]
    })
    .compileComponents();

    mockProductResponse = {
      id: 1,
      name: 'Nike air',
      description: 'mock description',
      price: 200,
      unitsInStock: 30,
  
      sizes: [{id: 1, name: 'XL'}, {id: 2, name: 'L'}],
      brand: {id: 1, name: 'Nike'},
      colors: [{id: 1, name: 'red'}, {id: 2, name: 'blue'}],
      images: [{publicId: 'mock-pid1', imgUrl: '/mock-path-1'}]
    }

    spinnerService = TestBed.inject(NgxSpinnerService);
    toastr = TestBed.inject(ToastrService);
    fixture = TestBed.createComponent(AddProduct);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('addProdut()', () => {
    let formData: FormData;

    beforeEach(() => {
      formData = new FormData();

      formData.append('name', 'Nike');
      formData.append('description', 'mock description');
      formData.append('price', '200');
      formData.append('unitsInStock', '30');
      formData.append('brandId', '2');
      formData.append('colorIds', '3');
      formData.append('sizeIds', '2');
      formData.append('images', new File(['foo'], 'foo1.txt', {type: 'text/plain'}));
    });

    it('should call adminProductService.addProduct() with correct formData', () => {
      mockAdminProductService.addProduct.and.returnValue(of(mockProductResponse));

      component.addProduct({productForm, formData});

      expect(mockAdminProductService.addProduct).toHaveBeenCalledWith(formData);
    });

    it('should show the spinner before HTTP call', () => {
      mockAdminProductService.addProduct.and.returnValue(NEVER);
      spyOn(spinnerService, 'show');

      component.addProduct({productForm, formData});

      expect(spinnerService.show).toHaveBeenCalled();
    });

    describe('on success', () => {
      it('should hide the spinner after a successful response', () => {
        mockAdminProductService.addProduct.and.returnValue(of(mockProductResponse));
        spyOn(spinnerService, 'hide');
  
        component.addProduct({ productForm, formData });
  
        expect(spinnerService.hide).toHaveBeenCalled();
      });
  
      it('should call productForm.reset() on success', () => {
        mockAdminProductService.addProduct.and.returnValue(of(mockProductResponse));
        spyOn(productForm, 'reset');
  
        component.addProduct({ productForm, formData });
  
        expect(productForm.reset).toHaveBeenCalled();
      });
  
      it('should show a success toastr with the product name and correct message', () => {
        mockAdminProductService.addProduct.and.returnValue(of(mockProductResponse));
        spyOn(toastr, 'success');
  
        component.addProduct({productForm, formData});
  
        expect(toastr.success).toHaveBeenCalledWith(
          mockProductResponse.name,
          'Product added successfully',
          { progressBar: true },
        );
      });
    });

    describe('on error', () => {
      let error: HttpErrorResponse;

      beforeEach(() => {
        error = new HttpErrorResponse({
          status: 500,
          error: { message: 'Something went wrong' },
          statusText: 'Internal Server Error',
        });
        mockAdminProductService.addProduct.and.returnValue(throwError(() => error));
      });

      it('should hide spinner on error', () => {
        spyOn(spinnerService, 'hide');

        component.addProduct({ productForm, formData });

        expect(spinnerService.hide).toHaveBeenCalled();
      });

      it('should show an error toastr with err.error.message and err.name', () => {
        spyOn(toastr, 'error');

        component.addProduct({ productForm, formData });

        expect(toastr.error).toHaveBeenCalledWith(
          error.error.message,
          'HttpErrorResponse',
          { progressBar: true },
        );
      });

      it('should not call productForm.reset() on error', () => {
        spyOn(productForm, 'reset');

        component.addProduct({ productForm, formData });

        expect(productForm.reset).not.toHaveBeenCalled();
      });
    });
  });

});
