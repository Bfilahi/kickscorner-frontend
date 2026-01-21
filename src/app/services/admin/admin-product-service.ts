import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BrandRequest } from '../../model/request/brand-request';
import { BrandResponse } from '../../model/response/brand-response';
import { SizeResponse } from '../../model/response/size-response';
import { SizeRequest } from '../../model/request/size-request';
import { ColorResponse } from '../../model/response/color-response';
import { ColorRequest } from '../../model/request/color-request';
import { ProductResponse } from '../../model/response/product-response';

@Injectable({
  providedIn: 'root'
})
export class AdminProductService {

  private baseUrl: string = environment.ADMIN_BASE_URL;
  private brandUrl: string = `${this.baseUrl}/brands`;
  private sizeUrl: string = `${this.baseUrl}/sizes`;
  private colorUrl: string = `${this.baseUrl}/colors`;
  private productUrl: string = `${this.baseUrl}/products`;


  constructor(private http: HttpClient){}




  public getBrands(): Observable<BrandResponse[]>{
<<<<<<< HEAD
    const url: string = `${environment.PRODUCT_URL}/brands`;
    return this.http.get<BrandResponse[]>(url);
=======
    return this.http.get<BrandResponse[]>(this.brandUrl);
>>>>>>> 56438dde39ab7a255a9c9f35755d747a971ff9d7
  }

  public addBrand(request: BrandRequest): Observable<BrandResponse>{
    return this.http.post<BrandResponse>(this.brandUrl, request);
  }

  public deleteBrand(id: number){
    const url: string = `${this.brandUrl}/${id}`;
    return this.http.delete<void>(url);
  }





  public getSizes(): Observable<SizeResponse[]>{
<<<<<<< HEAD
    const url: string = `${environment.PRODUCT_URL}/sizes`;
    return this.http.get<SizeResponse[]>(url);
=======
    return this.http.get<SizeResponse[]>(this.sizeUrl);
>>>>>>> 56438dde39ab7a255a9c9f35755d747a971ff9d7
  }

  public addSize(request: SizeRequest): Observable<SizeResponse>{
    return this.http.post<SizeResponse>(this.sizeUrl, request);
  }

  public deleteSize(id: number){
    const url: string = `${this.sizeUrl}/${id}`;
    return this.http.delete<void>(url);
  }





  public getColors(): Observable<ColorResponse[]>{
<<<<<<< HEAD
    const url: string = `${environment.PRODUCT_URL}/colors`;
    return this.http.get<ColorResponse[]>(url); 
=======
    return this.http.get<ColorResponse[]>(this.colorUrl); 
>>>>>>> 56438dde39ab7a255a9c9f35755d747a971ff9d7
  }

  public addColor(request: ColorRequest): Observable<ColorResponse>{
    return this.http.post<ColorResponse>(this.colorUrl, request);
  }

  public deleteColor(id: number){
    const url: string = `${this.colorUrl}/${id}`;
    return this.http.delete<void>(url);
  }



  public addProduct(formData: FormData): Observable<ProductResponse>{
    return this.http.post<ProductResponse>(this.productUrl, formData);
  }

  public updateProduct(id: number, formData: FormData): Observable<ProductResponse>{
    const url: string = `${this.productUrl}/${id}`;
    return this.http.put<ProductResponse>(url, formData);
  }

  public deleteProduct(id: number){
    const url: string = `${this.productUrl}/${id}`;
    return this.http.delete<void>(url);
  }

}
