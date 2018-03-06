import {async, fakeAsync, getTestBed, inject, TestBed, tick} from '@angular/core/testing';
import {apiServiceStub} from '../../test/stubs/api.service.stub.spec';
import {loginServiceStub} from '../../test/stubs/login.service.stub.spec';
import {storageStub} from '../../test/stubs/storage.stub.spec';
import {OAuthToken} from '../index';
import {ApiService} from './api.service';

import {AuthService} from './auth.service';
import {LoginService} from './login.service';
import {StorageService} from './storage.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpClientModule, HttpResponse} from '@angular/common/http';
import {User} from '../models/user';
import {Observable} from 'rxjs/Observable';

describe('AuthService', () => {

  const tokenResponse: OAuthToken = {
    access_token: '5678',
    token_type: 'bearer',
    created_at: (new Date().getTime() / 1000), // time in seconds
    expires_in: 300, // time in seconds
    refresh_token: '8910'
  };
  const mockUserResponse = {
    username: 'joe',
    id: 1,
    followers: [],
    following: [],
    avatar: {},
    additional: {}
  };

  const mockAuthCode = '1234';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {provide: ApiService, useValue: apiServiceStub},
        {provide: StorageService, useValue: storageStub},
        {provide: LoginService, useValue: loginServiceStub}
      ],
      imports: [HttpClientTestingModule, HttpClientModule]
    });
  });

  it('should instantiate', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));

  describe('Getters', () => {

    it('should provide a getter for the current user', fakeAsync(
      inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {
        const user = new User(null);
        service['_currentUser'] = user;
        expect(service.currentUser).toBeDefined();
      })));

    it('should provide a getter for the oauth token', async(
      inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {
        service.authenticate(mockAuthCode).then(() => {
          expect(service.token).toBeDefined();
        });

        backend.expectOne({
          url: '/oauth/token',
          method: 'POST'
        }).flush(tokenResponse);
      })));

    it('should provide a getter for the access token', async(
      inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {
        service['_oauthToken'] = null;
        expect(service.accessToken).toEqual('');
        service['_oauthToken'] = tokenResponse;
        expect(service.accessToken).toEqual('5678');
      })));
  });

  describe('methods', () => {

    it('should provide a method to construct default http headers with the auth header', async(
      inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {

        let headers = service.constructAuthHeader();
        expect(headers.get('Content-Type')).toEqual('application/json');
        expect(headers.get('Authorization')).toEqual(null);

        service['_oauthToken'] = tokenResponse;

        headers = service.constructAuthHeader();
        expect(headers.get('Content-Type')).toEqual('application/json');
        expect(headers.get('Authorization')).toEqual(`Bearer ${tokenResponse.access_token}`);
      })));

    it('should provide a method to authenticate with a code', async(
      inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {

        service.authenticateWithCode(mockAuthCode).subscribe((token: any) => {
          expect(token.access_token).toEqual('5678');
          expect(token.token_type).toEqual('bearer');
          expect(token.expires_in).toBeDefined();
        });

        backend.expectOne({
          url: '/oauth/token',
          method: 'POST'
        }).flush(tokenResponse);
      })));

    it('should provide a method to authenticate with a token', async(
      inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {

        service.authenticateWithToken({access_token: '5678'} as OAuthToken).subscribe((user: any) => {
          expect(user.username).toEqual(mockUserResponse.username);
          expect(user.id).toEqual(1);
        });

        backend.expectOne({
          url: '/api/me',
          method: 'GET'
        }).flush(mockUserResponse);
      })));

    it('should provide a method to authenticate with a refresh token', async(
      inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {

        service.authenticateWithRefreshToken({refresh_token: '56789'} as OAuthToken).subscribe((token: any) => {
          expect(token.access_token).toEqual('5678');
          expect(token.token_type).toEqual('bearer');
          expect(token.expires_in).toBeDefined();
        });

        backend.expectOne({
          url: '/oauth/token',
          method: 'POST'
        }).flush(tokenResponse);
      })));
  });

  describe('Log out', () => {
    it('should clear authentication credentials', async(
      inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {
        service.authenticate(mockAuthCode).then(() => {
          service.clear().then(() => {
            service.currentUser$.subscribe((currentUser) => {
              expect(currentUser).toBeNull();
              expect(service.currentUser).toBeNull();
            });
          });
        });
        backend.expectOne({
          url: '/oauth/token',
          method: 'POST'
        }).flush(tokenResponse);
      })));
  });

  describe('Authentication on platform server', () => {

    it('should resolve null when auth is called', async(
      inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {
        spyOn(service, 'isPlatformServer').and.returnValue(true);
        service.authenticate().then(val => {
          expect(val).toBeNull();
        });
      })));

    it('should return an error if no server token can be found', async(
      inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {
        spyOn(service, 'isPlatformServer').and.returnValue(true);
        service.authenticate().then(val => {
          expect(val).toBeDefined();
        }).catch(err => {
          expect(err).toBeDefined();
        });
      })));
  });

  describe('authenticating with code', () => {

    it('should call authenticateWithCode() if a code is passed in', async(
      inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {
        spyOn(service, 'authenticateWithCode').and.callThrough();
        service.authenticate(mockAuthCode).then(() => {
          expect(service.authenticateWithCode).toHaveBeenCalled();
        });
        backend.expectOne({
          url: '/oauth/token',
          method: 'POST'
        }).flush(tokenResponse);
      })));

    it('should save the token returned by authenticateWithCode', async(
      inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {
        service.authenticate(mockAuthCode).then(() => {
          expect(service.token.access_token).toEqual('5678');
        });
        backend.expectOne({
          url: '/oauth/token',
          method: 'POST'
        }).flush(tokenResponse);
      })));

    it('should return a cached user if one exists if no code is passed to authenticate()', async(
      inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {
        const user = new User(null);
        service['_currentUser'] = user;
        service.authenticate().then((u) => {
          expect(u).toEqual(user);
        });
      })));

    it('should send authentication request with the token requested', async(
      inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {
        spyOn(service, 'authenticateWithToken').and.callFake(() => {
          return Observable.create(observer => {
            observer.next(mockUserResponse);
          });
        });
        service.authenticate(mockAuthCode).then(() => {
          expect(service.authenticateWithToken).toHaveBeenCalled();
        });
        backend.expectOne({
          url: '/oauth/token',
          method: 'POST'
        }).flush(tokenResponse);
      })));

    it('should send authentication request with the token stored on disk', async(
      inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {
        spyOn(service, 'authenticateWithToken').and.callThrough();
        const storage = getTestBed().get(StorageService);
        storage.get.and.callFake(() => new Promise(resolve => {
          resolve({
            access_token: '1234'
          });
        }));
        service.authenticate().then(() => {
          expect(service.authenticateWithToken).toHaveBeenCalled();
        });
      })));

    it('should send authentication request with the cached token', async(
      inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {
        service['_oauthToken'] = tokenResponse;
        spyOn(service, 'authenticateWithToken').and.callThrough();
        const storage = getTestBed().get(StorageService);
        storage.get.and.callFake(() => new Promise(resolve => {
          resolve({
            access_token: '1234'
          });
        }));
        service.authenticate().then(() => {
          expect(service.authenticateWithToken).toHaveBeenCalled();
        });
      })));

    it('should cache the current user', async(
      inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {
        service.authenticate('1234').then(() => {
          expect(service.currentUser.id).toEqual(1);
        });
      })));
  });

  describe('refreshing credentials and handling expired/invalid tokens', () => {

    it('should perform a reauth if the stored access_token is expired', async(
      inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {
        const storage = getTestBed().get(StorageService);
        storage.get.and.callFake(() => new Promise(resolve => {
          resolve({
            access_token: '1234',
            expires_in: 300,
            created_at: (new Date(0).getTime() / 1000), // time in seconds
            refresh_token: '5678'
          });
        }));

        spyOn(service, 'authenticateWithRefreshToken').and.callFake(() => {
          return Observable.create(observer => {
            observer.next(tokenResponse);
          });
        });
        service.authenticate().then(() => {
          expect(service.authenticateWithRefreshToken).toHaveBeenCalled();
        });
      })));
  });

  it('should perform a reauth if the call to authorization endpoint returns a 401', async(
    inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {
      const storage = getTestBed().get(StorageService);
      storage.get.and.callFake(() => new Promise(resolve => {
        resolve({
          access_token: '1234',
          expires_in: 300,
          created_at: (new Date().getTime() / 1000), // time in seconds
          refresh_token: '5678'
        });
      }));

      spyOn(service, 'authenticateWithRefreshToken').and.callThrough();
      // catch the promise because authenticate will quit after doAuthenticateWithToken fails the second time
      service.authenticate().catch(() => {
        expect(service.authenticateWithRefreshToken).toHaveBeenCalled();
      });
    })));

  describe('BehaviorSubject', () => {

    it('should publish user to observable upon successful auth', fakeAsync(
      inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {

        service.authenticate(mockAuthCode).then(() => {
          service.currentUser$.subscribe((currentUser) => {
            expect(currentUser).toBeDefined();
            expect(currentUser).not.toBeNull();
          });
        });

        backend.expectOne({
          url: '/oauth/token',
          method: 'POST'
        }).flush(tokenResponse);
        tick();
      })));

    it('should publish user to observable if cached', fakeAsync(
      inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {
        service['_currentUser'] = new User(null);
        service.authenticate().then(() => {
          service.currentUser$.subscribe((currentUser) => {
            expect(currentUser).toBeDefined();
            expect(currentUser).not.toBeNull();
          });
        });
        tick();
      })));

    it('should publish null to observable upon failed auth', fakeAsync(
      inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {
        spyOn(service, 'authenticateWithCode').and.callFake(() => new Observable(observer => {
          observer.error(new HttpResponse({
            body: null,
            status: 401
          }));
        }));
        service.authenticate('1234').catch(() => null);
        service.currentUser$.subscribe((currentUser) => {
          expect(currentUser).toBeNull();
        });
        tick();
      })));

    it('should publish null to observable upon failed auth', fakeAsync(
      inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {
        spyOn(service, 'authenticateWithToken').and.callFake(() => new Observable(observer => {
          observer.error(new HttpResponse({
            body: null,
            status: 400
          }));
        }));
        service.authenticate('1234').catch(() => null);
        setTimeout(() => {
          service.currentUser$.subscribe((currentUser) => {
            expect(currentUser).toBeNull();
          });
        });
        tick();
      })));
  });

  /**
   * these tests handle edge cases and are meant to increase code coverage. so if some of the tests seem
   * silly they are just to ensure that all code paths are being utilized
   */
  describe('Authentication Sad Paths', () => {
    it('should publish null to observable if it fails to get a token', async(
      inject([AuthService], (service: AuthService) => {

        const storage = getTestBed().get(StorageService);
        storage.get.and.callFake(() => new Promise(resolve => {
          resolve(null);
        }));
        service.authenticate().catch(() => {
          service.currentUser$.subscribe((currentUser) => {
            expect(currentUser).toBeNull();
          });
        });
      })));

    it('should handle fail during storeToken on doAuthWithToken', async(
      inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {
        const storage = getTestBed().get(StorageService);
        storage.get.and.callFake(() => new Promise(resolve => {
          resolve({
            access_token: '1234',
            expires_in: 300,
            created_at: (new Date().getTime() / 1000), // time in seconds
            refresh_token: '5678'
          });
        }));
        storage.set.and.callFake(() => new Promise((_, reject) => {
          reject(null);
        }));
        service.authenticate().catch(() => {
        });
      })));
  });

  it('should handle fail when token is expired and refresh auth fails', fakeAsync(
    inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {
      const storage = getTestBed().get(StorageService);
      storage.get.and.callFake(() => new Promise(resolve => {
        resolve({
          access_token: '1234',
          expires_in: 300,
          created_at: (new Date(0).getTime() / 1000), // time in seconds
          refresh_token: '5678'
        });
      }));
      spyOn(AuthService, 'isTokenExpired').and.returnValue(true);
      service.authenticate();
      tick();
    })));

  it('should handle fail when token is expired', async(
    inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {

      const storage = getTestBed().get(StorageService);
      storage.get.and.callFake(() => new Promise(resolve => {
        resolve({
          access_token: '1234',
          expires_in: 300,
          created_at: (new Date(0).getTime() / 1000), // time in seconds
          refresh_token: '5678'
        });
      }));
      service.authenticate().catch(() => {
      });
    })));

  it('should handle fail when doAuthWithToken fails', async(
    inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {

      const storage = getTestBed().get(StorageService);
      storage.get.and.callFake(() => new Promise(resolve => {
        resolve({
          access_token: '1234',
          expires_in: 300,
          created_at: (new Date(0).getTime() / 1000), // time in seconds
          refresh_token: '5678'
        });
      }));
      storage.set.and.callFake(() => new Promise((_, reject) => {
        reject(null);
      }));
      service.authenticate().catch(() => null);
    })));

  it('should handle authentication request failures', async(
    inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {
      spyOn(service, 'authenticateWithToken').and.callFake(() => {
        return Observable.create(observer => {
          observer.error({status: 401});
        });
      });
      spyOn(service, 'authenticateWithRefreshToken').and.callFake(() => {
        return Observable.create(observer => {
          observer.next(tokenResponse);
        });
      });
      service.authenticate(mockAuthCode).then(() => {
        expect(service.authenticateWithToken).toHaveBeenCalled();
      }, err => {

      });
      backend.expectOne({
        url: '/oauth/token',
        method: 'POST'
      }).flush(tokenResponse);
    })));

  it('should handle authentication request failures', async(
    inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {
      spyOn(service, 'authenticateWithToken').and.callFake(() => {
        return Observable.create(observer => {
          observer.error({status: 404});
        });
      });
      service.authenticate(mockAuthCode).then(() => {
        expect(service.authenticateWithToken).toHaveBeenCalled();
      }, err => {
        expect(err).toBeDefined();
      });
      backend.expectOne({
        url: '/oauth/token',
        method: 'POST'
      }).flush(tokenResponse);
    })));

  it('should handle authentication request failures', async(
    inject([HttpTestingController, AuthService], (backend: HttpTestingController, service: AuthService) => {
      spyOn(service, 'authenticateWithToken').and.callFake(() => {
        return Observable.create(observer => {
          observer.error({status: 401});
        });
      });
      spyOn(service, 'authenticateWithRefreshToken').and.callFake(() => {
        return Observable.create(observer => {
          observer.error({error: 'error'});
        });
      });
      service.authenticate(mockAuthCode).then(() => {
        expect(service.authenticateWithToken).toHaveBeenCalled();
      }, err => {
        expect(err).toBeDefined();
      });
      backend.expectOne({
        url: '/oauth/token',
        method: 'POST'
      }).flush(tokenResponse);
    })));
});
