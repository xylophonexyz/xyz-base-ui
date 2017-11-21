import {getTestBed, inject, TestBed} from '@angular/core/testing';
import {BaseRequestOptions, Http, HttpModule, RequestMethod, Response, ResponseOptions} from '@angular/http';
import {MockBackend, MockConnection} from '@angular/http/testing';
import {apiServiceStub} from '../../test/stubs/api.service.stub.spec';
import {authServiceStub} from '../../test/stubs/auth.service.stub.spec';
import {mockUserData} from '../models/user.spec';
import {ApiService} from './api.service';
import {AuthService} from './auth.service';

import {UserService} from './user.service';

describe('UserService', () => {

  let mockBackend: MockBackend;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          useFactory: (backend: MockBackend, options: BaseRequestOptions) => {
            return new Http(backend, options);
          },
          deps: [MockBackend, BaseRequestOptions]
        },
        {provide: ApiService, useValue: apiServiceStub},
        {provide: AuthService, useValue: authServiceStub}
      ],
      imports: [HttpModule]
    });
    mockBackend = getTestBed().get(MockBackend);
  });

  it('should be created', inject([UserService], (service: UserService) => {
    expect(service).toBeTruthy();
  }));

  describe('Update', () => {

    const user = mockUserData;
    const errorBody = {errors: ['Bad request']};

    it('should update a user', inject([UserService], (service: UserService) => {
      mockBackend.connections.subscribe(c => {
        expect(c.request.url).toEqual('/api/me');
        expect(c.request.method).toEqual(RequestMethod.Put);
        c.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: JSON.stringify(user)
        })));
      });
      service.update(user).subscribe(res => {
        expect(res).toEqual(user);
      });
    }));

    it('should handle errors when updating a user', inject([UserService], (service: UserService) => {
      mockBackend.connections.subscribe(c => {
        c.mockError(new Error(errorBody.errors[0]));
      });
      service.update(user).subscribe(null, err => {
        expect(err).toBeDefined();
      });
    }));
  });

  describe('Update Photo', () => {
    const user = mockUserData;
    const errorBody = {errors: ['Bad request']};
    const photoData = 'base64:datablah';

    it('should update a users avatar', inject([UserService], (service: UserService) => {
      mockBackend.connections.subscribe((c: MockConnection) => {
        expect(c.request.url).toEqual('/api/users/' + user.id + '/avatar');
        expect(c.request.method).toEqual(RequestMethod.Post);
        expect(JSON.parse(c.request.getBody())).toEqual({image_data_url: photoData});
        c.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: JSON.stringify(user)
        })));
      });
      service.updateUserPhoto(user.id, photoData).subscribe(res => {
        expect(res).toEqual(user);
      });
    }));

    it('should handle errors when updating a users avatar', inject([UserService], (service: UserService) => {
      mockBackend.connections.subscribe(c => {
        c.mockError(new Error(errorBody.errors[0]));
      });
      service.updateUserPhoto(user.id, photoData).subscribe(null, err => {
        expect(err).toBeDefined();
      });
    }));
  });

  describe('Delete Account', () => {

    const user = mockUserData;
    const errorBody = {errors: ['Bad request']};

    it('should delete a users account', inject([UserService], (service: UserService) => {
      mockBackend.connections.subscribe(c => {
        expect(c.request.url).toEqual('/api/users/' + user.id);
        expect(c.request.method).toEqual(RequestMethod.Delete);
        c.mockRespond(new Response(new ResponseOptions({
          status: 200
        })));
      });
      service.deleteUser(user.id).subscribe(res => {
        expect(res).toBeDefined();
      });
    }));

    it('should handle errors when deleting an account', inject([UserService], (service: UserService) => {
      mockBackend.connections.subscribe(c => {
        c.mockError(new Error(errorBody.errors[0]));
      });
      service.deleteUser(user.id).subscribe(null, err => {
        expect(err).toBeDefined();
      });
    }));
  });
});
