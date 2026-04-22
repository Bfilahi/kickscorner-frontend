import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { ProductForm } from './product-form';
import { AdminProductService } from '../../../services/admin/admin-product-service';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { FormControl, FormGroup } from '@angular/forms';
import { ProductResponse } from '../../../model/response/product-response';
import { SimpleChange, SimpleChanges } from '@angular/core';


describe('ProductForm', () => {
  let component: ProductForm;
  let fixture: ComponentFixture<ProductForm>;

  let mockAdminProductService: jasmine.SpyObj<AdminProductService>;
  let mockProductResponse: ProductResponse;

  beforeEach(async () => {
    mockAdminProductService = jasmine.createSpyObj([
      'getBrands',
      'getColors',
      'getSizes',
    ]);

    await TestBed.configureTestingModule({
      imports: [ProductForm],
      providers: [
        provideRouter([]),
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

    fixture = TestBed.createComponent(ProductForm);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('validation', () => {
    it('should not show error when name is valid', () => {
      const nameControl = component.productForm.get('name');

      nameControl?.patchValue('some name');
      nameControl?.markAsTouched();
      nameControl?.markAsDirty();

      fixture.detectChanges();

      expect(nameControl?.valid).toBeTrue();
      const nameContainer = fixture.debugElement.query(By.css('[formControlName="name"]')).parent;
      const errorTxt = nameContainer?.query(By.css('p.text-red-400'));
      expect(errorTxt).toBeNull();
    });

    it('should show error when name is empty or whitespace', () => {
      const nameControl = component.productForm.get('name');

      nameControl?.patchValue('  ');
      nameControl?.markAsTouched();
      nameControl?.markAsDirty();

      fixture.detectChanges();

      expect(nameControl?.valid).toBeFalse();
      const nameContainer = fixture.debugElement.query(
        By.css('[formControlName="name"]'),
      ).parent;
      const errorTxt = nameContainer?.query(By.css('p.text-red-400'));
      expect(errorTxt).not.toBeNull();
    });

    it('should not show error when description is valid', () => {
      const descriptionControl = component.productForm.get('description');

      descriptionControl?.patchValue('some description');
      descriptionControl?.markAsTouched();
      descriptionControl?.markAsDirty();

      fixture.detectChanges();

      expect(descriptionControl?.valid).toBeTrue();
      const descriptionContainer = fixture.debugElement.query(By.css('[formControlName="description"]')).parent;
      const errorTxt = descriptionContainer?.query(By.css('p.text-red-400'));
      expect(errorTxt).toBeNull();
    });

    it('should show error when description is empty or whitespace', () => {
      const descriptionControl = component.productForm.get('description');

      descriptionControl?.patchValue('  ');
      descriptionControl?.markAsTouched();
      descriptionControl?.markAsDirty();

      fixture.detectChanges();

      expect(descriptionControl?.valid).toBeFalse();
      const descriptionContainer = fixture.debugElement.query(
        By.css('[formControlName="description"]'),
      ).parent;
      const errorTxt = descriptionContainer?.query(By.css('p.text-red-400'));
      expect(errorTxt).not.toBeNull();
    });

    it('should not show error when price is valid', () => {
      const priceControl = component.productForm.get('price');

      priceControl?.patchValue(20);
      priceControl?.markAsTouched();
      priceControl?.markAsDirty();

      fixture.detectChanges();

      expect(priceControl?.valid).toBeTrue();
      const priceContainer = fixture.debugElement.query(By.css('[formControlName="price"]')).parent;
      const errorTxt = priceContainer?.query(By.css('p.text-red-400'));
      expect(errorTxt).toBeNull();
    });

    it('should show error when price is less than 1', () => {
      const priceControl = component.productForm.get('price');

      priceControl?.patchValue(-1);
      priceControl?.markAsTouched();
      priceControl?.markAsDirty();

      fixture.detectChanges();

      expect(priceControl?.valid).toBeFalse();
      const priceContainer = fixture.debugElement.query(
        By.css('[formControlName="price"]'),
      ).parent;
      const errorTxt = priceContainer?.query(By.css('p.text-red-400'));
      expect(errorTxt).not.toBeNull();
    });

    it('should not show error when unitsInStock is valid', () => {
      const unitsInStockControl = component.productForm.get('unitsInStock');

      unitsInStockControl?.patchValue(20);
      unitsInStockControl?.markAsTouched();
      unitsInStockControl?.markAsDirty();

      fixture.detectChanges();

      expect(unitsInStockControl?.valid).toBeTrue();
      const unitsInStockContainer = fixture.debugElement.query(By.css('[formControlName="unitsInStock"]')).parent;
      const errorTxt = unitsInStockContainer?.query(By.css('p.text-red-400'));
      expect(errorTxt).toBeNull();
    });

    it('should show error when unitsInStock is less than 1', () => {
      const unitsInStockControl = component.productForm.get('unitsInStock');

      unitsInStockControl?.patchValue(-1);
      unitsInStockControl?.markAsTouched();
      unitsInStockControl?.markAsDirty();

      fixture.detectChanges();

      expect(unitsInStockControl?.valid).toBeFalse();
      const unitsInStockContainer = fixture.debugElement.query(
        By.css('[formControlName="unitsInStock"]'),
      ).parent;
      const errorTxt = unitsInStockContainer?.query(By.css('p.text-red-400'));
      expect(errorTxt).not.toBeNull();
    });

    it('should not show error when brand is selected', () => {
      component.brands = [{ id: 1, name: 'Nike' }];
      component.dataLoaded = true;

      fixture.detectChanges();

      const brandControl = component.productForm.get('brand');
      brandControl?.patchValue(1);
      brandControl?.markAsTouched();
      brandControl?.markAsDirty();

      expect(brandControl?.valid).toBeTrue();
      const brandContainer = fixture.debugElement.query(
        By.css('[formControlName="brand"]'),
      ).parent;
      const errorTxt = brandContainer?.queryAll(By.css('p.text-red-400'));
      expect(errorTxt).toEqual([]);
    });

    it('should show error when brand is not selected', () => {
      component.brands = [{ id: 1, name: 'Nike' }];
      component.dataLoaded = true;

      fixture.detectChanges();

      const brandControl = component.productForm.get('brand');
      brandControl?.markAsTouched();
      brandControl?.markAsDirty();


      expect(brandControl?.valid).toBeFalse();
      const brandContainer = fixture.debugElement.query(
        By.css('[formControlName="brand"]'),
      ).parent;
      const errorTxt = brandContainer?.queryAll(By.css('p.text-red-400'));
      expect(errorTxt).toBeTruthy();
    });

    it('should not show error when at least one color is selected', () => {
      component.colors = [{ id: 1, name: 'red' }, { id: 2, name: 'blue' }];
      component.dataLoaded = true;

      const colorsArray = component.colorsFormArray;
      colorsArray.clear();
      component.colors.forEach(() => colorsArray.push(new FormControl(false)));

      colorsArray.at(0).setValue(true);
      colorsArray.markAsTouched();
      colorsArray.markAsDirty();

      fixture.detectChanges();

      expect(colorsArray.valid).toBeTrue();
      const colorContainer = fixture.debugElement.query(
        By.css('[formArrayName="colors"]'),
      ).parent;
      const errorTxt = colorContainer?.queryAll(By.css('p.text-red-400'));
      expect(errorTxt).toEqual([]);
    });

    it('should show error when color is not valid', () => {
      component.colors = [{ id: 1, name: 'red' }, { id: 2, name: 'blue' }];
      component.dataLoaded = true;

      const colorsArray = component.colorsFormArray;
      colorsArray.clear();
      component.colors.forEach(() => colorsArray.push(new FormControl(false)));

      colorsArray.markAsTouched();
      colorsArray.markAsDirty();

      fixture.detectChanges();

      expect(colorsArray.valid).toBeFalse();
      const colorContainer = fixture.debugElement.query(
        By.css('[formArrayName="colors"]'),
      ).parent;
      const errorTxt = colorContainer?.queryAll(By.css('p.text-red-400'));
      expect(errorTxt).toBeTruthy();
    });

    it('should not show error when at least one size is selected', () => {
      component.sizes = [{ id: 1, name: 'Xl' }, { id: 2, name: 'M' }];
      component.dataLoaded = true;

      const sizesArray = component.sizesFormArray;
      sizesArray.clear();
      component.sizes.forEach(() => sizesArray.push(new FormControl(false)));

      sizesArray.at(0).setValue(true);
      sizesArray.markAsTouched();
      sizesArray.markAsDirty();
      
      fixture.detectChanges();

      expect(sizesArray.valid).toBeTrue();
      const sizeContainer = fixture.debugElement.query(
        By.css('[formArrayName="sizes"]'),
      ).parent;
      const errorTxt = sizeContainer?.queryAll(By.css('p.text-red-400'));
      expect(errorTxt).toEqual([]);
    });

    it('should show error when size is not selected', () => {
      component.sizes = [{ id: 1, name: 'Xl' }, { id: 2, name: 'M' }];
      component.dataLoaded = true;

      const sizesArray = component.sizesFormArray;
      sizesArray.clear();
      component.sizes.forEach(() => sizesArray.push(new FormControl(false)));

      sizesArray.markAsTouched();
      sizesArray.markAsDirty();

      fixture.detectChanges();

      expect(sizesArray.valid).toBeFalse();
      const sizeContainer = fixture.debugElement.query(
        By.css('[formArrayName="sizes"]'),
      ).parent;
      const errorTxt = sizeContainer?.queryAll(By.css('p.text-red-400'));
      expect(errorTxt).toBeTruthy();
    });

    it('should be invalid when no images are provided', () => {
      const imagesGroup = component.productForm.get('images');

      imagesGroup?.markAllAsTouched();
      imagesGroup?.markAsDirty();

      fixture.detectChanges();

      expect(imagesGroup?.valid).toBeFalse();
      component.imageFieldNames.forEach(field => {
        expect(imagesGroup?.get(field)?.hasError('required')).toBeTrue()
      });
    });

    it('should be invalid when only some images are provided', () => {
      const imagesGroup = component.productForm.get('images') as FormGroup;
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });

      imagesGroup?.get('img_1')?.setValue(mockFile);
      imagesGroup?.get('img_2')?.setValue(mockFile);

      imagesGroup?.markAllAsTouched();
      imagesGroup?.markAsDirty();

      expect(imagesGroup?.valid).toBeFalse();
      expect(imagesGroup?.get('img_3')?.hasError('required')).toBeTrue();
      expect(imagesGroup?.get('img_4')?.hasError('required')).toBeTrue();
    });

    it('should be valid when all images are provided', () => {
      const imagesGroup = component.productForm.get('images') as FormGroup;
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });

      component.imageFieldNames.forEach(field => {
        imagesGroup?.get(field)?.setValue(mockFile)
      });

      imagesGroup?.markAllAsTouched();
      imagesGroup?.markAsDirty();

      expect(imagesGroup?.valid).toBeTrue();
    });

    it('should disable submit button when form is invalid', () => {
      component.productForm.invalid;

      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('button'));
      expect(btn.nativeElement.disabled).toBeTrue();
    });
  });

  describe('prefillForm()', () => {
    it('should patch fields: name, description, brand, price, unitsInStock correctly', () => {
      component.productData = mockProductResponse;

      fixture.detectChanges();
      component['prefillForm']();

      expect(component.productForm.get('name')?.value).toBe(mockProductResponse.name);
      expect(component.productForm.get('description')?.value).toBe(mockProductResponse.description);
      expect(component.productForm.get('brand')?.value).toEqual(mockProductResponse.brand.id);
      expect(component.productForm.get('price')?.value).toBe(mockProductResponse.price);
      expect(component.productForm.get('unitsInStock')?.value).toBe(mockProductResponse.unitsInStock);
    });

    it('should check the right color checkboxes based on matching IDs', () => {
      component.colors = [
        { id: 1, name: 'red' },
        { id: 2, name: 'blue' },
        { id: 3, name: 'green' },
      ];

      const colorsArray = component.colorsFormArray;
      colorsArray.clear();
      component.colors.forEach(() => colorsArray.push(new FormControl(false)));

      component.productData = {
        ...mockProductResponse,
        colors: [{ id: 1, name: 'red' }, { id: 2, name: 'blue' }]
      };

      fixture.detectChanges();
      component['prefillForm']();

      expect(colorsArray.at(0).value).toBeTrue();
      expect(colorsArray.at(1).value).toBeTrue();
      expect(colorsArray.at(2).value).toBeFalse();
    });

    it('should check the right size checkboxes based on matching IDs', () => {
      component.sizes = [
        { id: 1, name: 'S' },
        { id: 2, name: 'M' },
        { id: 3, name: 'L' }
      ];

      const sizesArray = component.sizesFormArray;
      sizesArray.clear();
      component.sizes.forEach(() => sizesArray.push(new FormControl(false)));

      component.productData = {
        ...mockProductResponse,
        sizes: [{id: 1, name: 'S'}, {id: 3, name: 'L'}]
      };

      fixture.detectChanges();
      component['prefillForm']();

      expect(sizesArray.at(0).value).toBeTrue();
      expect(sizesArray.at(1).value).toBeFalse();
      expect(sizesArray.at(2).value).toBeTrue();
    });
  });

  describe('ngOnChanges', () => {
    it('should call prefillForm() when productData input changes and dataLoaded is true', () => {
      component.dataLoaded = true;
      const prefillSpy = spyOn<any>(component, 'prefillForm');

      const changes: SimpleChanges = {
        productData: new SimpleChange(null, mockProductResponse, false),
      };

      fixture.detectChanges();
      component.ngOnChanges(changes);

      expect(prefillSpy).toHaveBeenCalled();
    });it('should not call prefillForm() if dataLoaded is false', () => {
      component.dataLoaded = false;
      const prefillSpy = spyOn<any>(component, 'prefillForm');

      const changes: SimpleChanges = {
        productData: new SimpleChange(null, mockProductResponse, false)
      };

      fixture.detectChanges();
      component.ngOnChanges(changes);

      expect(prefillSpy).not.toHaveBeenCalled();
    });
  });

  describe('createProductData()', () => {
    it('should append all fields to FormData', () => {
      component.colors = [
        { id: 1, name: 'red' },
        { id: 2, name: 'blue' },
      ];

      component.sizes = [
        { id: 1, name: 'S' },
        { id: 2, name: 'M' },
      ];

      (component.fileInputs as any) = { forEach: jasmine.createSpy('forEach') };

      const colorsArray = component.colorsFormArray;
      colorsArray.clear();
      component.colors.forEach(() => colorsArray.push(new FormControl(false)));

      const sizesArray = component.sizesFormArray;
      sizesArray.clear();
      component.sizes.forEach(() => sizesArray.push(new FormControl(false)));

      component.productForm.patchValue({
        name: '  Nike Shoes  ',
        description: '  A great shoe  ',
        brand: 1,
        price: 99,
        unitsInStock: 10,
      });

      colorsArray.at(0).setValue(true);
      sizesArray.at(1).setValue(true); 

      fixture.detectChanges();

      const formData: FormData = component['createProductData'](component.productForm);

      expect(formData.get('name')).toBe('Nike Shoes');
      expect(formData.get('description')).toBe('A great shoe');
      expect(formData.get('price')).toBe('99');
      expect(formData.get('unitsInStock')).toBe('10');
      expect(formData.get('brandId')).toBe('1');
      expect(formData.getAll('colorIds')).toEqual(['1']);
      expect(formData.getAll('sizeIds')).toEqual(['2']);
    });
  });

  describe('handleProduct()', () => {
    it('should emit handleProductEvent with both the form and the constructed FormData', () => {
      component.colors = [
        { id: 1, name: 'red' },
        { id: 2, name: 'blue' },
      ];

      component.sizes = [
        { id: 1, name: 'S' },
        { id: 2, name: 'M' },
      ];

      (component.fileInputs as any) = { forEach: jasmine.createSpy('forEach') };

      const colorsArray = component.colorsFormArray;
      colorsArray.clear();
      component.colors.forEach(() => colorsArray.push(new FormControl(false)));

      const sizesArray = component.sizesFormArray;
      sizesArray.clear();
      component.sizes.forEach(() => sizesArray.push(new FormControl(false)));

      component.productForm.patchValue({
        name: '  Nike Shoes  ',
        description: '  A great shoe  ',
        brand: 1,
        price: 99,
        unitsInStock: 10,
      });

      colorsArray.at(0).setValue(true);
      sizesArray.at(1).setValue(true);

      const emitSpy = spyOn(component.handleProductEvent, 'emit');

      fixture.detectChanges();
      component.handleProduct(component.productForm);

      expect(emitSpy).toHaveBeenCalledWith({
        productForm: component.productForm, 
        formData: jasmine.any(FormData)});
    });
  });
});
