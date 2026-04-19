import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { BrandsList } from './brands-list';
import { AdminProductService } from '../../../services/admin/admin-product-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { NEVER, of, throwError } from 'rxjs';
import { BrandResponse } from '../../../model/response/brand-response';
import { HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';

describe('BrandsList', () => {
  let component: BrandsList;
  let fixture: ComponentFixture<BrandsList>;

  let mockAdminProductService: jasmine.SpyObj<AdminProductService>;
  let spinnerService: NgxSpinnerService;
  let toastr: ToastrService;

  let brandResponse: BrandResponse[];

  beforeEach(async () => {
    mockAdminProductService = jasmine.createSpyObj(['getBrands','deleteBrand']);
    mockAdminProductService.getBrands.and.returnValue(NEVER);
    mockAdminProductService.deleteBrand.and.returnValue(NEVER);


    await TestBed.configureTestingModule({
      imports: [BrandsList, ToastrModule.forRoot(), NoopAnimationsModule],
      providers: [
        NgxSpinnerService,
        provideRouter([]),
        {provide: AdminProductService, useValue: mockAdminProductService},
      ]
    })
    .compileComponents();

    brandResponse = [
      {id: 1, name: 'Adidas'}, 
      {id: 2, name: 'Nike'},
      {id: 3, name: 'Puma'}
    ];

    spinnerService = TestBed.inject(NgxSpinnerService);
    toastr = TestBed.inject(ToastrService);
    fixture = TestBed.createComponent(BrandsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should call spinnerService.show() and listBrands()', () => {
      spyOn(spinnerService, 'show');
      spyOn(component, 'listBrands');

      component.ngOnInit();

      expect(spinnerService.show).toHaveBeenCalled();
      expect(component.listBrands).toHaveBeenCalled();
    });

    it('should set isLoading to true on init', () => {
      expect(component.isLoading).toBeTrue();
    });
  });

  describe('listBrands() - on success', () => {
    beforeEach(() => {
      mockAdminProductService.getBrands.and.returnValue(of(brandResponse));
    });

    it('should call adminProductService.getBrands()', () => {
      component.listBrands();

      expect(mockAdminProductService.getBrands).toHaveBeenCalled();
    });

    it('should populate brands array with the response', () => {
      component.listBrands();

      expect(component.brands).toEqual(brandResponse);
    });

    it('should set isLoading to false on success', () => {
      component.listBrands();

      expect(component.isLoading).toBeFalse();
    });

    it('should hide the spinner on success', () => {
      spyOn(spinnerService, 'hide');

      component.listBrands();

      expect(spinnerService.hide).toHaveBeenCalled();
    });
  });

  describe('listBrands() - on error', () => {
    let error: HttpErrorResponse;

    beforeEach(() => {
      error = new HttpErrorResponse({
        status: 500,
        error: { message: 'Something went wrong' },
        statusText: 'Internal Server Error',
      });

      mockAdminProductService.getBrands.and.returnValue(throwError(() => error));
    });

    it('should keep brands array empty on error', () => {
      component.listBrands();

      expect(component.brands).toEqual([]);
    });

    it('should set isLoading to false on error', () => {
      component.listBrands();

      expect(component.isLoading).toBeFalse();
    });

    it('should hide the spinner on error', () => {
      spyOn(spinnerService, 'hide');

      component.listBrands();

      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should log the error to the console', () => {
      spyOn(console, 'error');

      component.listBrands();

      expect(console.error).toHaveBeenCalledWith(error);
    });
  });

  describe('delete() - on success', () => {
    const id: number = 1;

    it('should not do anything if the user cancels the confirm dialog', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.delete(id);

      expect(mockAdminProductService.deleteBrand).not.toHaveBeenCalled();
    });

    it('should call spinnerService.show() and set isLoading to true when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(spinnerService, 'show');

      component.delete(id);

      expect(spinnerService.show).toHaveBeenCalled();
      expect(component.isLoading).toBeTrue();
    });

    it('should call adminProductService.deleteBrand() with the correct id', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      component.delete(id);

      expect(mockAdminProductService.deleteBrand).toHaveBeenCalledWith(id);
    });

    it('should remove the correct brand only from the brands array on success', () => {
      const expectedResult = [
        { id: 2, name: 'Nike' },
        { id: 3, name: 'Puma' }
      ];
      component.brands = brandResponse;
      mockAdminProductService.deleteBrand.and.returnValue(of(void 0));
      spyOn(window, 'confirm').and.returnValue(true);

      component.delete(id);

      expect(component.brands).toEqual(expectedResult);
      const brands = brandResponse.filter(brand => brand.id !== id);
      expect(brands.every(brand => brand.id !== id)).toBeTrue();
    });

    it('should set isLoading to false and hide spinner', () => {
      component.brands = brandResponse;
      mockAdminProductService.deleteBrand.and.returnValue(of(void 0));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(spinnerService, 'hide');

      component.delete(id);

      expect(component.isLoading).toBeFalse();
      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should call toastr.success with the deleted brand\s name', () => {
      const deletedBrand = brandResponse.find(brand => brand.id === id);
      component.brands = brandResponse;
      mockAdminProductService.deleteBrand.and.returnValue(of(void 0));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(toastr, 'success');

      component.delete(id);

      expect(toastr.success).toHaveBeenCalledWith(
        deletedBrand!.name,
        'Brand deleted successfully',
        { progressBar: true },
      );
    });
  });

  describe('delete() - on error', () => {
    let id: number = 0;
    let error: HttpErrorResponse;

    beforeEach(() => {
      error = new HttpErrorResponse({
        status: 500,
        error: { message: 'Something went wrong' },
        statusText: 'Internal Server Error',
      });

      mockAdminProductService.deleteBrand.and.returnValue(throwError(() => error));
      spyOn(window, 'confirm').and.returnValue(true);
    });

    it('should not modify the brands array', () => {
      component.brands = brandResponse;

      component.delete(id);

      expect(component.brands).toEqual(brandResponse);
    });

    it('should set isLoading to false and hide the spinner', () => {
      spyOn(spinnerService, 'hide');

      component.delete(id);

      expect(component.isLoading).toBeFalse();
      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should call toastr.error with the error message from the response', () => {
      spyOn(toastr, 'error');

      component.delete(id);

      expect(toastr.error).toHaveBeenCalledWith(error.error.message, 
        'Error:', 
        { progressBar: true});
    });

    it('should log an error to console.error', () => {
      spyOn(console, 'error');

      component.delete(id);

      expect(console.error).toHaveBeenCalledWith(error);
    });
  });

  describe('template', () => {
    it('should render one row per brand', () => {
      component.brands = brandResponse;

      fixture.detectChanges();
 
      const tableRows = fixture.debugElement.queryAll(By.css('tbody tr'));
      expect(tableRows.length).toBe(brandResponse.length);
    });

    it('should display the correct index and brand name for each row', () => {
      component.brands = brandResponse;
 
      fixture.detectChanges();

      const tableRows = fixture.debugElement.queryAll(By.css('tbody tr'));
      tableRows.forEach((tr, index) => {
        const td_1 = tr.nativeElement.querySelectorAll('td')[0];
        const td_2 = tr.nativeElement.querySelectorAll('td')[1];

        expect(td_1.textContent).toBe(index.toString());
        expect(td_2.textContent).toBe(brandResponse[index].name);
      });
    });

    it('should call delete() with the correct brand id for each row', () => {
      component.brands = brandResponse;
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(component, 'delete');

      fixture.detectChanges();

      const tableRows = fixture.debugElement.queryAll(By.css('tbody tr'));
      tableRows.forEach((tr, index) => {
        const button = tr.nativeElement.querySelector('button');
        button.click();
        expect(component.delete).toHaveBeenCalledWith(brandResponse[index].id);
      });
    });

    it('should show "LIST IS EMPTY" message when brands array is empty and isLoading is false', () => {
      component.isLoading = false;

      fixture.detectChanges();

      const txt = fixture.debugElement.query(By.css('p.text-red-400.text-center'));
      expect(txt.nativeElement.textContent).toBe('LIST IS EMPTY.');
    });

    it('should not show "LIST IS EMPTY" message when isLoading is true', () => {
      const txt = fixture.debugElement.query(By.css('p.text-red-400.text-center'));
      expect(txt).toBeNull();
    });

    it('should not show "LIST IS EMPTY" message when brands array has items', () => {
      component.brands = brandResponse;

      fixture.detectChanges();

      const txt = fixture.debugElement.query(By.css('p.text-red-400.text-center'));
      expect(txt).toBeNull();
    });
  });


});
