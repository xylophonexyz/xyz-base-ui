import {Injector} from '@angular/core';
import {async, getTestBed, TestBed} from '@angular/core/testing';
import {BaseRequestOptions, HttpModule, Response, ResponseOptions, ResponseType} from '@angular/http';
import {MockBackend} from '@angular/http/testing';
import {authServiceStub} from '../../test/stubs/auth.service.stub.spec';
import {AuthService} from './auth.service';

import {AuthenticatedHttpService} from './authenticated-http.service';
import {NavbarDelegateService} from './navbar-delegate.service';
import {navbarNotifierStub} from '../../test/stubs/navbar-notifier.service.stub.spec';

describe('AuthenticatedHttpService', () => {

  let mockBackend: MockBackend;

  // const mockInjector = createSpyObj('injector', 'get');

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        MockBackend,
        BaseRequestOptions,
        {
          provide: AuthenticatedHttpService,
          useFactory: (backend: MockBackend, options: BaseRequestOptions, injector: Injector) => {
            return new AuthenticatedHttpService(backend as any, options, injector);
          },
          deps: [MockBackend, BaseRequestOptions, Injector]
        },
        {provide: AuthService, useValue: authServiceStub},
        {provide: NavbarDelegateService, useValue: navbarNotifierStub}
      ],
      imports: [HttpModule]
    });
  }));

  it('should catch 401 responses and try to reauth', (done) => {
    const authHttp = getTestBed().get(AuthenticatedHttpService);
    const injector = getTestBed().get(Injector);
    const auth = getTestBed().get(AuthService);
    let numCalls = 0;
    mockBackend = getTestBed().get(MockBackend);
    mockBackend.connections.subscribe(connection => {
      if (numCalls === 0) {
        connection.mockError(new Response(new ResponseOptions({
          status: 401,
          type: ResponseType.Error,
          body: JSON.stringify({
            errors: ['Unauthorized']
          })
        })));
      } else {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          type: ResponseType.Basic,
          body: JSON.stringify({
            foo: 'bar'
          })
        })));
        done();
      }
      numCalls += 1;
    });
    spyOn(injector, 'get').and.returnValue(auth);
    spyOn(authHttp, 'request').and.callThrough();
    spyOn(authHttp, 'addInfoBannerToNav').and.stub();
    spyOn(authHttp, 'removeInfoBannerFromNav').and.stub();
    authHttp.get('idc.com').subscribe(null, () => {
      expect(authHttp.request).toHaveBeenCalled();
      expect(auth.authenticate).toHaveBeenCalled();
    });
  });

  it('should throw back any other received error', (done) => {
    const authHttp = getTestBed().get(AuthenticatedHttpService);
    mockBackend = getTestBed().get(MockBackend);
    mockBackend.connections.subscribe(connection => {
      connection.mockError(new Response(new ResponseOptions({
        status: 500,
        type: ResponseType.Error,
        body: JSON.stringify({
          errors: ['Unauthorized']
        })
      })));
    });
    spyOn(authHttp, 'request').and.callThrough();
    authHttp.get('idc.com').subscribe(null, () => {
      expect(authHttp.request).toHaveBeenCalled();
      done();
    });
  });

  it('should provide a static method to check for token requests', () => {
    let url = 'http://mysite.com/oauth/token';
    expect(AuthenticatedHttpService.isTokenRequest(url)).toEqual(true);
    url = 'http://some/other/page';
    expect(AuthenticatedHttpService.isTokenRequest(url)).toEqual(false);
  });

  it('should provide a method to remove the info banner from the nav', () => {
    const nav = getTestBed().get(NavbarDelegateService);
    spyOn(nav, 'setInfoBannerMessage').and.stub();
    const authHttp = getTestBed().get(AuthenticatedHttpService);
    authHttp.removeInfoBannerFromNav();
    expect(nav.setInfoBannerMessage).toHaveBeenCalledWith(null);
  });

  it('should provide a method to add an info banner from the nav', () => {
    const nav = getTestBed().get(NavbarDelegateService);
    spyOn(nav, 'setInfoBannerMessage').and.stub();
    const authHttp = getTestBed().get(AuthenticatedHttpService);
    authHttp.addInfoBannerToNav();
    expect(nav.setInfoBannerMessage).toHaveBeenCalled();
  });
});
