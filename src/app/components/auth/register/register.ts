import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth-service';
import { RegisterRequest } from '../../../model/request/register-request';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { CustomValidators } from '../../../validators/custom-validators';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit{

  public registerForm: FormGroup = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.minLength(3), CustomValidators.noWhiteSpaces()]),
    lastName: new FormControl('', [Validators.required, Validators.minLength(3), CustomValidators.noWhiteSpaces()]),
    email: new FormControl('', [Validators.required, Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)]),
    password: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)])
  });

  public errorMsg = signal<string>('');

  constructor(
    private auth: AuthService, 
    private router: Router,
    private spinnerService: NgxSpinnerService
  ){}


  ngOnInit(): void {
    if(this.auth.isLoggedIn())
      this.router.navigate(['/home']);
  }


  public onRegister(registerForm: FormGroup){
    if(registerForm.invalid) return;

    this.spinnerService.show();

    const request: RegisterRequest = registerForm.value as RegisterRequest;
    this.auth.register(request).subscribe({
      next: () => {
        this.router.navigate(['/login']);
        this.spinnerService.hide();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMsg.set(err.error.message || 'Registration failed')
        console.error(err.error);
        this.spinnerService.hide();
      }
    });
  }

}
