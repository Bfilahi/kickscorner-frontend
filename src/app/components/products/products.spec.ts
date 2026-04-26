import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { Products } from './products';
import { GetResponseProducts, ProductService } from '../../services/product-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AdminProductService } from '../../services/admin/admin-product-service';
import { provideRouter } from '@angular/router';
import { NEVER, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';

describe('Products', () => {
  let component: Products;
  let fixture: ComponentFixture<Products>;

  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockAdminProductService: jasmine.SpyObj<AdminProductService>;
  let spinnerService: NgxSpinnerService

  let mockGetResponseProducts: GetResponseProducts;

  
  beforeEach(async () => {
    mockAdminProductService = jasmine.createSpyObj([
      'getBrands',
      'getSizes',
      'getColors',
    ]);
    mockProductService = jasmine.createSpyObj([
      'getFilteredProducts',
      'getProducts',
    ]);

    mockProductService.getFilteredProducts.and.returnValue(NEVER);
    mockProductService.getProducts.and.returnValue(NEVER);

    mockAdminProductService.getBrands.and.returnValue(NEVER);
    mockAdminProductService.getSizes.and.returnValue(NEVER);
    mockAdminProductService.getColors.and.returnValue(NEVER);

    await TestBed.configureTestingModule({
      imports: [Products],
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

    spinnerService = TestBed.inject(NgxSpinnerService);
    fixture = TestBed.createComponent(Products);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should call productService.getProducts on init', () => {
      fixture.detectChanges()

      expect(mockProductService.getProducts).toHaveBeenCalled();
    });

    it('should show spinner during load', () => {
      spyOn(spinnerService, 'show');

      fixture.detectChanges();

      expect(spinnerService.show).toHaveBeenCalled();
    });

    it('should hide spinner on success', () => {
      mockProductService.getProducts.and.returnValue(of(mockGetResponseProducts));
      spyOn(spinnerService, 'hide');

      fixture.detectChanges();

      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should set isLoading to false after products load', () => {
      mockProductService.getProducts.and.returnValue(of(mockGetResponseProducts));

      fixture.detectChanges();

      expect(component.isLoading).toBeFalse();
    });

    it('should populate products list and pagination from the response', () => {
      mockProductService.getProducts.and.returnValue(of(mockGetResponseProducts));

      fixture.detectChanges();

      expect(component.products).toEqual(mockGetResponseProducts.content);
      expect(component.partialParams.page).toBe(mockGetResponseProducts.page.number + 1);
      expect(component.partialParams.size).toBe(mockGetResponseProducts.page.size);
      expect(component.totalItems).toBe(mockGetResponseProducts.page.totalElements);
    });
  });

  describe('computed properties', () => {
    it('should make showingStart return 0 when totalItems is 0', () => {
      fixture.detectChanges();

      expect(component.showingStart).toBe(0);
    });

    it('should make showingStart calculate correctly mid-pagination', () =>{
      component.totalItems = 10;

      fixture.detectChanges();

      expect(component.showingStart).toBe(1);
    });

    it('should make showingEnd return 0 when totalItems is 0', () => {
      fixture.detectChanges();

      expect(component.showingEnd).toBe(0);
    });

    it('should make showingEnd cap at totalItems on the last page', () => {
      component.totalItems = 10;
      component.partialParams = {
        page: 3,
        size: 10,
        sort: '',
        direction: '',
      };

      fixture.detectChanges();

      expect(component.showingEnd).toBe(10);
    });
  });

  describe('sorting', () => {
    it('should emit the selected value through sortingSubject', () => {
      const testValue = 'mock-test'
      const event = { target: { value: testValue } } as unknown as Event;

      component.onSortChange(event);

      component.sortingSubject.subscribe(res => expect(res).toBe(testValue));
    });
  });

  describe('filtering via updateProducts', () => {
    it('should store currentBrands/Sizes/Colors after updateProducts is called', () => {
      const brands: number[] = [1, 2];
      const sizes: number[] = [2, 4];
      const colors: number[] = [1];

      fixture.detectChanges();
      component.updateProducts({response: mockGetResponseProducts, brands, sizes, colors});

      expect(component['currentBrands']).toEqual(brands);
      expect(component['currentSizes']).toEqual(sizes);
      expect(component['currentColors']).toEqual(colors);
      expect(component.products).toEqual(mockGetResponseProducts.content);
      expect(component.partialParams.page).toBe(mockGetResponseProducts.page.number + 1);
      expect(component.partialParams.size).toBe(mockGetResponseProducts.page.size);
      expect(component.totalItems).toBe(mockGetResponseProducts.page.totalElements);
    });

    it('should use getFilteredProducts with the stored filters when onPageChange is invoked', () => {
      const brands: number[] = [1, 2];
      const sizes: number[] = [2, 4];
      const colors: number[] = [1];

      component['currentBrands'] = brands;
      component['currentSizes'] = sizes;
      component['currentColors'] = colors;

      fixture.detectChanges();
      component.onPageChange(5);

      expect(mockProductService.getFilteredProducts).toHaveBeenCalled();
    });
  });

  describe('pagination', () => {
    it('should make onPageChange update partialParams.page and call listProducts', () => {
      spyOn<any>(component, 'listProducts');
      fixture.detectChanges();

      component.onPageChange(4);

      expect(component.partialParams.page).toBe(4);
      expect(component['listProducts']).toHaveBeenCalled();
    });
  });

  describe('clearing filters', () => {
    it('should make resetToDefault clear currentBrands, currentSizes, currentColors', () => {
      const brands: number[] = [1, 2];
      const sizes: number[] = [2, 4];
      const colors: number[] = [1];

      component['currentBrands'] = brands;
      component['currentSizes'] = sizes;
      component['currentColors'] = colors;

      fixture.detectChanges();
      component.resetToDefault();

      expect(component['currentBrands']).toEqual([]);
      expect(component['currentSizes']).toEqual([]);
      expect(component['currentColors']).toEqual([]);
    });

    it('should make onPageChange call listProducts', () => {
      spyOn<any>(component, 'listProducts');

      fixture.detectChanges();
      component.resetToDefault();

      expect(component['listProducts']).toHaveBeenCalled();
    });

    it('should reset page to 1 on clear', () => {
      component.partialParams.page = 100;

      fixture.detectChanges();
      component.resetToDefault();

      expect(component.partialParams.page).toBe(1);
    });
  });

  describe('error handling', () => {
    it('should hide spinner if getProducts errors', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockProductService.getProducts.and.returnValue(throwError(() => error));
      spyOn(spinnerService, 'hide');

      fixture.detectChanges();
      component['listProducts']();

      expect(spinnerService.hide).toHaveBeenCalled();
      expect(mockProductService.getProducts).toHaveBeenCalled();
    });

    it('should hide spinner if getFilteredProducts errors', () => {
      const brands: number[] = [1, 2];
      const sizes: number[] = [2, 4];
      const colors: number[] = [1];

      component['currentBrands'] = brands;
      component['currentSizes'] = sizes;
      component['currentColors'] = colors;

      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockProductService.getFilteredProducts.and.returnValue(throwError(() => error));
      spyOn(spinnerService, 'hide');

      fixture.detectChanges();
      component['listProducts']();

      expect(mockProductService.getFilteredProducts).toHaveBeenCalled();
      expect(spinnerService.hide).toHaveBeenCalled();
    });
  });

  describe('template', () => {
    it('should show "Nothing matches" message when products is empty and isLoading is false', () => {
      component.isLoading = false;
      component.products = [];

      fixture.detectChanges();

      const msg = fixture.debugElement.query(By.css('.text-red-400'));
      expect(msg.nativeElement.textContent).toContain('NOTHING MATCHES YOUR SEARCH');
    });

    it('should hide "Nothing matches" message while isLoading is true', () => {
      component.isLoading = true;

      fixture.detectChanges();

      const msg = fixture.debugElement.query(By.css('.text-red-400'));
      expect(msg).toBeNull();
    });

    it('should hide pagination controls when products is empty', () => {
      component.products = [];

      fixture.detectChanges();

      const controls = fixture.debugElement.query(By.css('pagination-controls')).parent;
      expect(controls?.nativeElement.classList.contains('hidden')).toBeTrue();
    });
  });
});
