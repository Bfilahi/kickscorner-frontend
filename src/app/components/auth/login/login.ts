import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { CommonModule } from '@angular/common';
import { AuthRequest } from '../../../model/request/auth-request';
import { AuthService } from '../../../services/auth/auth-service';
import { AuthResponse } from '../../../model/response/auth-response';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit{

  public errorMsg = signal<string>('');

  public loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)]),
    password: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)])
  });


  constructor(
    private auth: AuthService,
    private router: Router,
    private spinnerService: NgxSpinnerService
  ){}


  ngOnInit(): void {
    if(this.auth.isLoggedIn())
      this.router.navigate(['/home']);
  }


  public onLogin(loginForm: FormGroup){
    if(loginForm.invalid) return;

    this.errorMsg.set('');

    this.spinnerService.show();

    const request: AuthRequest = loginForm.value as AuthRequest;
    this.auth.login(request).subscribe({
      next: (response: AuthResponse) => {

        if(response.token){
          this.auth.saveToken(response.token);
          this.router.navigate(['/home']);
        }
        this.spinnerService.hide();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMsg.set(err.error.message || 'Invalid email or password');
        console.error(err.error);
        this.spinnerService.hide();
      }
    });
  }

}
