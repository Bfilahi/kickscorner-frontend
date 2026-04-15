import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserResponse } from '../../model/response/user-response';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class Admin {

  private baseUrl: string = environment.ADMIN_BASE_URL;

  constructor(private http: HttpClient) { }


  public getAllUsers(partialParams: {page: number, size: number, sort: string, direction: string}): Observable<GetResponseUsers[]>{
    let params = new HttpParams()
      .set('page', partialParams.page - 1)
      .set('size', partialParams.size)
      .set('sortBy', partialParams.sort)
      .set('direction', partialParams.direction);

    const url: string = `${this.baseUrl}/users`;
    return this.http.get<GetResponseUsers[]>(url, { params });
  }

  public promoteToAdmin(id: number): Observable<UserResponse>{
    return this.http.put<UserResponse>(`${this.baseUrl}/${id}/promote/admin`, id);
  }

  public promoteToSuperAdmin(id: number): Observable<UserResponse>{
    return this.http.put<UserResponse>(`${this.baseUrl}/${id}/promote/super-admin`, id);
  }

  public deleteUser(id: number){
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

export interface GetResponseUsers{
  content: UserResponse[],
  size: number,
  totalElements: number,
  totalPages: number,
  number: number
}