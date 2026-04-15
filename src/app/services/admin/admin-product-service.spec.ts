import { TestBed } from '@angular/core/testing';
import 'zone.js';

import { AdminProductService } from './admin-product-service';
import { environment } from '../../../environments/environment.development';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BrandResponse } from '../../model/response/brand-response';
import { SizeResponse } from '../../model/response/size-response';
import { ColorResponse } from '../../model/response/color-response';
import { ProductResponse } from '../../model/response/product-response';

describe('AdminProductService', () => {
  let service: AdminProductService;
  let httpTestingController: HttpTestingController;

  const baseUrl: string = environment.ADMIN_BASE_URL;
  const brandUrl: string = `${baseUrl}/brands`;
  const sizeUrl: string = `${baseUrl}/sizes`;
  const colorUrl: string = `${baseUrl}/colors`;
  const productUrl: string = `${baseUrl}/products`;

  let mockBrandResponse: BrandResponse[];
  let mockSizeResponse: SizeResponse[];
  let mockColorResponse: ColorResponse[];
  let mockProductResponse: ProductResponse[];

  let formData: FormData;


  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    mockBrandResponse = [
      { id: 1, name: 'Nike' },
      { id: 2, name: 'Adidas' },
    ];

    mockSizeResponse = [
      { id: 1, name: 'L' },
      { id: 2, name: 'M' },
      { id: 3, name: 'S' },
    ];

    mockColorResponse = [
      { id: 1, name: 'red' },
      { id: 2, name: 'blue' },
      { id: 3, name: 'yellow' },
    ];

    mockProductResponse = [
      {
        id: 1,
        name: 'mock product 1',
        description: 'mock product description',
        price: 100,
        unitsInStock: 10,

        sizes: [
          {
            id: 1,
            name: 'L',
          },
        ],

        brand: {
          id: 2,
          name: 'Nike',
        },

        colors: [
          {
            id: 1,
            name: 'Red',
          },
        ],

        images: [
          {
            publicId: 'mock-public-id',
            imgUrl: '/mock-img-url',
          },
        ],
      },
    ];

    formData = new FormData();
    formData.append('name', mockProductResponse[0].name);
    formData.append('description', mockProductResponse[0].description);
    formData.append('price', mockProductResponse[0].price!.toString());
    formData.append('unitsInStock', mockProductResponse[0].unitsInStock!.toString());
    formData.append('brandId', mockProductResponse[0].brand.id.toString());

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AdminProductService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBrands()', () => {
    it('should call the method with the correct URL', () => {
      service
        .getBrands()
        .subscribe((res) => expect(res).toEqual(mockBrandResponse));

      let req = httpTestingController.expectOne(
        `${environment.PRODUCT_URL}/brands`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockBrandResponse);
    });

    it('should propagate errors', () => {
      service.getBrands().subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500),
      });

      httpTestingController
        .expectOne(`${environment.PRODUCT_URL}/brands`)
        .flush('Server error', {
          status: 500,
          statusText: 'Internal Server Error',
        });
    });
  });

  describe('addBrand()', () => {
    const newBrand: BrandResponse = { id: 3, name: 'Jordan' };

    it('should call the method with the correct URL', () => {
      service
        .addBrand(newBrand)
        .subscribe((res) => expect(res).toEqual(newBrand));

      let req = httpTestingController.expectOne(brandUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newBrand);
      req.flush(newBrand);
    });

    it('should propagate errors', () => {
      service.addBrand(newBrand).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500),
      });

      httpTestingController.expectOne(brandUrl).flush('Server error', {
        status: 500,
        statusText: 'Internal Server Error',
      });
    });
  });

  describe('deleteBrand()', () => {
    const id: number = 1;

    it('should call the method with the correct URL', () => {
      service.deleteBrand(id).subscribe(void 0);

      let req = httpTestingController.expectOne(`${brandUrl}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should propagate errors', () => {
      service.deleteBrand(id).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500),
      });

      httpTestingController
        .expectOne(`${brandUrl}/${id}`)
        .flush('Server error', {
          status: 500,
          statusText: 'Internal Server Error',
        });
    });
  });

  describe('getSizes()', () => {
    it('should call the method with the correct URL', () => {
      service
        .getSizes()
        .subscribe((res) => expect(res).toEqual(mockSizeResponse));

      let req = httpTestingController.expectOne(
        `${environment.PRODUCT_URL}/sizes`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockSizeResponse);
    });

    it('should propagate errors', () => {
      service.getSizes().subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500),
      });

      httpTestingController
        .expectOne(`${environment.PRODUCT_URL}/sizes`)
        .flush('Server error', {
          status: 500,
          statusText: 'Internal Server Error',
        });
    });
  });

  describe('addSize()', () => {
    const newSize: SizeResponse = { id: 4, name: 'XL' };

    it('should call the method with the correct URL', () => {
      service.addSize(newSize).subscribe((res) => expect(res).toEqual(newSize));

      let req = httpTestingController.expectOne(sizeUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newSize);
      req.flush(newSize);
    });

    it('should propagate errors', () => {
      service.addSize(newSize).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500),
      });

      httpTestingController.expectOne(sizeUrl).flush('Server error', {
        status: 500,
        statusText: 'Internal Server Error',
      });
    });
  });

  describe('deleteSize()', () => {
    const id: number = 1;

    it('should call the method with the correct URL', () => {
      service.deleteSize(id).subscribe(void 0);

      let req = httpTestingController.expectOne(`${sizeUrl}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should propagate errors', () => {
      service.deleteSize(id).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500),
      });

      httpTestingController
        .expectOne(`${sizeUrl}/${id}`)
        .flush('Server error', {
          status: 500,
          statusText: 'Internal Server Error',
        });
    });
  });

  describe('getColors()', () => {
    it('should call the method with the correct URL', () => {
      service
        .getColors()
        .subscribe((res) => expect(res).toEqual(mockColorResponse));

      let req = httpTestingController.expectOne(
        `${environment.PRODUCT_URL}/colors`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockColorResponse);
    });

    it('should propagate errors', () => {
      service.getColors().subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500),
      });

      httpTestingController
        .expectOne(`${environment.PRODUCT_URL}/colors`)
        .flush('Server error', {
          status: 500,
          statusText: 'Internal Server Error',
        });
    });
  });

  describe('addColor()', () => {
    const newColor: ColorResponse = { id: 4, name: 'purple' };

    it('should call the method with the correct URL', () => {
      service.addColor(newColor).subscribe((res) => expect(res).toEqual(newColor));

      let req = httpTestingController.expectOne(colorUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newColor);
      req.flush(newColor);
    });

    it('should propagate errors', () => {
      service.addColor(newColor).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500),
      });

      httpTestingController.expectOne(colorUrl).flush('Server error', {
        status: 500,
        statusText: 'Internal Server Error',
      });
    });
  });

  describe('deleteColor()', () => {
    const id: number = 1;

    it('should call the method with the correct URL', () => {
      service.deleteColor(id).subscribe(void 0);

      let req = httpTestingController.expectOne(`${colorUrl}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should propagate errors', () => {
      service.deleteColor(id).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500),
      });

      httpTestingController
        .expectOne(`${colorUrl}/${id}`)
        .flush('Server error', {
          status: 500,
          statusText: 'Internal Server Error',
        });
    });
  });

  describe('addProduct()', () => {
    it('should call method with the correct URL', () => {
      service.addProduct(formData).subscribe(res => expect(res).toEqual(mockProductResponse[0]));

      let req = httpTestingController.expectOne(productUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(formData);
      req.flush(mockProductResponse[0]);
    });

    it('should propagate errors', () => {
      service.addProduct(formData).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500)
      });

      httpTestingController.expectOne(productUrl).flush('Server error', {
        status: 500, 
        statusText: 'Internal Server Error'
      });
    });
  });

  describe('updateProduct()', () => {
    const id: number = 0;

    it('should call the method with the correct URL', () => {
      service.updateProduct(id, formData).subscribe(res => expect(res).toEqual(mockProductResponse[0]));

      let req = httpTestingController.expectOne(`${productUrl}/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toBe(formData);
      req.flush(mockProductResponse[0]);
    });

    it('should propagate errors', () => {
      service.updateProduct(id, formData).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500)
      });

      httpTestingController.expectOne(`${productUrl}/${id}`)
      .flush('Server error', {status: 500, statusText: 'Internal Server Error'});
    });
  });

  describe('deleteProduct()', () => {
    const id: number = 0;

    it('should call the method with the correct URL', () => {
      service.deleteProduct(id).subscribe(void 0);

      let req = httpTestingController.expectOne(`${productUrl}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should propagate errors', () => {
      service.deleteProduct(id).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500)
      });

      httpTestingController.expectOne(`${productUrl}/${id}`)
      .flush('Server error', {status: 500, statusText: 'Internal Server Error'});
    });
  });

});
