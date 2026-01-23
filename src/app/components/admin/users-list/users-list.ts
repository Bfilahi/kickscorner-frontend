import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { UserResponse } from '../../../model/response/user-response';
import { Admin } from '../../../services/admin/admin';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth/auth-service';
import { UserService } from '../../../services/user/user-service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-users-list',
  imports: [NgxPaginationModule, CommonModule],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css'
})
export class UsersList implements OnInit{

  public users: UserResponse[] = [];
  public partialParams: {page: number, size: number, sort: string, direction: string} = {
    page: 1,
    size: 10,
    sort: '',
    direction: '',
  };

  public isLoading: boolean = true;
  public totalItems: number = 0;
  public currentUserId: number = 0;

  public currentUser$!: Observable<UserResponse>;


  constructor(
    private adminService: Admin,
    private userService: UserService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private spinnerService: NgxSpinnerService,
    private toastr: ToastrService
  ){}


  get isSuperAdmin(): boolean{
    return this.auth.isSuperAdmin();
  }

  ngOnInit(): void {
    this.listUsers(this.partialParams);

    this.currentUser$ = this.userService.getUserInfo();
  }

  public promoteToAdmin(id: number){
    this.spinnerService.show();

    this.adminService.promoteToAdmin(id).subscribe({
      next: (response: UserResponse) => {
        this.toastr.success('User promoted to admin successfully', response.fullName, {progressBar: true});
        this.spinnerService.hide();
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.spinnerService.hide();
        this.toastr.error(err.error.message, err.name, {progressBar: true});
      }
    });
  }

  public promoteToSuperAdmin(id: number){
    this.spinnerService.show();

    this.adminService.promoteToSuperAdmin(id).subscribe({
      next: (response: UserResponse) => {
        this.toastr.success('User promoted to super-admin successfully', response.fullName, {progressBar: true});
        this.spinnerService.hide();
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.spinnerService.hide();
        this.toastr.error(err.error.message, err.name, {progressBar: true});
      }
    });
  }

  public delete(id: number){
    if(!confirm('Are you sure you want to delete this user?'))
      return;

    this.spinnerService.show();
    this.isLoading = true;

    this.adminService.deleteUser(id).subscribe({
      next: () => {
        const deletedUser = this.users.find(u => u.id === id);
        this.users = this.users.filter(u => u.id !== id);

        this.cdr.detectChanges();

        this.spinnerService.hide();
        this.isLoading = false;

        this.toastr.success(deletedUser?.fullName, 'User deleted successfully', {progressBar: true});
      },
      error: (err: HttpErrorResponse) => {
        this.spinnerService.hide();
        console.error(err);
        this.isLoading = false;

        this.toastr.error(err.error.message, 'Error', {progressBar: true});
      }
    });
  }

  public onPageChange(page: number){
    this.partialParams.page = page;
    this.listUsers(this.partialParams);
  }


  private listUsers(partialParams: {page: number, size: number, sort: string, direction: string}){
    this.spinnerService.show();

    this.adminService.getAllUsers(partialParams).subscribe({
      next: (response: any) => {
        this.users = response.content;

        this.totalItems = response.page.totalElements;
        this.partialParams.page = response.page.number + 1;
        this.partialParams.size = response.page.size;

        this.cdr.detectChanges();

        this.isLoading = false;
        this.spinnerService.hide();
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.spinnerService.hide();
        this.isLoading = false;
      }
    });
  }

}
