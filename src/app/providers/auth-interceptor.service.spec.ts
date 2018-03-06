import {async, fakeAsync, getTestBed, inject, TestBed, tick} from '@angular/core/testing';

import {AuthInterceptor} from './auth-interceptor.service';
import {NavbarDelegateService} from './navbar-delegate.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {Injector} from '@angular/core';
import {AuthService} from './auth.service';
import {authServiceStub} from '../../test/stubs/auth.service.stub.spec';

describe('AuthInterceptor', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthInterceptor,
        {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
        NavbarDelegateService,
        Injector,
        {provide: AuthService, useValue: authServiceStub}
      ],
      imports: [HttpClientTestingModule, HttpClientModule]
    });
  }));

  it('should catch 401 responses and try to reauth', fakeAsync(
    inject([HttpTestingController, AuthInterceptor, HttpClient, Injector],
      (backend: HttpTestingController, service: AuthInterceptor, http: HttpClient, injector: Injector) => {
        spyOn(service, 'addInfoBannerToNav');
        spyOn(service, 'removeInfoBannerFromNav');
        const auth: AuthService = injector.get(AuthService);
        http.get('/api/something').subscribe(() => {
          expect(service.addInfoBannerToNav).toHaveBeenCalled();
        }, null, () => {
          expect(service.removeInfoBannerFromNav).toHaveBeenCalled();
        });
        tick();
        backend.expectOne({
          url: '/api/something',
          method: 'GET'
        }).flush(null, {status: 401, statusText: '401'});
        expect(auth.authenticate).toHaveBeenCalled();
      })));

  it('should throw back any other received error that isnt from the /oauth/token endpoint', fakeAsync(
    inject([HttpTestingController, AuthInterceptor, HttpClient, Injector],
      (backend: HttpTestingController, service: AuthInterceptor, http: HttpClient) => {
        http.get('/oauth/token').subscribe(null, err => {
          expect(err).toBeDefined();
        });
        tick();
        backend.expectOne({
          url: '/oauth/token',
          method: 'GET'
        }).flush('Error to be thrown back', {status: 401, statusText: '401'});
      })));

  it('should provide a static method to check for token requests', () => {
    let url = 'http://mysite.com/oauth/token';
    expect(AuthInterceptor.isTokenRequest(url)).toEqual(true);
    url = 'http://some/other/page';
    expect(AuthInterceptor.isTokenRequest(url)).toEqual(false);
  });

  it('should provide a method to remove the info banner from the nav', () => {
    const nav = getTestBed().get(NavbarDelegateService);
    spyOn(nav, 'setInfoBannerMessage').and.stub();
    const authHttp = getTestBed().get(AuthInterceptor);
    authHttp.removeInfoBannerFromNav();
    expect(nav.setInfoBannerMessage).toHaveBeenCalledWith(null);
  });

  it('should provide a method to add an info banner from the nav', () => {
    const nav = getTestBed().get(NavbarDelegateService);
    spyOn(nav, 'setInfoBannerMessage').and.stub();
    const authHttp = getTestBed().get(AuthInterceptor);
    authHttp.addInfoBannerToNav();
    expect(nav.setInfoBannerMessage).toHaveBeenCalled();
  });
});
