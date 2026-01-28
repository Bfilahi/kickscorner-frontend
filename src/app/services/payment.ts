import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { StripeResponse } from '../model/response/stripe-response';
import { HttpClient } from '@angular/common/http';
import { PaymentRequest } from '../model/request/payment-request';
import { AuthService } from './auth/auth-service';



@Injectable({
  providedIn: 'root'
})
export class Payment {

  private baseUrl: string = environment.PAYMENT_URL;

    constructor(
      private http: HttpClient,
      private auth: AuthService
    ) { }


  public checkout(request: PaymentRequest): Observable<StripeResponse>{
    const url: string = `${this.baseUrl}/checkout`;

    if(!this.auth.isLoggedIn())
      throw new Error("User not authenticated");

    return this.http.post<StripeResponse>(url, request);
  }

}
