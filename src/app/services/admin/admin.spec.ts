import { TestBed } from '@angular/core/testing';
import 'zone.js';

import { Admin, GetResponseUsers } from './admin';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment.development';


describe('Admin', () => {
  let service: Admin;
  let httpTestingController: HttpTestingController;

  let mockResponseUsers: GetResponseUsers[];
  let url: string = environment.ADMIN_BASE_URL;
  let id: number;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    id = 1;
    mockResponseUsers = [
      {
        content: [
          {
            id: 1,
            fullName: 'Mario Rossi',
            email: 'mario.rossi@example.com',
            authorities: [{ authority: 'ROLE_USER' }],
          },
          {
            id: 2,
            fullName: 'Adam Bianchi',
            email: 'adam.bianchi@example.com',
            authorities: [
              { authority: 'ROLE_ADMIN' },
              { authority: 'ROLE_USER' },
            ],
          },
        ],
        size: 2,
        totalElements: 2,
        totalPages: 1,
        number: 0,
      },
      {
        content: [
          {
            id: 3,
            fullName: 'Anna Verdi',
            email: 'anna.verdi@example.com',
            authorities: [{ authority: 'ROLE_USER' }],
          },
          {
            id: 4,
            fullName: 'Giulia Neri',
            email: 'giulia.neri@example.com',
            authorities: [{ authority: 'ROLE_USER' }],
          },
        ],
        size: 2,
        totalElements: 4,
        totalPages: 2,
        number: 1,
      },
    ];

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(Admin);
  });

  afterEach(() =>{
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllUsers()', () => {
    it('should call the function with correct URL', () => {
      service.getAllUsers({ page: 4, size: 10, sort: '', direction: '' }).subscribe(res => {
        expect(res).toEqual(mockResponseUsers)
      });

      let req = httpTestingController.expectOne(req => req.url ===  `${url}/users`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponseUsers);
    });

    it('should set the params correctly', () => {
      service.getAllUsers({ page: 4, size: 10, sort: '', direction: '' }).subscribe((res) => {
          expect(res).toEqual(mockResponseUsers);
      });

      let req = httpTestingController.expectOne((req) => req.url === `${url}/users`);
      expect(req.request.params.get('page')).toBe('3');
      expect(req.request.params.get('size')).toBe('10');
      expect(req.request.params.get('sortBy')).toBe('');
      expect(req.request.params.get('direction')).toBe('');
      req.flush(mockResponseUsers);
    });

    it('should propagate HTTP errors', () => {
      service.getAllUsers({ page: 4, size: 10, sort: '', direction: '' }).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500)
      });

      let req = httpTestingController.expectOne((req) => req.url === `${url}/users`);
      req.flush('Server error', {status: 500, statusText: 'Internal Server Error'});
    });
  });

  describe('promoteToAdmin()', () => {
    it('should call the method correctly', () => {
      service.promoteToAdmin(id).subscribe(res => expect(res).toEqual(mockResponseUsers[0].content[0]));

      let req = httpTestingController.expectOne(`${url}/${id}/promote/admin`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toBe(id);
      req.flush(mockResponseUsers[0].content[0]);
    });

    it('should propagate HTTP errors', () => {
      service.promoteToAdmin(id).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500)
      });

      let req = httpTestingController.expectOne(`${url}/${id}/promote/admin`);
      req.flush('Server error', {status: 500, statusText: 'Internal Server Error'});
    });
  });

  describe('promoteToSuperAdmin()', () => {
    it('should call the method correctly', () => {
      service.promoteToSuperAdmin(id).subscribe(res => expect(res).toEqual(mockResponseUsers[0].content[0]));

      let req = httpTestingController.expectOne(`${url}/${id}/promote/super-admin`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toBe(id);
      req.flush(mockResponseUsers[0].content[0]);
    });

    it('should propagate HTTP errors', () => {
      service.promoteToSuperAdmin(id).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500)
      });

      let req = httpTestingController.expectOne(`${url}/${id}/promote/super-admin`);
      req.flush('Server error', {status: 500, statusText: 'Internal Server Error'});
    });
  });

  describe('deleteUser()', () => {
    it('should call method with the correct URL', () => {
      service.deleteUser(id).subscribe(void 0);

      let req = httpTestingController.expectOne(`${url}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should propagate errors', () => {
      service.deleteUser(id).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500)
      });

      let req = httpTestingController.expectOne(`${url}/${id}`);
      req.flush('Server error', {status: 500, statusText: 'Internal Server Error'});
    });
  });

});
