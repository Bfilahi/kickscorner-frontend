import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { ColorsList } from './colors-list';
import { AdminProductService } from '../../../services/admin/admin-product-service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerService } from 'ngx-spinner';
import { provideRouter } from '@angular/router';
import { NEVER, of, throwError } from 'rxjs';
import { ColorResponse } from '../../../model/response/color-response';
import { HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';

describe('ColorsList', () => {
  let component: ColorsList;
  let fixture: ComponentFixture<ColorsList>;

  let mockAdminProductService: jasmine.SpyObj<AdminProductService>;
  let spinnerService: NgxSpinnerService;
  let toastr: ToastrService;

  let colorResponse: ColorResponse[];

  beforeEach(async () => {
    mockAdminProductService = jasmine.createSpyObj(['getColors','deleteColor']);
    mockAdminProductService.getColors.and.returnValue(NEVER);
    mockAdminProductService.deleteColor.and.returnValue(NEVER);

    await TestBed.configureTestingModule({
      imports: [ColorsList, ToastrModule.forRoot(), NoopAnimationsModule],
      providers: [
        NgxSpinnerService,
        provideRouter([]),
        {provide: AdminProductService, useValue: mockAdminProductService}
      ]
    })
    .compileComponents();

    colorResponse = [
      {id: 1, name: 'red'},
      {id: 2, name: 'blue'},
      {id: 3, name: 'green'}
    ];

    spinnerService = TestBed.inject(NgxSpinnerService);
    toastr = TestBed.inject(ToastrService);
    fixture = TestBed.createComponent(ColorsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should call spinnerService.show() and listColors()', () => {
      spyOn(spinnerService, 'show');
      spyOn(component, 'listColors');

      component.ngOnInit();

      expect(spinnerService.show).toHaveBeenCalled();
      expect(component.listColors).toHaveBeenCalled();
    });

    it('should set isLoading to true on init', () => {
      expect(component.isLoading).toBeTrue();
    });
  });

  describe('listColors() - on success', () => {
    beforeEach(() => {
      mockAdminProductService.getColors.and.returnValue(of(colorResponse));
    });

    it('should call adminProductService.getColors()', () => {
      component.listColors();

      expect(mockAdminProductService.getColors).toHaveBeenCalled();
    });

    it('should populate colors array with the response', () => {
      component.listColors();

      expect(component.colors).toEqual(colorResponse);
    });

    it('should set isLoading to false on success', () => {
      component.listColors();

      expect(component.isLoading).toBeFalse();
    });

    it('should hide the spinner on success', () => {
      spyOn(spinnerService, 'hide');

      component.listColors();

      expect(spinnerService.hide).toHaveBeenCalled();
    });
  });

  describe('listColors() - on error', () => {
    let error: HttpErrorResponse;

    beforeEach(() => {
      error = new HttpErrorResponse({
        status: 500,
        error: { message: 'Something went wrong' },
        statusText: 'Internal Server Error',
      });

      mockAdminProductService.getColors.and.returnValue(throwError(() => error));
    });

    it('should keep colors array empty on error', () => {
      component.listColors();

      expect(component.colors).toEqual([]);
    });

    it('should set isLoading to false on error', () => {
      component.listColors();

      expect(component.isLoading).toBeFalse();
    });

    it('should hide the spinner on error', () => {
      spyOn(spinnerService, 'hide');

      component.listColors();

      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should log the error to the console', () => {
      spyOn(console, 'error');

      component.listColors();

      expect(console.error).toHaveBeenCalledWith(error);
    });
  });

  describe('delete() - on success', () => {
    const id: number = 1;

    it('should not do anything if the user cancels the confirm dialog', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.delete(id);

      expect(mockAdminProductService.deleteColor).not.toHaveBeenCalled();
    });

    it('should call spinnerService.show() and set isLoading to true when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(spinnerService, 'show');

      component.delete(id);

      expect(spinnerService.show).toHaveBeenCalled();
      expect(component.isLoading).toBeTrue();
    });

    it('should call adminProductService.deleteColor() with the correct id', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      component.delete(id);

      expect(mockAdminProductService.deleteColor).toHaveBeenCalledWith(id);
    });

    it('should remove the correct color only from the colors array on success', () => {
      const expectedResult = [
        { id: 2, name: 'blue' },
        { id: 3, name: 'green' }
      ];
      component.colors = colorResponse;
      mockAdminProductService.deleteColor.and.returnValue(of(void 0));
      spyOn(window, 'confirm').and.returnValue(true);

      component.delete(id);

      expect(component.colors).toEqual(expectedResult);
      const colors = colorResponse.filter(color => color.id !== id);
      expect(colors.every(color => color.id !== id)).toBeTrue();
    });

    it('should set isLoading to false and hide spinner', () => {
      component.colors = colorResponse;
      mockAdminProductService.deleteColor.and.returnValue(of(void 0));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(spinnerService, 'hide');

      component.delete(id);

      expect(component.isLoading).toBeFalse();
      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should call toastr.success with the deleted color\'s name', () => {
      const deletedColor = colorResponse.find(color => color.id === id);
      component.colors = colorResponse;
      mockAdminProductService.deleteColor.and.returnValue(of(void 0));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(toastr, 'success');

      component.delete(id);

      expect(toastr.success).toHaveBeenCalledWith(
        deletedColor!.name,
        'Color deleted successfully',
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

      mockAdminProductService.deleteColor.and.returnValue(throwError(() => error));
      spyOn(window, 'confirm').and.returnValue(true);
    });

    it('should not modify the colors array', () => {
      component.colors = colorResponse;

      component.delete(id);

      expect(component.colors).toEqual(colorResponse);
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
    it('should render one row per color', () => {
      component.colors = colorResponse;

      fixture.detectChanges();
  
      const tableRows = fixture.debugElement.queryAll(By.css('tbody tr'));
      expect(tableRows.length).toBe(colorResponse.length);
    });

    it('should display the correct index and color name for each row', () => {
      component.colors = colorResponse;
  
      fixture.detectChanges();

      const tableRows = fixture.debugElement.queryAll(By.css('tbody tr'));
      tableRows.forEach((tr, index) => {
        const td_1 = tr.nativeElement.querySelectorAll('td')[0];
        const td_2 = tr.nativeElement.querySelectorAll('td')[1];

        expect(td_1.textContent).toBe(index.toString());
        expect(td_2.textContent).toBe(colorResponse[index].name);
      });
    });

    it('should call delete() with the correct color id for each row', () => {
      component.colors = colorResponse;
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(component, 'delete');

      fixture.detectChanges();

      const tableRows = fixture.debugElement.queryAll(By.css('tbody tr'));
      tableRows.forEach((tr, index) => {
        const button = tr.nativeElement.querySelector('button');
        button.click();
        expect(component.delete).toHaveBeenCalledWith(colorResponse[index].id);
      });
    });

    it('should show "LIST IS EMPTY" message when colors array is empty and isLoading is false', () => {
      component.isLoading = false;

      fixture.detectChanges();

      const txt = fixture.debugElement.query(By.css('p.text-red-400.text-center'));
      expect(txt.nativeElement.textContent).toBe('LIST IS EMPTY.');
    });

    it('should not show "LIST IS EMPTY" message when isLoading is true', () => {
      const txt = fixture.debugElement.query(By.css('p.text-red-400.text-center'));
      expect(txt).toBeNull();
    });

    it('should not show "LIST IS EMPTY" message when colors array has items', () => {
      component.colors = colorResponse;

      fixture.detectChanges();

      const txt = fixture.debugElement.query(By.css('p.text-red-400.text-center'));
      expect(txt).toBeNull();
    });
  });
});
