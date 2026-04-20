import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'zone.js';

import { UsersList } from './users-list';
import { NgxSpinnerService } from 'ngx-spinner';
import { Admin, GetResponseUsers } from '../../../services/admin/admin';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { UserService } from '../../../services/user/user-service';
import { AuthService } from '../../../services/auth/auth-service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NEVER, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';


describe('UsersList', () => {
  let component: UsersList;
  let fixture: ComponentFixture<UsersList>;

  let mockAdminService: jasmine.SpyObj<Admin>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let spinnerService: NgxSpinnerService;
  let toastr: ToastrService;

  let mockPartialParams: {page: number, size: number, sort: string, direction: string};
  let mockUserResponse: GetResponseUsers[];

  beforeEach(async () => {
    mockAdminService = jasmine.createSpyObj([
      'promoteToAdmin',
      'promoteToSuperAdmin',
      'deleteUser',
      'getAllUsers'
    ]);
    mockUserService = jasmine.createSpyObj(['getUserInfo']);
    mockAuthService = jasmine.createSpyObj(['isSuperAdmin']);

    mockAdminService.getAllUsers.and.returnValue(NEVER);

    await TestBed.configureTestingModule({
      imports: [UsersList, ToastrModule.forRoot(), NoopAnimationsModule],
      providers: [
        NgxSpinnerService,
        {provide: Admin, useValue: mockAdminService},
        {provide: UserService, useValue: mockUserService},
        {provide: AuthService, useValue: mockAuthService}
      ]
    })
    .compileComponents();

    mockPartialParams = {
      page: 1,
      size: 10,
      sort: '',
      direction: '',
    };

    mockUserResponse = [{
      content: [
        {
          id: 1,
          fullName: 'Mario rossi',
          email: 'mario.rossi@example.com',
          authorities: [{authority: 'ROLE_USER'}]
        },
        {
          id: 2,
          fullName: 'Anna neri',
          email: 'anna.neri@example.com',
          authorities: [{authority: 'ROLE_USER'}, {authority: 'ROLE_ADMIN'}]
        }
      ],
      size: 5,
      totalElements: 10,
      totalPages: 2,
      number: 1
    }];

    spinnerService = TestBed.inject(NgxSpinnerService);
    toastr = TestBed.inject(ToastrService);
    fixture = TestBed.createComponent(UsersList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should call listUsers with defaultParams and sets currentUser$', () => {
      mockUserService.getUserInfo.and.returnValue(of(mockUserResponse[0].content[0]));
      spyOn(component as any, 'listUsers');

      component.ngOnInit();

      expect(component['listUsers']).toHaveBeenCalledWith(mockPartialParams);
      component.currentUser$.subscribe(res => expect(res).toEqual(mockUserResponse[0].content[0]));
    });
  });

  describe('promoteToAdmin', () => {
    const id: number = 1;
    const error: HttpErrorResponse = new HttpErrorResponse({
      status: 500, 
      error: {message: 'Something went wrong'}}
    );

    it('should call adminService.promoteToAdmin(id) with correct id', () => {
      mockAdminService.promoteToAdmin.and.returnValue(of(mockUserResponse[0].content[0]));

      component.promoteToAdmin(id);

      expect(mockAdminService.promoteToAdmin).toHaveBeenCalledWith(id);
    });

    it('should show success toastr with response.fullName on success', () => {
      mockAdminService.promoteToAdmin.and.returnValue(of(mockUserResponse[0].content[0]));
      spyOn(toastr, 'success');

      component.promoteToAdmin(id);

      expect(toastr.success).toHaveBeenCalledWith(
        'User promoted to admin successfully',
        mockUserResponse[0].content[0].fullName,
        { progressBar: true }
      );
    });

    it('should show error toastr with err.error.message on failure', () => {
      mockAdminService.promoteToAdmin.and.returnValue(throwError(() => error));
      spyOn(toastr, 'error');

      component.promoteToAdmin(id);

      expect(toastr.error).toHaveBeenCalledWith(error.error.message, 'HttpErrorResponse', {progressBar: true})
    });

    it('should hide spinner on success', () => {
      mockAdminService.promoteToAdmin.and.returnValue(of(mockUserResponse[0].content[0]));
      spyOn(spinnerService, 'hide');

      component.promoteToAdmin(id);

      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should hide spinner on error', () => {
      mockAdminService.promoteToAdmin.and.returnValue(throwError(() => error));
      spyOn(spinnerService, 'hide');

      component.promoteToAdmin(id);

      expect(spinnerService.hide).toHaveBeenCalled();
    });
  });

  describe('promoteToSuperAdmin', () => {
    const id: number = 1;
    const error: HttpErrorResponse = new HttpErrorResponse({
      status: 500, 
      error: {message: 'Something went wrong'}}
    );

    it('should call adminService.promoteToSuperAdmin(id) with correct id', () => {
      mockAdminService.promoteToSuperAdmin.and.returnValue(of(mockUserResponse[0].content[0]));

      component.promoteToSuperAdmin(id);

      expect(mockAdminService.promoteToSuperAdmin).toHaveBeenCalledWith(id);
    });

    it('should show success toastr with response.fullName on success', () => {
      mockAdminService.promoteToSuperAdmin.and.returnValue(of(mockUserResponse[0].content[0]));
      spyOn(toastr, 'success');

      component.promoteToSuperAdmin(id);

      expect(toastr.success).toHaveBeenCalledWith(
        'User promoted to super-admin successfully',
        mockUserResponse[0].content[0].fullName,
        { progressBar: true },
      );
    });

    it('should show error toastr with err.error.message on failure', () => {
      mockAdminService.promoteToSuperAdmin.and.returnValue(throwError(() => error));
      spyOn(toastr, 'error');

      component.promoteToSuperAdmin(id);

      expect(toastr.error).toHaveBeenCalledWith(error.error.message, 'HttpErrorResponse', {progressBar: true})
    });

    it('should hide spinner on success', () => {
      mockAdminService.promoteToSuperAdmin.and.returnValue(of(mockUserResponse[0].content[0]));
      spyOn(spinnerService, 'hide');

      component.promoteToSuperAdmin(id);

      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should hide spinner on error', () => {
      mockAdminService.promoteToSuperAdmin.and.returnValue(throwError(() => error));
      spyOn(spinnerService, 'hide');

      component.promoteToSuperAdmin(id);

      expect(spinnerService.hide).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    const id: number = 1;

    it('should bail early if confirm() returns false', () => {
      mockAdminService.deleteUser.and.returnValue(NEVER);
      spyOn(window, 'confirm').and.returnValue(false);

      component.delete(id);

      expect(mockAdminService.deleteUser).not.toHaveBeenCalled();
    });

    it('should remove the deleted user from this.users on success', () => {
      component.users = mockUserResponse[0].content;
      mockAdminService.deleteUser.and.returnValue(of(void 0));
      spyOn(window, 'confirm').and.returnValue(true);

      component.delete(id);

      expect(component.users).toEqual([mockUserResponse[0].content[1]]);
      const filteredUsers = mockUserResponse[0].content.filter(u => u.id !== id);
      filteredUsers.every(u => expect(u.id !== id).toBeTrue());
    });

    it('should call cdr.detectChanges() after deletion', () => {
      component.users = mockUserResponse[0].content;
      mockAdminService.deleteUser.and.returnValue(of(void 0));
      spyOn(window, 'confirm').and.returnValue(true);
      const cdrSpy = spyOn(component['cdr'], 'detectChanges');

      component.delete(id);

      expect(cdrSpy).toHaveBeenCalled();
    });

    it('should show toastr.correct', () => {
      component.users = mockUserResponse[0].content;
      mockAdminService.deleteUser.and.returnValue(of(void 0));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(toastr, 'success');

      component.delete(id);

      const deletedUser = mockUserResponse[0].content.find(u => u.id === id);
      expect(toastr.success).toHaveBeenCalledWith(
        deletedUser?.fullName,
        'User deleted successfully',
        { progressBar: true },
      );
    });

    it('should restore isLoading to false and hide spinner on success', () => {
      mockAdminService.deleteUser.and.returnValue(of(void 0));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(spinnerService, 'hide');

      component.delete(id);

      expect(component.isLoading).toBeFalse();
      expect(spinnerService.hide).toHaveBeenCalled();
    });

    it('should restore isLoading to false and hide spinner on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong.'}
      });
      mockAdminService.deleteUser.and.returnValue(throwError(() => error));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(spinnerService, 'hide');

      component.delete(id);

      expect(component.isLoading).toBeFalse();
      expect(spinnerService.hide).toHaveBeenCalled();
    });
  });

  describe('onPageChange', () => {
    it('should update partialParams.page and triggers listUsers with updated params', () => {
      const page: number = 3;
      const expectedPartialParams = {
        page: page,
        size: 10,
        sort: '',
        direction: '',
      };
      spyOn(component as any, 'listUsers');

      component.onPageChange(page);

      expect(component.partialParams).toEqual(expectedPartialParams);
      expect(component['listUsers']).toHaveBeenCalledWith(expectedPartialParams);
    });
  });

  describe('isSuperAdmin', () => {
    it('should delegate correctly to auth.isSuperAdmin()', () => {
      mockAuthService.isSuperAdmin.and.returnValue(true);

      component.isSuperAdmin;

      expect(mockAuthService.isSuperAdmin).toHaveBeenCalled();
    });
  });

  describe('template', () => {
    it('should hide action buttons when currentUser$.id === user.id', () => {
      const currentUser = {
        id: 1,
        fullName: 'Adam bianchi',
        email: 'adam.bianchi@example.com',
        authorities: [{authority: 'ROLE_USER'}]
      };
      component.currentUser$ = of(currentUser);
      component.users = [currentUser];

      fixture.detectChanges();

      const actionBtns = fixture.debugElement.queryAll(By.css('td button'));
      expect(actionBtns).toEqual([]);
    });

    it('should render "upgrade to super" button only when isSuperAdmin is true', () => {
      const currentUser = {
        id: 10,
        fullName: 'Adam bianchi',
        email: 'adam.bianchi@example.com',
        authorities: [{authority: 'ROLE_SUPER_USER'}]
      };
      component.users = [mockUserResponse[0].content[0]];
      component.currentUser$ = of(currentUser);
      spyOnProperty(component, 'isSuperAdmin').and.returnValue(true);

      component.isSuperAdmin;

      fixture.detectChanges();

      const actionBtn = fixture.debugElement.queryAll(By.css('td button'))[2];
      expect(actionBtn).toBeTruthy();
    });

    it('should show empty state message only when users.length <= 0 && !isLoading', () => {
      component.isLoading = false;

      fixture.detectChanges();

      const txt_1 = fixture.debugElement.query(By.css('p.text-red-400'));
      expect(txt_1).toBeTruthy();

      component.isLoading = true;

      fixture.detectChanges();

      const txt_2 = fixture.debugElement.query(By.css('p.text-red-400'));
      expect(txt_2).toBeNull();
    });

    it('should hide pagination controls when users.length <= 0', () => {
      const elem_1 = fixture.debugElement.query(
        By.css('div.flex.justify-center.mt-7'),
      );

      expect(elem_1.nativeElement.classList.contains('hidden')).toBeTrue();

      component.users = mockUserResponse[0].content;

      fixture.detectChanges();

      const elem_2 = fixture.debugElement.query(
        By.css('div.flex.justify-center.mt-7'),
      );

      expect(elem_2.nativeElement.classList.contains('hidden')).toBeFalse();
    });

    it('should have $index = 0 for the first colum', () => {
      component.users = mockUserResponse[0].content;

      fixture.detectChanges();

      const tr = fixture.debugElement.queryAll(By.css('tbody tr td'))[0];
      expect(tr.nativeElement.textContent).toBe('0');
    });
  });
});

// $index in the first column starts at 0 (worth flagging — you may want 1-based display)