import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { ProductsList } from './products-list';
import { GetResponseProducts, ProductService } from '../../../services/product-service';
import { AdminProductService } from '../../../services/admin/admin-product-service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { NEVER, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';


describe('ProductsList', () => {
  let component: ProductsList;
  let fixture: ComponentFixture<ProductsList>;

  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockAdminProductService: jasmine.SpyObj<AdminProductService>;
  let toastr: ToastrService;
  let spinnerService: NgxSpinnerService;

  let mockGetResponseProducts: GetResponseProducts;

  beforeEach(async () => {
    mockProductService = jasmine.createSpyObj(['getProducts']);
    mockAdminProductService = jasmine.createSpyObj(['deleteProduct']);

    mockProductService.getProducts.and.returnValue(NEVER);

    await TestBed.configureTestingModule({
      imports: [ProductsList, ToastrModule.forRoot(), NoopAnimationsModule],
      providers: [
        provideRouter([]),
        NgxSpinnerService,
        { provide: ProductService, useValue: mockProductService },
        { provide: AdminProductService, useValue: mockAdminProductService }
      ]
    })
    .compileComponents();

    mockGetResponseProducts = {
      content: [
        {
          id: 1,
          name: 'Nike air',
          description: 'mock nike description',
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
          images: [
            { publicId: 'mock-pid1', imgUrl: '/mock-path-1' },
            { publicId: 'mock-pid2', imgUrl: '/mock-path-2' },
            { publicId: 'mock-pid3', imgUrl: '/mock-path-3' },
            { publicId: 'mock-pid4', imgUrl: '/mock-path-4' },
          ],
        },
        {
          id: 2,
          name: 'Adidas classic',
          description: 'mock adidas description',
          price: 150,
          unitsInStock: 10,

          sizes: [
            { id: 3, name: 'M' },
            { id: 4, name: 'S' },
          ],
          brand: { id: 2, name: 'Adidas' },
          colors: [
            { id: 3, name: 'white' },
            { id: 4, name: 'yellow' },
          ],
          images: [
            { publicId: 'mock-pid1', imgUrl: '/mock-path-1' },
            { publicId: 'mock-pid2', imgUrl: '/mock-path-2' },
            { publicId: 'mock-pid3', imgUrl: '/mock-path-3' },
            { publicId: 'mock-pid4', imgUrl: '/mock-path-4' },
          ],
        },
      ],
      page: {
        size: 10,
        totalElements: 50,
        totalPages: 5,
        number: 1,
      },
    };

    toastr = TestBed.inject(ToastrService);
    spinnerService = TestBed.inject(NgxSpinnerService);
    fixture = TestBed.createComponent(ProductsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should call listProducts with the default partialParams', () => {
      spyOn(component as any, 'listProducts');

      component.ngOnInit();

      expect(component['listProducts']).toHaveBeenCalledWith(component.partialParams);
    });
  });

  describe('listProducts', () => {
    it('should show the spinner before the request', () => {
      spyOn(spinnerService, 'show');

      component.ngOnInit();

      expect(spinnerService.show).toHaveBeenCalled();
    });

    it('should populate products, set totalItems, update page and size from the response, hide the spinner and set isLoading to false on success', () => {
      mockProductService.getProducts.and.returnValue(of(mockGetResponseProducts));
      spyOn(spinnerService, 'hide');

      component.ngOnInit();

      expect(component.products).toEqual(mockGetResponseProducts.content);
      expect(component.totalItems).toBe(mockGetResponseProducts.page.totalElements);
      expect(component.partialParams.page).toBe(mockGetResponseProducts.page.number + 1);
      expect(component.partialParams.size).toBe(mockGetResponseProducts.page.size);
      expect(component.isLoading).toBeFalse();
      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should hide spinner, set isLoading to false, and products should stay empty on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockProductService.getProducts.and.returnValue(throwError(() => error));
      spyOn(spinnerService, 'hide');

      component.ngOnInit();

      expect(spinnerService.hide).toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
      expect(component.products).toEqual([]);
    });

    it('should call cdr.detectChanges() after data is set', () => {
      mockProductService.getProducts.and.returnValue(of(mockGetResponseProducts));
      const cdrSpy = spyOn(component['cdr'], 'detectChanges');

      component.ngOnInit();

      expect(cdrSpy).toHaveBeenCalled();
    });
  });

  describe('onPageChange', () => {
    const newPage: number = 4;

    it('should update partialParams.page with the page number', () => {
      component.onPageChange(newPage);

      expect(component.partialParams.page).toBe(newPage);
    });

    it('should call listProducts with the updated params', () => {
      const newPartialParams = {
        page: 4,
        size: 10,
        sort: '',
        direction: '',
      };
      spyOn(component as any, 'listProducts');

      component.onPageChange(newPage);

      expect(component['listProducts']).toHaveBeenCalledWith(newPartialParams);
    });
  });

  describe('delete', () => {
    const id: number = 1;

    it('should not do anything when the user cancels the confirm dialog', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      spyOn(spinnerService, 'show');

      component.delete(id);

      expect(spinnerService.show).not.toHaveBeenCalled();
    });

    it('should show spinner and set isLoading to true before the request', () => {
      mockAdminProductService.deleteProduct.and.returnValue(NEVER);
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(spinnerService, 'show');

      component.delete(id);

      expect(spinnerService.show).toHaveBeenCalled();
      expect(component.isLoading).toBeTrue();
    });

    it(`should remove the product from the products array, hide spinner, set isLoading to false, 
      show a success toastr with the deleted product\s name on success`, () => {
        const deletedProduct = mockGetResponseProducts.content.find(p => p.id === id);
        mockAdminProductService.deleteProduct.and.returnValue(of(void 0));
        spyOn(window, 'confirm').and.returnValue(true);
        spyOn(spinnerService, 'hide');
        spyOn(toastr, 'success');
        component.products = mockGetResponseProducts.content;

        component.delete(id);

        expect(component.isLoading).toBeFalse();
        expect(spinnerService.hide).toHaveBeenCalled();
        expect(toastr.success).toHaveBeenCalledWith(
          deletedProduct!.name,
          'Product deleted successfully',
          { progressBar: true },
        );
        expect(component.products).toEqual([mockGetResponseProducts.content[1]]);
      });

    it('should hide spinner, set isLoading to false, and show an error toastr with err.error.message on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockAdminProductService.deleteProduct.and.returnValue(throwError(() => error));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(spinnerService, 'hide');
      spyOn(toastr, 'error');

      component.delete(id);

      expect(component.isLoading).toBeFalse();
      expect(spinnerService.hide).toHaveBeenCalled();
      expect(toastr.error).toHaveBeenCalledWith(error.error.message, 'Error:', {
        progressBar: true,
      });
    });

    it('should call cdr.detectChanges() after removing the product', () => {
      mockAdminProductService.deleteProduct.and.returnValue(of(void 0));
      spyOn(window, 'confirm').and.returnValue(true);
      const cdrSpy = spyOn(component['cdr'], 'detectChanges');

      component.delete(id);

      expect(cdrSpy).toHaveBeenCalled();
    });
  });
});

