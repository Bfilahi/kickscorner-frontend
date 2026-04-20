import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { EditProduct } from './edit-product';
import { AdminProductService } from '../../../services/admin/admin-product-service';
import { ProductService } from '../../../services/product-service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { ProductResponse } from '../../../model/response/product-response';
import { NEVER, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { SizeResponse } from '../../../model/response/size-response';
import { BrandResponse } from '../../../model/response/brand-response';
import { ColorResponse } from '../../../model/response/color-response';
import { FormGroup } from '@angular/forms';



describe('EditProduct', () => {
  let component: EditProduct;
  let fixture: ComponentFixture<EditProduct>;

  let mockAdminProductService: jasmine.SpyObj<AdminProductService>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let toastr: ToastrService;
  let spinnerService: NgxSpinnerService;

  let mockProductResponse: ProductResponse;
  let productForm: FormGroup = new FormGroup({});

  let route: ActivatedRoute;

  beforeEach(async () => {
    mockAdminProductService = jasmine.createSpyObj(['updateProduct']);
    mockProductService = jasmine.createSpyObj(['getProduct']);

    await TestBed.configureTestingModule({
      imports: [EditProduct, ToastrModule.forRoot(), NoopAnimationsModule],
      providers: [
        provideRouter([]),
        NgxSpinnerService,
        {provide: AdminProductService, useValue: mockAdminProductService},
        {provide: ProductService, useValue: mockProductService}
      ]
    })
    .compileComponents();

    mockProductResponse = {
      id: 1,
      name: 'Nike air',
      description: 'mock description',
      price: 200,
      unitsInStock: 30,

      sizes: [
        { id: 1, name: 'XL' },
        { id: 2, name: 'L' },
      ],
      brand: { id: 1, name: 'Nike' },
      colors: [
        { id: 1, name: 'red' },
        { id: 2, name: 'blue' },
      ],
      images: [{ publicId: 'mock-pid1', imgUrl: '/mock-path-1' }],
    };

    route = TestBed.inject(ActivatedRoute);
    spinnerService = TestBed.inject(NgxSpinnerService);
    toastr = TestBed.inject(ToastrService);
    fixture = TestBed.createComponent(EditProduct);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should call getProduct()', () => {
      spyOn(component as any, 'getProduct');

      fixture.detectChanges();

      expect(component['getProduct']).toHaveBeenCalled();
    });

    it('should make getProduct extract the correct id from route params and call the service', () => {
      mockProductService.getProduct.and.returnValue(NEVER);
      spyOn(route.snapshot.paramMap, 'get').and.returnValue('40');

      fixture.detectChanges();

      expect(mockProductService.getProduct).toHaveBeenCalledWith(40);
    });
  });

  describe('getProduct()', () => {
    it('should populate with response and cdr.detectChanges() is called on success', () => {
      mockProductService.getProduct.and.returnValue(of(mockProductResponse));
      const cdrSpy = spyOn(component['cdr'], 'detectChanges');

      fixture.detectChanges();

      expect(component.product).toEqual(mockProductResponse);
      expect(cdrSpy).toHaveBeenCalled();
    });

    it('should call console.error with the error message, and the product state remains unchanged on error', () => {
      const product = {
        id: 0,
        name: <string>'',
        description: <string>'',
        price: <number | null> null,
        unitsInStock: <number | null> null,
        sizes: <SizeResponse[]>[],
        brand: <BrandResponse> {},
        colors: <ColorResponse[]>[],
        images: []
      };
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockProductService.getProduct.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      fixture.detectChanges();

      expect(component.product).toEqual(product);
      expect(console.error).toHaveBeenCalledWith(error.error.message);
    });
  });

  describe('editProduct()', () => {
    const  formData = new FormData();

    formData.append('name', 'Nike');
    formData.append('description', 'mock description');
    formData.append('price', '200');
    formData.append('unitsInStock', '30');
    formData.append('brandId', '2');
    formData.append('colorIds', '3');
    formData.append('sizeIds', '2');
    formData.append(
      'images',
      new File(['foo'], 'foo1.txt', { type: 'text/plain' }),
    );

    it('should extract the correct id from route params', () => {
      mockProductService.getProduct.and.returnValue(NEVER);
      mockAdminProductService.updateProduct.and.returnValue(NEVER);
      spyOn(route.snapshot.paramMap, 'get').and.returnValue('40');

      fixture.detectChanges();
      component.editProduct({productForm, formData});

      expect(mockAdminProductService.updateProduct).toHaveBeenCalledWith(40, formData);
    });

    it('should call spinnerService.show() before the request', () => {
      mockProductService.getProduct.and.returnValue(NEVER);
      mockAdminProductService.updateProduct.and.returnValue(NEVER);
      spyOn(spinnerService, 'show');

      fixture.detectChanges();
      component.editProduct({productForm, formData});

      expect(spinnerService.show).toHaveBeenCalled();
    });

    it('should call adminProductService.updateProduct(id, formData) with the correct arguments', () =>{
      mockProductService.getProduct.and.returnValue(NEVER);
      mockAdminProductService.updateProduct.and.returnValue(NEVER);
      spyOn(route.snapshot.paramMap, 'get').and.returnValue('4');

      fixture.detectChanges();
      component.editProduct({productForm, formData});

      expect(mockAdminProductService.updateProduct).toHaveBeenCalledWith(4, formData);
    });

    it('should call spinnerService.hide() on success', () => {
      mockProductService.getProduct.and.returnValue(NEVER);
      mockAdminProductService.updateProduct.and.returnValue(of(mockProductResponse));
      spyOn(spinnerService, 'hide');

      fixture.detectChanges();
      component.editProduct({productForm, formData});

      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should call toastr.success with the right message and product name', () => {
      mockProductService.getProduct.and.returnValue(NEVER);
      mockAdminProductService.updateProduct.and.returnValue(of(mockProductResponse));
      spyOn(toastr, 'success');

      fixture.detectChanges();
      component.editProduct({productForm, formData});

      expect(toastr.success).toHaveBeenCalledWith(
        mockProductResponse.name,
        'Product updated successfully',
        { progressBar: true },
      );
    });

    it('should make the router navigate to /admin/products on success', () => {
      mockProductService.getProduct.and.returnValue(NEVER);
      mockAdminProductService.updateProduct.and.returnValue(of(mockProductResponse));
      let spyRouter = spyOn(component['router'], 'navigateByUrl');

      fixture.detectChanges();
      component.editProduct({productForm, formData});

      expect(spyRouter).toHaveBeenCalledWith('/admin/products');
    });

    it('should call spinnerService.hide() on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockAdminProductService.updateProduct.and.returnValue(throwError(() => error));
      mockProductService.getProduct.and.returnValue(NEVER);
      spyOn(spinnerService, 'hide');

      fixture.detectChanges();
      component.editProduct({productForm, formData});

      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should call taostr.error with err.error.message and err.name on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: { message: 'Something went wrong' },
      });
      mockAdminProductService.updateProduct.and.returnValue(throwError(() => error));
      mockProductService.getProduct.and.returnValue(NEVER);
      spyOn(toastr, 'error');

      fixture.detectChanges();
      component.editProduct({ productForm, formData });

      expect(toastr.error).toHaveBeenCalledWith(
        error.error.message,
        'HttpErrorResponse',
        { progressBar: true },
      );
    });

    it('should not make router navigate on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: { message: 'Something went wrong' },
      });
      mockAdminProductService.updateProduct.and.returnValue(throwError(() => error));
      mockProductService.getProduct.and.returnValue(NEVER);
      let spyRouter = spyOn(component['router'], 'navigateByUrl');

      fixture.detectChanges();
      component.editProduct({ productForm, formData });

      expect(spyRouter).not.toHaveBeenCalled();
    });
  });

});

