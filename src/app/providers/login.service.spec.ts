import {async, fakeAsync, getTestBed, inject, TestBed, tick} from '@angular/core/testing';
import {Headers} from '@angular/http';
import {Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {Observable} from 'rxjs/Observable';
import {authServiceStub} from '../../test/stubs/auth.service.stub.spec';
import {ORIGIN_URL} from '../index';
import {ApiService} from './api.service';
import {AuthService} from './auth.service';
import {LoginService} from './login.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpClient, HttpClientModule, HttpHeaders} from '@angular/common/http';

describe('LoginService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, HttpClientModule, RouterTestingModule],
      providers: [
        LoginService,
        {provide: ORIGIN_URL, useFactory: () => null},
        ApiService,
        {provide: AuthService, useValue: authServiceStub},
      ]
    });
  }));

  describe('doLogin', () => {

    it('should provide a method to login', inject([LoginService], (service: LoginService) => {
      expect(service.doLogin).toBeDefined();
    }));

    it('should check if an email is taken when doLogin is called',
      async(
        inject([LoginService], (service: LoginService) => {
          spyOn(service, 'doEmailCheck').and.callFake(() => {
            return new Promise(r => {
              r();
            });
          });
          spyOn(service, 'sendLoginRequest').and.callThrough();
          service.doLogin('myemail@example.com').then(() => {
            expect(service.sendLoginRequest).toHaveBeenCalled();
          });
        })));

    it('should call doRegistration if an email is taken', async(inject([LoginService], (service: LoginService) => {
      spyOn(service, 'doEmailCheck').and.callFake(() => {
        return new Promise((_, r) => {
          r();
        });
      });
      spyOn(service, 'doRegistration').and.callFake(() => {
        return new Promise(r => {
          r();
        });
      });
      service.doLogin('myemail@example.com').then(() => {
        expect(service.doRegistration).toHaveBeenCalled();
      });
    })));
  });

  describe('sendLoginRequest', () => {

    it('should send a auth code request to backend',
      fakeAsync(
        inject([LoginService, HttpTestingController], (service: LoginService, backend: HttpTestingController) => {
          service.sendLoginRequest('myemail@example.com');
          const request = backend.expectOne({
            url: '/oauth/authorize',
            method: 'POST'
          });
          request.flush(null);
          tick();
        })));
  });

  describe('doRegistration', () => {

    it('should send a POST /users request to backend',
      fakeAsync(
        inject([LoginService, ApiService, HttpTestingController], (service: LoginService, api: ApiService, backend: HttpTestingController) => {
          backend = getTestBed().get(HttpTestingController);
          service.doRegistration('myemail@example.com');
          const request = backend.expectOne({
            url: api.baseUrl + '/users',
            method: 'POST'
          });
          tick();
          request.flush(null);
        })));

    it('should reject promise if http call fails',
      fakeAsync(
        inject([LoginService, HttpClient, ApiService, HttpTestingController],
          (service: LoginService, http: HttpClient, api: ApiService, backend: HttpTestingController) => {
            spyOn(http, 'post').and.callThrough();
            spyOn(api, 'baseUrl').and.callThrough();
            service.doRegistration('myemail@example.com').catch(() => {
            });
            const request = backend.expectOne({
              url: api.baseUrl + '/users',
              method: 'POST'
            });
            request.flush(null, {status: 400, statusText: '400'});
            tick();
          })));
  });

  describe('doEmailCheck', () => {

    it('should send a POST /users/check request to backend',
      fakeAsync(
        inject([LoginService, ApiService, HttpClient, HttpTestingController],
          (service: LoginService, api: ApiService, http: HttpClient, backend: HttpTestingController) => {
            spyOn(http, 'post').and.callThrough();
            spyOn(api, 'baseUrl').and.callThrough();
            service.doEmailCheck('myemail@example.com');
            tick();
            backend.expectOne({
              url: api.baseUrl + '/users/check',
            }).flush(null);
          })));

    it('should handle http errors',
      fakeAsync(
        inject([LoginService, ApiService, HttpClient], (service: LoginService, api: ApiService, http: HttpClient) => {
          spyOn(http, 'post').and.callFake(() => {
            return Observable.create(observer => {
              observer.error(null);
            });
          });
          spyOn(api, 'baseUrl').and.callThrough();
          service.doEmailCheck('myemail@example.com').catch((err) => {
            expect(err).toBeUndefined();
          });
          tick();
        })));
  });

  describe('logout', () => {

    it('should clear the auth data',
      fakeAsync(
        inject([LoginService, HttpTestingController], (service: LoginService, backend: HttpTestingController) => {
          const auth = getTestBed().get(AuthService);
          const router = getTestBed().get(Router);
          spyOn(router, 'navigate');
          service.logout().then(() => {
            expect(auth.clear).toHaveBeenCalled();
            expect(router.navigate).toHaveBeenCalledWith(['/login']);
          });
          tick();
        })));
  });
});
