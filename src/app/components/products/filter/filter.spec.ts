import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { Filter } from './filter';
import { AdminProductService } from '../../../services/admin/admin-product-service';
import { GetResponseProducts, ProductService } from '../../../services/product-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { BrandResponse } from '../../../model/response/brand-response';
import { SizeResponse } from '../../../model/response/size-response';
import { ColorResponse } from '../../../model/response/color-response';
import { HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';

describe('Filter', () => {
  let component: Filter;
  let fixture: ComponentFixture<Filter>;

  let mockAdminProductService: jasmine.SpyObj<AdminProductService>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let spinnerService: NgxSpinnerService

  let mockGetResponseProducts: GetResponseProducts; 

  beforeEach(async () => {
    mockAdminProductService = jasmine.createSpyObj([
      'getBrands',
      'getSizes',
      'getColors',
    ]);
    mockProductService = jasmine.createSpyObj(['getFilteredProducts']);

    mockAdminProductService.getBrands.and.returnValue(NEVER);
    mockAdminProductService.getSizes.and.returnValue(NEVER);
    mockAdminProductService.getColors.and.returnValue(NEVER);

    await TestBed.configureTestingModule({
      imports: [Filter],
      providers: [
        NgxSpinnerService,
        { provide: AdminProductService, useValue: mockAdminProductService },
        { provide: ProductService, useValue: mockProductService }
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

    spinnerService = TestBed.inject(NgxSpinnerService);
    fixture = TestBed.createComponent(Filter);
    component = fixture.componentInstance;

    component.sortingEvent = new Observable(subscriber => {
      subscriber.next('mock-value')
    });
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should call listBrands, listSizes, listColors on ngOnInit', () => {
      spyOn<any>(component, 'listBrands');
      spyOn<any>(component, 'listSizes');
      spyOn<any>(component, 'listColors');

      fixture.detectChanges();

      expect(component['listBrands']).toHaveBeenCalled();
      expect(component['listSizes']).toHaveBeenCalled();
      expect(component['listColors']).toHaveBeenCalled();
    });

    it('should assign the results to brands, sizes, colors', () => {
      const brands: BrandResponse[] = [{id: 1, name: 'Nike'}];
      const sizes: SizeResponse[] = [{id: 1, name: 'S'}, {id: 2, name: 'M'}];
      const colors: ColorResponse[] = [{id: 1, name: 'red'}];
      mockAdminProductService.getBrands.and.returnValue(of(brands));
      mockAdminProductService.getSizes.and.returnValue(of(sizes));
      mockAdminProductService.getColors.and.returnValue(of(colors));

      fixture.detectChanges();

      expect(component.brands).toEqual(brands);
      expect(component.sizes).toEqual(sizes);
      expect(component.colors).toEqual(colors);
    });

    it('should set sortingEvent subscription on init', () => {
      component.sortingEvent = new Observable(subscriber => {
        subscriber.next('mock-value')
      });
      fixture.detectChanges();

      component.sortingEvent.subscribe(res => expect(res).toBe('mock-value'));
    });
  });

  describe('sortingEvent subscription', () => {
    it('should call showResults() and show the spinner when a non-empty sorting value is emitted', () => {
      component.sortingEvent = new Observable(subscriber => {
        subscriber.next('mock-value');
      });
      spyOn(component, 'showResults');
      spyOn(spinnerService, 'show');

      fixture.detectChanges();

      expect(component.showResults).toHaveBeenCalled();
      expect(spinnerService.show).toHaveBeenCalled();
    });

    it('should not call showResults() and hide the spinner when an empty string is emitted', () => {
      component.sortingEvent = new Observable(subscriber => {
        subscriber.next('');
      });
      spyOn(component, 'showResults');
      spyOn(spinnerService, 'hide');

      fixture.detectChanges();

      expect(component.showResults).not.toHaveBeenCalled();
      expect(spinnerService.hide).toHaveBeenCalled();
    });
  });

  describe('showResults()', () => {
    it('should set partialParams.sort and partialParams.direction correctly', () => {
      mockProductService.getFilteredProducts.and.returnValue(NEVER);
      component.sortingEvent = new Observable((subscriber) => {
        subscriber.next('oldest');
      });

      fixture.detectChanges();
      component.showResults();

      expect(component.partialParams.sort).toBe('createdAt');
      expect(component.partialParams.direction).toBe('asc');
    });

    it('should reset partialParams.page to 1 and size to 10 before calling the service', () => {
      mockProductService.getFilteredProducts.and.returnValue(NEVER);
      component.sortingEvent = new Observable((subscriber) => {
        subscriber.next('oldest');
      });

      fixture.detectChanges();
      component.showResults();

      expect(component.partialParams.page).toBe(1);
      expect(component.partialParams.size).toBe(10);
    });

    it('should make getProducts emit the response along with the selected brands, sizes, and colors on success', () => {
      component.sortingEvent = new Observable((subscriber) => {
        subscriber.next('oldest');
      });
      mockProductService.getFilteredProducts.and.returnValue(of(mockGetResponseProducts));
      spyOn(component.getProducts, 'emit');
      
      fixture.detectChanges();
      component.showResults();

      expect(component.getProducts.emit).toHaveBeenCalledWith({
        response: mockGetResponseProducts, brands: [], sizes: [], colors: []});
    });

    it('should hide spinner on success', () => {
      component.sortingEvent = new Observable((subscriber) => {
        subscriber.next('oldest');
      });
      mockProductService.getFilteredProducts.and.returnValue(of(mockGetResponseProducts));
      spyOn(spinnerService, 'hide');
      
      fixture.detectChanges();
      component.showResults();

      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should hide spinner on error', () => {
      component.sortingEvent = new Observable((subscriber) => {
        subscriber.next('oldest');
      });
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockProductService.getFilteredProducts.and.returnValue(throwError(() => error));
      spyOn(spinnerService, 'hide');
      
      fixture.detectChanges();
      component.showResults();

      expect(spinnerService.hide).toHaveBeenCalled();
    });
  });

  describe('onItemChange()', () => {
    it('should push the id into the array when the checkbox is checked', () => {
      const event = {target: {checked: true}} as unknown as Event;
      const items: number[] = [];
      const id: number = 4;

      fixture.detectChanges();
      component.onItemChange(event, id, items);

      expect(items).toEqual([4]);
    });

    it('should remove the id from the array when the checkbox is unchecked', () => {
      const event = { target: { checked: false } } as unknown as Event;
      const items: number[] = [2, 4, 5];
      const id: number = 4;

      fixture.detectChanges();
      component.onItemChange(event, id, items);

      expect(items).toEqual([2, 5]);
    });

    it('should not do anything if the unchecked id isn\'t in the array', () => {
      const event = { target: { checked: false } } as unknown as Event;
      const items: number[] = [2, 4, 5];
      const id: number = 3;

      fixture.detectChanges();
      component.onItemChange(event, id, items);

      expect(items).toEqual([2, 4, 5]);
    });
  });

  describe('clearFilters()', () => {
    it('should reset selectedBrands, selectedSizes, selectedColors to empty arrays', () => {
      component.selectedBrands = [1, 3];
      component.selectedSizes = [7, 2, 8];
      component.selectedColors = [9];

      fixture.detectChanges();
      component.clearFilters();

      expect(component.selectedBrands).toEqual([]);
      expect(component.selectedSizes).toEqual([]);
      expect(component.selectedColors).toEqual([]);
    });

    it('should make onClearFilters event emit', () => {
      spyOn(component.onClearFilters, 'emit');

      fixture.detectChanges();
      component.clearFilters();

      expect(component.onClearFilters.emit).toHaveBeenCalled();
    });
  });

  describe('template', () => {
    it('shoud hide <aside> when showFilter is false', () => {
      component.showFilter = false;

      fixture.detectChanges();

      const asideElem = fixture.debugElement.query(By.css('aside'));
      expect(asideElem.nativeElement.classList.contains('hidden')).toBeTrue();
    });

    it('shoud show <aside> when showFilter is false', () => {
      component.showFilter = true;

      fixture.detectChanges();

      const asideElem = fixture.debugElement.query(By.css('aside'));
      expect(asideElem.nativeElement.classList.contains('hidden')).toBeFalse();
    });

    it('should emit showFilterChange with false when the close button is clicked', () => {
      spyOn(component.showFilterChange, 'emit');

      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('aside > div button'));
      btn.triggerEventHandler('click', null);
      expect(component.showFilterChange.emit).toHaveBeenCalledWith(false);
    });

    it('should render brand/size/color checkboxes for each item in their respective arrays', () => {
      component.brands = [{id: 1, name: 'Nike'}, {id: 2, name: 'Adidas'}];
      component.sizes = [{id: 1, name: 'S'}, {id: 2, name: 'M'}, {id: 3, name: 'L'}];
      component.colors = [{id: 1, name: 'red'}];

      fixture.detectChanges();

      const brandElems = fixture.debugElement.queryAll(By.css('.brands div div'));
      const sizeElems = fixture.debugElement.queryAll(By.css('.sizes div div'));
      const colorElems = fixture.debugElement.queryAll(By.css('.colors div div'));
      expect(brandElems.length).toBe(2);
      expect(sizeElems.length).toBe(3);
      expect(colorElems.length).toBe(1);
    });

    it('should call showResults() when the VIEW RESULTS button is clicked', () => {
      spyOn(component, 'showResults');

      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('.view-btn'));
      btn.triggerEventHandler('click', null);
      expect(component.showResults).toHaveBeenCalled();
    });

    it('should call clearFilters() when the CLEAR FILTER button is clicked', () => {
      spyOn(component, 'clearFilters');

      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('.clear-btn'));
      btn.triggerEventHandler('click', null);
      expect(component.clearFilters).toHaveBeenCalled();
    });
  });
});
