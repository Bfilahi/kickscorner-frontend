import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { SizesList } from './sizes-list';
import { AdminProductService } from '../../../services/admin/admin-product-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { SizeResponse } from '../../../model/response/size-response';
import { NEVER, of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';

describe('SizesList', () => {
  let component: SizesList;
  let fixture: ComponentFixture<SizesList>;

    let mockAdminProductService: jasmine.SpyObj<AdminProductService>;
    let spinnerService: NgxSpinnerService;
    let toastr: ToastrService;
  
    let sizeResponse: SizeResponse[];

  beforeEach(async () => {
    mockAdminProductService = jasmine.createSpyObj(['getSizes', 'deleteSize']);
    mockAdminProductService.getSizes.and.returnValue(NEVER);
    mockAdminProductService.deleteSize.and.returnValue(NEVER);
    
    await TestBed.configureTestingModule({
      imports: [SizesList, ToastrModule.forRoot(), NoopAnimationsModule],
      providers: [
        NgxSpinnerService,
        provideRouter([]),
        {provide: AdminProductService, useValue: mockAdminProductService},
      ]
    })
    .compileComponents();

    sizeResponse = [
      {id: 1, name: 'S'}, 
      {id: 2, name: 'M'},
      {id: 3, name: 'L'}
    ];

    spinnerService = TestBed.inject(NgxSpinnerService);
    toastr = TestBed.inject(ToastrService);
    fixture = TestBed.createComponent(SizesList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should call spinnerService.show() and listSizes()', () => {
      spyOn(spinnerService, 'show');
      spyOn(component, 'listSizes');

      component.ngOnInit();

      expect(spinnerService.show).toHaveBeenCalled();
      expect(component.listSizes).toHaveBeenCalled();
    });

    it('should set isLoading to true on init', () => {
      expect(component.isLoading).toBeTrue();
    });
  });

  describe('listSizes() - on success', () => {
    beforeEach(() => {
      mockAdminProductService.getSizes.and.returnValue(of(sizeResponse));
    });

    it('should call adminProductService.getSizes()', () => {
      component.listSizes();

      expect(mockAdminProductService.getSizes).toHaveBeenCalled();
    });

    it('should populate sizes array with the response', () => {
      component.listSizes();

      expect(component.sizes).toEqual(sizeResponse);
    });

    it('should set isLoading to false on success', () => {
      component.listSizes();

      expect(component.isLoading).toBeFalse();
    });

    it('should hide the spinner on success', () => {
      spyOn(spinnerService, 'hide');

      component.listSizes();

      expect(spinnerService.hide).toHaveBeenCalled();
    });
  });

  describe('listSizes() - on error', () => {
    let error: HttpErrorResponse;

    beforeEach(() => {
      error = new HttpErrorResponse({
        status: 500,
        error: { message: 'Something went wrong' },
        statusText: 'Internal Server Error',
      });

      mockAdminProductService.getSizes.and.returnValue(throwError(() => error));
    });

    it('should keep sizes array empty on error', () => {
      component.listSizes();

      expect(component.sizes).toEqual([]);
    });

    it('should set isLoading to false on error', () => {
      component.listSizes();

      expect(component.isLoading).toBeFalse();
    });

    it('should hide the spinner on error', () => {
      spyOn(spinnerService, 'hide');

      component.listSizes();

      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should log the error to the console', () => {
      spyOn(console, 'error');

      component.listSizes();

      expect(console.error).toHaveBeenCalledWith(error);
    });
  });

  describe('delete() - on success', () => {
    const id: number = 1;

    it('should not do anything if the user cancels the confirm dialog', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.delete(id);

      expect(mockAdminProductService.deleteSize).not.toHaveBeenCalled();
    });

    it('should call spinnerService.show() and set isLoading to true when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(spinnerService, 'show');

      component.delete(id);

      expect(spinnerService.show).toHaveBeenCalled();
      expect(component.isLoading).toBeTrue();
    });

    it('should call adminProductService.deleteSize() with the correct id', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      component.delete(id);

      expect(mockAdminProductService.deleteSize).toHaveBeenCalledWith(id);
    });

    it('should remove the correct size only from the sizes array on success', () => {
      const expectedResult = [
        { id: 2, name: 'M' },
        { id: 3, name: 'L' },
      ];
      component.sizes = sizeResponse;
      mockAdminProductService.deleteSize.and.returnValue(of(void 0));
      spyOn(window, 'confirm').and.returnValue(true);

      component.delete(id);

      expect(component.sizes).toEqual(expectedResult);
      const sizes = sizeResponse.filter((size) => size.id !== id);
      expect(sizes.every((size) => size.id !== id)).toBeTrue();
    });

    it('should set isLoading to false and hide spinner', () => {
      component.sizes = sizeResponse;
      mockAdminProductService.deleteSize.and.returnValue(of(void 0));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(spinnerService, 'hide');

      component.delete(id);

      expect(component.isLoading).toBeFalse();
      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it("should call toastr.success with the deleted size's name", () => {
      const deletedSize = sizeResponse.find((size) => size.id === id);
      component.sizes = sizeResponse;
      mockAdminProductService.deleteSize.and.returnValue(of(void 0));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(toastr, 'success');

      component.delete(id);

      expect(toastr.success).toHaveBeenCalledWith(
        deletedSize!.name,
        'Size deleted successfully',
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

      mockAdminProductService.deleteSize.and.returnValue(
        throwError(() => error),
      );
      spyOn(window, 'confirm').and.returnValue(true);
    });

    it('should not modify the sizes array', () => {
      component.sizes = sizeResponse;

      component.delete(id);

      expect(component.sizes).toEqual(sizeResponse);
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

      expect(toastr.error).toHaveBeenCalledWith(error.error.message, 'Error:', {
        progressBar: true,
      });
    });

    it('should log an error to console.error', () => {
      spyOn(console, 'error');

      component.delete(id);

      expect(console.error).toHaveBeenCalledWith(error);
    });
  });

  describe('template', () => {
    it('should render one row per size', () => {
      component.sizes = sizeResponse;

      fixture.detectChanges();

      const tableRows = fixture.debugElement.queryAll(By.css('tbody tr'));
      expect(tableRows.length).toBe(sizeResponse.length);
    });

    it('should display the correct index and size name for each row', () => {
      component.sizes = sizeResponse;

      fixture.detectChanges();

      const tableRows = fixture.debugElement.queryAll(By.css('tbody tr'));
      tableRows.forEach((tr, index) => {
        const td_1 = tr.nativeElement.querySelectorAll('td')[0];
        const td_2 = tr.nativeElement.querySelectorAll('td')[1];

        expect(td_1.textContent).toBe(index.toString());
        expect(td_2.textContent).toBe(sizeResponse[index].name);
      });
    });

    it('should call delete() with the correct size id for each row', () => {
      component.sizes = sizeResponse;
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(component, 'delete');

      fixture.detectChanges();

      const tableRows = fixture.debugElement.queryAll(By.css('tbody tr'));
      tableRows.forEach((tr, index) => {
        const button = tr.nativeElement.querySelector('button');
        button.click();
        expect(component.delete).toHaveBeenCalledWith(sizeResponse[index].id);
      });
    });
  });
});
