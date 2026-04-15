import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponse } from '../../model/response/user-response';
import { PasswordUpdateRequest } from '../../model/request/password-update-request';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl: string = environment.USER_URL;


  constructor(private http: HttpClient){}

  
  public getUserInfo(): Observable<UserResponse>{
    return this.http.get<UserResponse>(`${this.baseUrl}/info`);
  }
  
  public deleteProfile(){
    return this.http.delete(this.baseUrl);
  }

  public updatePassword(request: PasswordUpdateRequest){
    return this.http.put(`${this.baseUrl}/password`, request);
  }

}
