import {async, getTestBed, inject, TestBed} from '@angular/core/testing';
import {MockBackend} from '@angular/http/testing';
import {apiServiceStub} from '../../test/stubs/api.service.stub.spec';
import {authServiceStub} from '../../test/stubs/auth.service.stub.spec';
import {mockUserData} from '../models/user.spec';
import {ApiService} from './api.service';
import {AuthService} from './auth.service';

import {UserService} from './user.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpClientModule} from '@angular/common/http';

describe('UserService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        {provide: ApiService, useValue: apiServiceStub},
        {provide: AuthService, useValue: authServiceStub},
      ],
      imports: [HttpClientTestingModule, HttpClientModule]
    });
  });

  it('should be created', inject([UserService], (service: UserService) => {
    expect(service).toBeTruthy();
  }));

  describe('Update', () => {

    const user = mockUserData;
    const errorBody = {errors: ['Bad request']};

    it('should update a user', async(
      inject([UserService, HttpTestingController], (service: UserService, backend: HttpTestingController) => {
        service.update(user).subscribe(res => {
          expect(res).toEqual(user);
        });
        backend.expectOne({
          url: '/api/me',
          method: 'PUT'
        }).flush(user);
      })));

    it('should handle errors when updating a user', async(
      inject([UserService, HttpTestingController], (service: UserService, backend: HttpTestingController) => {
        service.update(user).subscribe(null, err => {
          expect(err).toBeDefined();
        });
        backend.expectOne({
          url: '/api/me',
          method: 'PUT'
        }).flush(errorBody, {status: 400, statusText: '400'});
      })));
  });

  describe('Update Photo', () => {
    const user = mockUserData;
    const errorBody = {errors: ['Bad request']};
    const photoData = 'base64:datablah';

    it('should update a users avatar', async(
      inject([UserService, HttpTestingController], (service: UserService, backend: HttpTestingController) => {
        service.updateUserPhoto(user.id, photoData).subscribe(res => {
          expect(res).toEqual(user);
        });
        backend.expectOne({
          url: '/api/users/' + user.id + '/avatar',
          method: 'POST'
        }).flush(user);
      })));

    it('should handle errors when updating a users avatar', async(
      inject([UserService, HttpTestingController], (service: UserService, backend: HttpTestingController) => {
        service.updateUserPhoto(user.id, photoData).subscribe(null, err => {
          expect(err).toBeDefined();
        });
        backend.expectOne({
          url: '/api/users/' + user.id + '/avatar',
          method: 'POST'
        }).flush(errorBody, {status: 400, statusText: '400'});
      })));
  });

  describe('Delete Account', () => {

    const user = mockUserData;
    const errorBody = {errors: ['Bad request']};

    it('should delete a users account', async(
      inject([UserService, HttpTestingController], (service: UserService, backend: HttpTestingController) => {
        service.deleteUser(user.id).subscribe(res => {
          expect(res).toBeDefined();
        });
        backend.expectOne({
          url: '/api/users/' + user.id,
          method: 'DELETE'
        }).flush(null);
      })));

    it('should handle errors when deleting an account', async(
      inject([UserService, HttpTestingController], (service: UserService, backend: HttpTestingController) => {
        service.deleteUser(user.id).subscribe(null, err => {
          expect(err).toBeDefined();
        });
        backend.expectOne({
          url: '/api/users/' + user.id,
          method: 'DELETE'
        }).flush(errorBody);
      })));
  });
});
