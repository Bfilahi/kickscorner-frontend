import { TestBed } from '@angular/core/testing';
import 'zone.js';

import { ProductService } from './product-service';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '../../environments/environment.development';
import { GetResponseProducts } from './product-service';

describe('ProductService', () => {
  let service: ProductService;
  let url: string = environment.PRODUCT_URL;
  let responseProducts: GetResponseProducts;

  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    responseProducts = {
      content: [
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
      ],
      page: {
        size: 10,
        totalElements: 50,
        totalPages: 5,
        number: 1,
      }
    };

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(ProductService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProducts()', () => {
    it('should call the function with the correct URL', () => {
      service
        .getProducts({ page: 4, size: 10, sort: '', direction: '' })
        .subscribe((res) => expect(res).toEqual(responseProducts));

      let req = httpTestingController.expectOne((req) => req.url === url);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('3');
      expect(req.request.params.get('size')).toBe('10');
      expect(req.request.params.get('sortBy')).toBe('');
      expect(req.request.params.get('direction')).toBe('');
      req.flush(responseProducts);
    });

    it('should return the response body', () => {
      service
        .getProducts({ page: 4, size: 10, sort: '', direction: '' })
        .subscribe((res) => expect(res).toEqual(responseProducts));

      httpTestingController
        .expectOne((req) => req.url === url)
        .flush(responseProducts);
    });

    it('should propagate HTTP errors', () => {
      service
        .getProducts({ page: 4, size: 10, sort: '', direction: '' })
        .subscribe({
          next: () => fail('expected an error'),
          error: (err) => expect(err.status).toBe(500),
        });

      let req = httpTestingController.expectOne((req) => req.url === url);
      req.flush('Server error', {
        status: 500,
        statusText: 'Internal Server Error',
      });
    });
  });

  describe('getProduct(productId)', () => {
    it('should call the function with the correct URL', () => {
      service.getProduct(responseProducts.content[0].id).subscribe();

      let req = httpTestingController.expectOne(
        `${url}/${responseProducts.content[0].id}`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(responseProducts.content[0]);
    });

    it('should return the response body', () => {
      service
        .getProduct(responseProducts.content[0].id)
        .subscribe((res) => expect(res).toEqual(responseProducts.content[0]));

      httpTestingController
        .expectOne(`${url}/${responseProducts.content[0].id}`)
        .flush(responseProducts.content[0]);
    });

    it('should propagate HTTP errors', () => {
      service.getProduct(responseProducts.content[0].id).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500),
      });

      httpTestingController
        .expectOne(`${url}/${responseProducts.content[0].id}`)
        .flush('Server error', {
          status: 500,
          statusText: 'Internal Server Error',
        });
    });
  });

  describe('getFilteredProducts()', () => {
    let request: {
      partialParams: {
        page: number;
        size: number;
        sort: string;
        direction: string;
      };
      brandIds: number[];
      sizeIds: number[];
      colorIds: number[];
    };
    let filterUrl: string;

    beforeEach(() => {
      request = {
        partialParams: { page: 4, size: 10, sort: '', direction: '' },
        brandIds: [12],
        sizeIds: [7, 3, 8],
        colorIds: [1, 2, 5],
      };

      filterUrl = `${url}/filter`;
    });

    it('should call the method with the correct URL', () => {
      service
        .getFilteredProducts(
          request.partialParams,
          request.brandIds,
          request.sizeIds,
          request.colorIds,
        )
        .subscribe();

      let req = httpTestingController.expectOne((req) => req.url === filterUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('3');
      expect(req.request.params.get('size')).toBe('10');
      expect(req.request.params.get('sortBy')).toBe('');
      expect(req.request.params.get('direction')).toBe('');
      req.flush(responseProducts);
    });

    it('should return the response body', () => {
      service.getFilteredProducts(
        request.partialParams,
        request.brandIds,
        request.sizeIds,
        request.colorIds,
      ).subscribe(res => expect(res).toEqual(responseProducts));

      httpTestingController.expectOne(req => req.url === filterUrl).flush(responseProducts);
    });

    it('should append params correctly', () => {
      service
        .getFilteredProducts(
          request.partialParams,
          request.brandIds,
          request.sizeIds,
          request.colorIds,
        )
        .subscribe();

      let req = httpTestingController.expectOne((req) => req.url === filterUrl);
      expect(req.request.params.getAll('brandIds')).toEqual(['12']);
      expect(req.request.params.getAll('sizeIds')).toEqual(['7', '3', '8']);
      expect(req.request.params.getAll('colorIds')).toEqual(['1', '2', '5']);
      req.flush(responseProducts);
    });

    it('should propagate HTTP errors', () => {
      service.getFilteredProducts(
        request.partialParams,
        request.brandIds,
        request.sizeIds,
        request.colorIds,
      ).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500)
      });

      httpTestingController.expectOne(req => req.url === filterUrl)
      .flush('Server error', {status: 500, statusText: 'Internal Server Error'});
    });
  });
});
