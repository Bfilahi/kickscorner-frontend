import { TestBed } from '@angular/core/testing';
import 'zone.js';

import { UserService } from './user-service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment.development';
import { UserResponse } from '../../model/response/user-response';
import { PasswordUpdateRequest } from '../../model/request/password-update-request';


describe('User', () => {
  let service: UserService;
  let httpTestingController: HttpTestingController;

  const url: string = environment.USER_URL;
  let mockUserResponse: UserResponse;
  let passwordUpdateRequest: PasswordUpdateRequest;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    mockUserResponse = {
      id: 1,
      fullName: 'Mario Rossi',
      email: 'mario.rossi@example.com',
      authorities: [{authority: 'ROLE_USER'}]
    }

    passwordUpdateRequest = {
      oldPassword: 'old-password123',
      newPassword: 'new-password123',
      newPassword2: 'new-password123'
    }

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(UserService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserInfo()', () => {
    it('should call the method with the correct URL', () => {
      service.getUserInfo().subscribe(res => expect(res).toEqual(mockUserResponse));

      let req = httpTestingController.expectOne(`${url}/info`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUserResponse);
    });

    it('should propagate errors', () => {
      service.getUserInfo().subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500)
      });

      httpTestingController.expectOne(`${url}/info`)
      .flush('Server error', {status: 500, statusText: 'Internal Server Error'});
    });
  });

  describe('deleteProfile()', () => {
    it('should call the method with the correct URL', () => {
      service.deleteProfile().subscribe({
        next: () => {}
      });

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should propagate errors', () => {
      service.deleteProfile().subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500)
      });

      httpTestingController.expectOne(url)
      .flush('Server error', {status: 500, statusText: 'Internal Server Error'});
    });
  });

  describe('updatePassword()', () => {
    it('should call the method with the correct URL', () => {
      service.updatePassword(passwordUpdateRequest).subscribe(void 0);

      const req = httpTestingController.expectOne(`${url}/password`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(passwordUpdateRequest);
      req.flush(null);
    });

    it('should propagate errors', () => {
      service.updatePassword(passwordUpdateRequest).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500)
      });

      httpTestingController.expectOne(`${url}/password`)
      .flush('Server error', {status: 500, statusText: 'Internal Server Error'});
    });
  });
});
