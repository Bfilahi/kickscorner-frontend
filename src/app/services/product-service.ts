import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProductResponse } from '../model/response/product-response';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private productUrl: string = environment.PRODUCT_URL;

  constructor(private http: HttpClient){}

  public getProducts(partialParams: {page: number, size: number, sort: string, direction: string}): Observable<GetResponseProducts>{
    let params = new HttpParams()
    .set('page', partialParams.page - 1)
    .set('size', partialParams.size)
    .set('sortBy', partialParams.sort)
    .set('direction', partialParams.direction);

    return this.http.get<GetResponseProducts>(this.productUrl, { params });
  }

  public getProduct(productId: number): Observable<ProductResponse>{
    const url: string = `${this.productUrl}/${productId}`
    return this.http.get<ProductResponse>(url);
  }

  public getFilteredProducts(
    partialParams: {page: number, size: number, sort: string, direction: string}, 
    brandIds: number[],
    sizeIds: number[],
    colorIds: number[]): Observable<GetResponseProducts>{
      const url: string = `${this.productUrl}/filter`;
      let params = new HttpParams()
        .set('page', partialParams.page - 1)
        .set('size', partialParams.size)
        .set('sortBy', partialParams.sort)
        .set('direction', partialParams.direction);
      
      brandIds.forEach(b => params = params.append('brandIds', b));
      sizeIds.forEach(s => params = params.append('sizeIds', s));
      colorIds.forEach(c => params = params.append('colorIds', c));

      return this.http.get<GetResponseProducts>(url, { params });
  }
}


interface GetResponseProducts{
  content: ProductResponse[],
  size: number,
  totalElements: number,
  totalPages: number,
  number: number
}