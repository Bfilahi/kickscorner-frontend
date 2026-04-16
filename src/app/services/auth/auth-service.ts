import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { AuthRequest } from '../../model/request/auth-request';
import { HttpClient } from '@angular/common/http';
import { RegisterRequest } from '../../model/request/register-request';
import { AuthResponse } from '../../model/response/auth-response';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { UserService } from '../user/user-service';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl: string = environment.AUTH_URL;
  private isBrowser: boolean = false;

  private authStateSubject = new BehaviorSubject<boolean>(false);
  public authState$ = this.authStateSubject.asObservable();

  

  constructor(
    private http: HttpClient, 
    @Inject(PLATFORM_ID) platformId: Object, 
    private router: Router,
    private userService: UserService,
    private jwtHelper: JwtHelperService
  ) {

    this.isBrowser = isPlatformBrowser(platformId);
    this.authStateSubject.next(this.isLoggedIn());
  }



  public register(request: RegisterRequest){
    const url: string = `${this.baseUrl}/register`;
    return this.http.post(url, request);
  }

  public login(request: AuthRequest): Observable<AuthResponse>{
    const url: string = `${this.baseUrl}/login`;
    return this.http.post<AuthResponse>(url, request).pipe(
      tap(response => {
        this.saveToken(response.token);
        this.authStateSubject.next(true);
        this.userService.getUserInfo().subscribe();
      })
    );
  }

  public logout(){
    this.clearToken();
    if(this.isBrowser)
      this.router.navigate(['/home']);
  }

  public isLoggedIn(): boolean{
    const token: string | null = this.getToken();
    if(!token || token === '')
      return false;

    if(this.jwtHelper.isTokenExpired(token)){
      this.logout();
      return false;
    }

    return true;
  }

  public saveToken(token: string){
    if(this.isBrowser)
      localStorage.setItem('jwt', token);
  }

  public getToken(): string | null{
    return this.isBrowser ? localStorage.getItem('jwt') : null;
  }

  public isAdmin(): boolean{
    return this.getUserRoles().includes('ROLE_ADMIN');
  }

  public isSuperAdmin(): boolean{
    return this.getUserRoles().includes('ROLE_SUPER_ADMIN');
  }

  private clearToken(){
    if(this.isBrowser)
      localStorage.removeItem('jwt');
    this.authStateSubject.next(false);
  }

  private getDecodedToken(): any{
    const token: string | null = this.getToken();

    if(!token) return null;

    try{
      return this.jwtHelper.decodeToken(token);
    } catch(err){
      console.error('Error decoding token:', err);
      return null;
    }
  }

  private getUserRoles(): string[]{
    const decodedToken = this.getDecodedToken();
    if(!decodedToken) return [];

    return decodedToken.authorities || [];
  }

}
