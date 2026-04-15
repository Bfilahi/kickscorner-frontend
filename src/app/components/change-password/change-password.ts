import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user/user-service';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { CustomValidators } from '../../validators/custom-validators';
import { PasswordUpdateRequest } from '../../model/request/password-update-request';




@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css'
})
export class ChangePassword {

  public successMsg = signal<string>('');
  public isLoading = signal<boolean>(false);
  public currentPassword = signal<string>('');

  public resetPasswordForm: FormGroup = new FormGroup({
    oldPassword: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)]),
    newPassword1: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)]),
    newPassword2: new FormControl('', [Validators.required])
  }, [CustomValidators.passwordsMatch('newPassword1', 'newPassword2')]);


  constructor(
    private userService: UserService,
    private spinnerService: NgxSpinnerService
  ){}



  public onSubmit(resetPasswordForm: FormGroup){
    const request = resetPasswordForm.value as PasswordUpdateRequest;

    this.successMsg.set('');
    this.spinnerService.show();
    this.isLoading.set(true);

    this.userService.updatePassword(request).subscribe({
      next: () => {
        this.successMsg.set('Password updated successfully');
        resetPasswordForm.reset();
        this.spinnerService.hide();
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.successMsg.set('');
        this.spinnerService.hide();
        this.isLoading.set(false);
      }
    });
  }
}
