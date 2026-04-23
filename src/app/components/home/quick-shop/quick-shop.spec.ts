import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { QuickShop } from './quick-shop';
import { GetResponseProducts, ProductService } from '../../../services/product-service';
import { provideRouter } from '@angular/router';
import { NEVER, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';

describe('QuickShop', () => {
  let component: QuickShop;
  let fixture: ComponentFixture<QuickShop>;

  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockGetResponseProducts: GetResponseProducts;

  beforeEach(async () => {
    mockProductService = jasmine.createSpyObj(['getProducts']);

    await TestBed.configureTestingModule({
      imports: [QuickShop],
      providers: [
        provideRouter([]),
        {provide: ProductService, useValue: mockProductService}
      ]
    })
    .compileComponents();

    mockGetResponseProducts = {
      content: [
        {
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
        },
      ],
      page: {
        size: 10,
        totalElements: 40,
        totalPages: 4,
        number: 1,
      },
    };

    fixture = TestBed.createComponent(QuickShop);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should make ngOnInit call listProducts with the correct default params', () => {
      let params = {
        page: 1,
        size: 10,
        sort: '',
        direction: '',
      };
      spyOn<any>(component, 'listProducts');

      fixture.detectChanges();

      expect(component['listProducts']).toHaveBeenCalledWith(params);
    });

    it('should have an empty products array', () => {
      expect(component.products).toEqual([]);
    });
  });

  describe('listProducts()', () => {
    it('should populate from response.content on success', () => {
      mockProductService.getProducts.and.returnValue(of(mockGetResponseProducts));

      component['listProducts'](component['partialParams']);

      expect(component.products).toEqual(mockGetResponseProducts.content);
    });

    it('should update partialParams.page to response.number + 1', () => {
      mockProductService.getProducts.and.returnValue(of(mockGetResponseProducts));

      component['listProducts'](component['partialParams']);

      expect(component['partialParams'].page).toBe(mockGetResponseProducts.page.number + 1);
    });

    it('should update partialParams.size from response.size', () => {
      mockProductService.getProducts.and.returnValue(of(mockGetResponseProducts));

      component['listProducts'](component['partialParams']);

      expect(component['partialParams'].size).toBe(mockGetResponseProducts.page.size);
    });

    it('should call cdr.detectChanges() after a successful response', () => {
      mockProductService.getProducts.and.returnValue(of(mockGetResponseProducts));
      spyOn(component['cdr'], 'detectChanges');

      component['listProducts'](component['partialParams']);

      expect(component['cdr'].detectChanges).toHaveBeenCalled();
    });

    it('should call console.error with the HttpErrorResponse on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockProductService.getProducts.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component['listProducts'](component['partialParams']);

      expect(console.error).toHaveBeenCalledWith(error);
    });

    it('should not change products array on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockProductService.getProducts.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component['listProducts'](component['partialParams']);

      expect(component.products).toEqual([]);
    });
  });

  describe('template', () => {
    it('should not render anything when products array is empty', () => {
      mockProductService.getProducts.and.returnValue(NEVER);

      fixture.detectChanges();

      const elems = fixture.debugElement.queryAll(
        By.css('div.shadow-sm.w-56.rounded-sm.overflow-hidden'),
      );
      expect(elems).toEqual([]);
      expect(elems.length).toBe(0);
    });

    it('should render cards for each product when the array is populated', () => {
      mockProductService.getProducts.and.returnValue(of(mockGetResponseProducts));
      component['listProducts'](component['partialParams']);

      fixture.detectChanges();
  
      const elems = fixture.debugElement.queryAll(
        By.css('div.shadow-sm.w-56.rounded-sm.overflow-hidden'),
      );
      expect(elems.length).toBe(1);
    });

    it('should make the "View More" link point to /products', () => {
      const btn = fixture.debugElement.query(By.css('.view-more'));
      expect(btn.attributes['routerLink']).toBe('/products');
    });
  });

});
