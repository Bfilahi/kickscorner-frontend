import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { ProductForm } from './product-form';
import { AdminProductService } from '../../../services/admin/admin-product-service';
import { provideRouter } from '@angular/router';

describe('ProductForm', () => {
  let component: ProductForm;
  let fixture: ComponentFixture<ProductForm>;

  let mockAdminProductService: jasmine.SpyObj<AdminProductService>;

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

    fixture = TestBed.createComponent(ProductForm);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form initialization', () => {
    // it('should create the form with the correct controls and default values', () => {

    // });
  });
});

// form initialization: 

// All validators are applied (required, min, noWhiteSpaces, minSelectedCheckbox)
// Colors and sizes FormArrays are populated after data loads
// dataLoaded flag is set to true after all data resolves

// Validation:

// Name/description: required, whitespace-only input fails noWhiteSpaces
// Price/unitsInStock: required, value below 1 fails min
// Brand: required radio selection
// Colors/sizes: at least one checkbox must be selected
// Images: all 4 fields required
// Submit button is disabled when form is invalid

// prefillForm():

// Patches scalar fields (name, description, brand, price, unitsInStock) correctly
// Checks the right color checkboxes based on matching IDs
// Checks the right size checkboxes based on matching IDs
// Does nothing gracefully if productData is null

// ngOnChanges:

// Calls prefillForm() when productData input changes and dataLoaded is true
// Does not call prefillForm() if dataLoaded is false

// createProductData():

// Appends all scalar fields to FormData
// Only appends checked color IDs
// Only appends checked size IDs
// Appends files from each file input that has a file selected
// Trims name and description

// handleProduct():

// Emits handleProductEvent with both the form and the constructed FormData