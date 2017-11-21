import {async, fakeAsync, getTestBed, inject, TestBed, tick} from '@angular/core/testing';
import {BaseRequestOptions, Headers, Http, HttpModule, Response, ResponseOptions} from '@angular/http';
import {MockBackend} from '@angular/http/testing';
import {Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {Observable} from 'rxjs/Observable';
import {authServiceStub} from '../../test/stubs/auth.service.stub.spec';
import {ORIGIN_URL} from '../index';
import {ApiService} from './api.service';
import {AuthService} from './auth.service';
import {LoginService} from './login.service';

describe('LoginService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule, RouterTestingModule],
      providers: [
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          useFactory: (backend: MockBackend, options: BaseRequestOptions) => {
            return new Http(backend, options);
          },
          deps: [MockBackend, BaseRequestOptions]
        },
        LoginService,
        {provide: ORIGIN_URL, useFactory: () => null},
        ApiService,
        {provide: AuthService, useValue: authServiceStub},
      ]
    });
  }));

  let mockBackend: MockBackend;

  describe('doLogin', () => {

    beforeEach(() => {
      mockBackend = getTestBed().get(MockBackend);
      mockBackend.connections.subscribe(connection => {
        connection.mockRespond(new Response(new ResponseOptions({status: 200})));
      });
    });

    it('should provide a method to login', inject([LoginService], (service: LoginService) => {
      expect(service.doLogin).toBeDefined();
    }));

    it('should check if an email is taken when doLogin is called', async(inject([LoginService], (service: LoginService) => {
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

    beforeEach(() => {
      mockBackend = getTestBed().get(MockBackend);
      mockBackend.connections.subscribe(connection => {
        connection.mockRespond(new Response(new ResponseOptions({status: 200})));
      });
    });

    it('should send a auth code request to backend', fakeAsync(inject([LoginService], (service: LoginService) => {
      spyOn((service as any).http, 'post').and.callThrough();
      spyOn((service as any).api, 'authCodeUrl').and.callThrough();
      service.sendLoginRequest('myemail@example.com');
      tick();
      expect((service as any).http.post).toHaveBeenCalled();
    })));
  });

  describe('doRegistration', () => {

    it('should send a POST /users request to backend', fakeAsync(inject([LoginService], (service: LoginService) => {
      mockBackend = getTestBed().get(MockBackend);
      mockBackend.connections.subscribe(connection => {
        connection.mockRespond(new Response(new ResponseOptions({status: 200})));
      });
      spyOn((service as any).http, 'post').and.callThrough();
      spyOn((service as any).api, 'baseUrl').and.callThrough();
      service.doRegistration('myemail@example.com');
      tick();
      const args = [
        (service as any).api.baseUrl + '/users',
        JSON.stringify({email: 'myemail@example.com'}),
        {headers: new Headers({'Content-Type': 'application/json'})}
      ];
      expect((service as any).http.post).toHaveBeenCalledWith(args[0], args[1], args[2]);
    })));

    it('should reject promise if http call fails', fakeAsync(inject([LoginService], (service: LoginService) => {
      mockBackend = getTestBed().get(MockBackend);
      mockBackend.connections.subscribe(connection => {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 400
        })));
      });
      spyOn((service as any).http, 'post').and.callThrough();
      spyOn((service as any).api, 'baseUrl').and.callThrough();
      service.doRegistration('myemail@example.com').catch(() => {
        const args = [
          (service as any).api.baseUrl + '/users',
          JSON.stringify({email: 'myemail@example.com'}),
          {headers: new Headers({'Content-Type': 'application/json'})}
        ];
        expect((service as any).http.post).toHaveBeenCalledWith(args[0], args[1], args[2]);
      });
      tick();
    })));
  });

  describe('doEmailCheck', () => {

    beforeEach(() => {
      mockBackend = getTestBed().get(MockBackend);
      mockBackend.connections.subscribe(connection => {
        connection.mockRespond(new Response(new ResponseOptions({status: 200})));
      });
    });

    it('should send a POST /users/check request to backend', fakeAsync(inject([LoginService], (service: LoginService) => {
      spyOn((service as any).http, 'post').and.callThrough();
      spyOn((service as any).api, 'baseUrl').and.callThrough();
      service.doEmailCheck('myemail@example.com');
      tick();
      const args = [
        (service as any).api.baseUrl + '/users/check',
        JSON.stringify({email: 'myemail@example.com'}),
        {headers: new Headers({'Content-Type': 'application/json'})}
      ];
      expect((service as any).http.post).toHaveBeenCalledWith(args[0], args[1], args[2]);
    })));

    it('should handle http errors', fakeAsync(inject([LoginService], (service: LoginService) => {
      spyOn((service as any).http, 'post').and.callFake(() => {
        return Observable.create(observer => {
          observer.error(null);
        });
      });
      spyOn((service as any).api, 'baseUrl').and.callThrough();
      service.doEmailCheck('myemail@example.com').catch((err) => {
        expect(err).toBeUndefined();
      });
      tick();
    })));
  });

  describe('logout', () => {

    beforeEach(() => {
      mockBackend = getTestBed().get(MockBackend);
      mockBackend.connections.subscribe(connection => {
        connection.mockRespond(new Response(new ResponseOptions({status: 200})));
      });
    });

    it('should clear the auth data', fakeAsync(inject([LoginService], (service: LoginService) => {
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
