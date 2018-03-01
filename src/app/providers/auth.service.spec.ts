import {async, fakeAsync, getTestBed, inject, TestBed, tick} from '@angular/core/testing';
import {BaseRequestOptions, Http, Response, ResponseOptions, ResponseType} from '@angular/http';
import {MockBackend} from '@angular/http/testing';
import {Observable} from 'rxjs/Observable';
import {apiServiceStub} from '../../test/stubs/api.service.stub.spec';
import {loginServiceStub} from '../../test/stubs/login.service.stub.spec';
import {storageStub} from '../../test/stubs/storage.stub.spec';
import {OAuthToken} from '../index';
import {User} from '../models/user';
import {ApiService} from './api.service';

import {AuthService} from './auth.service';
import {LoginService} from './login.service';
import {StorageService} from './storage.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {HttpClientModule} from '@angular/common/http';

describe('AuthService', () => {

  let mockBackend: MockBackend;
  const tokenResponse: OAuthToken = {
    access_token: '5678',
    token_type: 'bearer',
    created_at: (new Date().getTime() / 1000), // time in seconds
    expires_in: 300, // time in seconds
    refresh_token: '8910'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
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
        {provide: StorageService, useValue: storageStub},
        {provide: LoginService, useValue: loginServiceStub}
      ],
      imports: [HttpClientTestingModule, HttpClientModule]
    });
    mockBackend = getTestBed().get(MockBackend);
  });

  it('should instantiate', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));

  describe('Getters', () => {

    let service: AuthService;
    beforeEach((done) => {
      service = getTestBed().get(AuthService);

      mockBackend.connections.subscribe(connection => {

        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(tokenResponse)
        })));
      });

      service.authenticate('1234').then(() => {
        done();
      });
    });

    it('should provide a getter for the current user', () => {
      expect(service.currentUser).toBeDefined();
    });

    it('should provide a getter for the oauth token', () => {
      expect(service.token).toBeDefined();
    });

    it('should provide a getter for the access token', (done) => {
      expect(service.accessToken).toEqual(service.token.access_token);
      service.clear().then(() => {
        expect(service.accessToken).toEqual('');
        done();
      });
    });
  });

  describe('methods', () => {

    it('should provide a method to construct default http headers with the auth header', (done) => {
      const auth: AuthService = getTestBed().get(AuthService);
      mockBackend.connections.subscribe(connection => {

        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(tokenResponse)
        })));
      });

      let headers = auth.constructAuthHeader();
      expect(headers.get('Content-Type')).toEqual('application/json');
      expect(headers.get('Authorization')).toEqual(null);

      auth.authenticate('1234').then(() => {
        headers = auth.constructAuthHeader();

        expect(headers.get('Content-Type')).toEqual('application/json');
        expect(headers.get('Authorization')).toEqual(`Bearer ${tokenResponse.access_token}`);

        done();
      });
    });


    it('should provide a method to authenticate with a code', async(inject([AuthService], (service: AuthService) => {
      mockBackend.connections.subscribe(connection => {

        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(tokenResponse)
        })));

        expect(connection.request.url).toEqual('/oauth/token');
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.getBody()).toEqual(JSON.stringify({
          code: '1234',
          grant_type: 'authorization_code'
        }));
      });

      service.authenticateWithCode('1234').subscribe((res: Response) => {
        const token = res.json();
        expect(token.access_token).toEqual('5678');
        expect(token.token_type).toEqual('bearer');
        expect(token.expires_in).toBeDefined();
      });
    })));

    it('should provide a method to authenticate with a token', async(inject([AuthService], (service: AuthService) => {
      mockBackend.connections.subscribe(connection => {

        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify({
            username: 'joeschmoe',
            id: 1
          })
        })));

        expect(connection.request.url).toEqual('/api/me');
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
      });

      service.authenticateWithToken({access_token: '5678'} as OAuthToken).subscribe((res: Response) => {
        const user = res.json();
        expect(user.username).toEqual('joeschmoe');
        expect(user.id).toEqual(1);
      });
    })));

    it('should provide a method to authenticate with a refresh token', async(inject([AuthService], (service: AuthService) => {
      mockBackend.connections.subscribe(connection => {

        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(tokenResponse)
        })));

        expect(connection.request.url).toEqual('/oauth/token');
        expect(connection.request.getBody()).toEqual(JSON.stringify({
          refresh_token: '56789',
          grant_type: 'refresh_token'
        }));
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
      });

      service.authenticateWithRefreshToken({refresh_token: '56789'} as OAuthToken).subscribe((res: Response) => {
        const token = res.json();
        expect(token.access_token).toEqual('5678');
        expect(token.token_type).toEqual('bearer');
        expect(token.expires_in).toBeDefined();
      });
    })));
  });

  describe('Log out', () => {
    beforeEach(() => {
      // mock token response
      mockBackend.connections.subscribe(connection => {
        if (connection.request.url === '/oauth/token') {
          connection.mockRespond(new Response(new ResponseOptions({
            body: JSON.stringify({
              access_token: '5678',
              token_type: 'bearer',
              expires_in: new Date(new Date().getHours() + 60 * 1000).getTime(),
              refresh_token: '8910'
            })
          })));
        } else if (connection.request.url === '/api/me') {
          connection.mockRespond(new Response(new ResponseOptions({
            body: JSON.stringify({
              username: 'joe',
              id: 1,
              followers: [],
              following: [],
              avatar: {},
              additional: {}
            })
          })));
        }
      });
    });

    it('should clear authentication credentials', (done) => {
      inject([AuthService], (service: AuthService) => {
        service['_isReady'] = true;
        service.authenticate('1234').then(() => {
          service.clear().then(() => {
            service.currentUser$.subscribe((currentUser) => {
              expect(currentUser).toBeNull();
              expect(service.currentUser).toBeNull();
            });
            done();
          });
        });
      })();
    });
  });

  describe('Authentication on platform server', () => {

    it('should resolve null when auth is called', (done) => {
      const service = getTestBed().get(AuthService);
      spyOn(service, 'isPlatformServer').and.returnValue(true);
      service.authenticate().then(val => {
        expect(val).toBeNull();
        done();
      });
    });

    it('should return an error if no server token can be found', (done) => {
      const service = getTestBed().get(AuthService);
      spyOn(service, 'isPlatformServer').and.returnValue(true);
      service.authenticate().then(val => {
        expect(val).toBeDefined();
        done();
      }).catch(err => {
        expect(err).toBeDefined();
        done();
      });
    });
  });

  describe('authenticating with code', () => {

    beforeEach(() => {
      // mock token response
      mockBackend.connections.subscribe(connection => {
        if (connection.request.url === '/oauth/token') {
          connection.mockRespond(new Response(new ResponseOptions({
            body: JSON.stringify(tokenResponse)
          })));
        } else if (connection.request.url === '/api/me') {
          connection.mockRespond(new Response(new ResponseOptions({
            body: JSON.stringify({
              username: 'joe',
              id: 1,
              followers: [],
              following: [],
              avatar: {},
              additional: {}
            })
          })));
        }
      });
    });

    it('should call authenticateWithCode() if a code is passed in', async(inject([AuthService], (service: AuthService) => {
      service['_isReady'] = true;
      spyOn(service, 'authenticateWithCode').and.callThrough();
      service.authenticate('1234').then(() => {
        expect(service.authenticateWithCode).toHaveBeenCalled();
      });
    })));

    it('should save the token returned by authenticateWithCode', async(inject([AuthService], (service: AuthService) => {
      service['_isReady'] = true;
      service.authenticate('1234').then(() => {
        expect(service.token.access_token).toEqual('5678');
      });
    })));

    it('should return a cached user if one exists if no code is passed to authenticate()', async(
      inject([AuthService], (service: AuthService) => {
        service['_isReady'] = true;
        const user = new User(null);
        service['_currentUser'] = user;
        service.authenticate().then((u) => {
          expect(u).toEqual(user);
        });
      })));

    it('should send authentication request with the token requested', async(inject([AuthService], (service: AuthService) => {
      service['_isReady'] = true;
      spyOn(service, 'authenticateWithToken').and.callThrough();
      service.authenticate('1234').then(() => {
        expect(service.authenticateWithToken).toHaveBeenCalled();
      });
    })));

    it('should send authentication request with the token stored on disk', async(inject([AuthService], (service: AuthService) => {
      service['_isReady'] = true;
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

    it('should send authentication request with the cached token', async(inject([AuthService], (service: AuthService) => {
      service['_isReady'] = true;
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

    it('should cache the current user', async(inject([AuthService], (service: AuthService) => {
      service['_isReady'] = true;
      service.authenticate('1234').then(() => {
        expect(service.currentUser.id).toEqual(1);
      });
    })));
  });

  describe('refreshing credentials and handling expired/invalid tokens', () => {

    beforeEach(() => {
      // mock token response
      mockBackend.connections.subscribe(connection => {
        if (connection.request.url === '/oauth/token') {
          connection.mockRespond(new Response(new ResponseOptions({
            body: JSON.stringify(tokenResponse)
          })));
        }
      });
    });

    it('should perform a reauth if the stored access_token is expired', (done) => {
      inject([AuthService], (service: AuthService) => {
        service['_isReady'] = true;
        const storage = getTestBed().get(StorageService);
        storage.get.and.callFake(() => new Promise(resolve => {
          resolve({
            access_token: '1234',
            expires_in: 300,
            created_at: (new Date(0).getTime() / 1000), // time in seconds
            refresh_token: '5678'
          });
        }));

        mockBackend.connections.subscribe(connection => {
          if (connection.request.url === '/api/me') {
            connection.mockRespond(new Response(new ResponseOptions({
              body: JSON.stringify({
                username: 'joe',
                id: 1,
                followers: [],
                following: [],
                avatar: {},
                additional: {}
              })
            })));
          }
        });

        spyOn(service, 'authenticateWithRefreshToken').and.callThrough();
        service.authenticate().then(() => {
          expect(service.authenticateWithRefreshToken).toHaveBeenCalled();
          done();
        });
      })();
    });

    it('should perform a reauth if the call to authorization endpoint returns a 401', (done) => {
      inject([AuthService], (service: AuthService) => {
        service['_isReady'] = true;
        const storage = getTestBed().get(StorageService);
        storage.get.and.callFake(() => new Promise(resolve => {
          resolve({
            access_token: '1234',
            expires_in: 300,
            created_at: (new Date().getTime() / 1000), // time in seconds
            refresh_token: '5678'
          });
        }));

        mockBackend.connections.subscribe(connection => {
          if (connection.request.url === '/api/me') {
            connection.mockError(new Response(new ResponseOptions({
              body: null,
              type: ResponseType.Error,
              status: 401
            })));
          }
        });

        spyOn(service, 'authenticateWithRefreshToken').and.callThrough();
        // catch the promise because authenticate will quit after doAuthenticateWithToken fails the second time
        service.authenticate().catch(() => {
          expect(service.authenticateWithRefreshToken).toHaveBeenCalled();
          done();
        });
      })();
    });
  });

  describe('BehaviorSubject', () => {

    beforeEach(() => {
      // mock token response
      mockBackend.connections.subscribe(connection => {
        if (connection.request.url === '/oauth/token') {
          connection.mockRespond(new Response(new ResponseOptions({
            body: JSON.stringify({
              access_token: '5678',
              token_type: 'bearer',
              expires_in: new Date(new Date().getHours() + 60 * 1000).getTime(),
              refresh_token: '8910'
            })
          })));
        } else if (connection.request.url === '/api/me') {
          connection.mockRespond(new Response(new ResponseOptions({
            body: JSON.stringify({
              username: 'joe',
              id: 1,
              followers: [],
              following: [],
              avatar: {},
              additional: {}
            })
          })));
        }
      });
    });

    it('should publish user to observable upon successful auth', fakeAsync(inject([AuthService], (service: AuthService) => {
      service['_isReady'] = true;
      service.authenticate('1234');
      setTimeout(() => {
        service.currentUser$.subscribe((currentUser) => {
          expect(currentUser).toBeDefined();
          expect(currentUser).not.toBeNull();
        });
      });
      tick();
    })));

    it('should publish user to observable if cached', fakeAsync(inject([AuthService], (service: AuthService) => {
      service['_isReady'] = true;
      service['_currentUser'] = new User(null);
      service.authenticate();
      setTimeout(() => {
        service.currentUser$.subscribe((currentUser) => {
          expect(currentUser).toBeDefined();
          expect(currentUser).not.toBeNull();
        });
      });
      tick();
    })));

    it('should publish null to observable upon failed auth', fakeAsync(inject([AuthService], (service: AuthService) => {
      service['_isReady'] = true;
      spyOn(service, 'authenticateWithCode').and.callFake(() => new Observable(observer => {
        observer.error(new Response(new ResponseOptions({
          body: null,
          type: ResponseType.Error,
          status: 401
        })));
      }));
      service.authenticate('1234').catch(() => null);
      setTimeout(() => {
        service.currentUser$.subscribe((currentUser) => {
          expect(currentUser).toBeNull();
        });
      });
      tick();
    })));

    it('should publish null to observable upon failed auth', fakeAsync(inject([AuthService], (service: AuthService) => {
      service['_isReady'] = true;
      spyOn(service, 'authenticateWithToken').and.callFake(() => new Observable(observer => {
        observer.error(new Response(new ResponseOptions({
          body: null,
          type: ResponseType.Error,
          status: 400
        })));
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
    it('should publish null to observable if it fails to get a token', async(inject([AuthService], (service: AuthService) => {
      service['_isReady'] = true;
      const storage = getTestBed().get(StorageService);
      storage.get.and.callFake(() => new Promise(resolve => {
        resolve(null);
      }));
      service.authenticate().catch(() => {
      });
      setTimeout(() => {
        service.currentUser$.subscribe((currentUser) => {
          expect(currentUser).toBeNull();
        });
      });
    })));

    it('should handle fail during storeToken on doAuthWithToken', (done) => {
      inject([AuthService], (service: AuthService) => {

        // mock token response
        mockBackend.connections.subscribe(connection => {
          if (connection.request.url === '/oauth/token') {
            connection.mockRespond(new Response(new ResponseOptions({
              body: JSON.stringify({
                access_token: '5678',
                token_type: 'bearer',
                expires_in: new Date(new Date().getHours() + 60 * 1000).getTime(),
                refresh_token: '8910'
              })
            })));
          } else if (connection.request.url === '/api/me') {
            connection.mockRespond(new Response(new ResponseOptions({
              body: JSON.stringify({
                username: 'joe',
                id: 1,
                followers: [],
                following: [],
                avatar: {},
                additional: {}
              })
            })));
          }
        });

        service['_isReady'] = true;
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
          done();
        }));
        service.authenticate().catch(() => {
        });
      })();
    });

    it('should handle fail when token is expired and refresh auth fails', (done) => {
      inject([AuthService], (service: AuthService) => {

        // mock token response
        mockBackend.connections.subscribe(connection => {
          if (connection.request.url === '/oauth/token') {
            connection.mockError(new Response(new ResponseOptions({
              status: 401,
              type: ResponseType.Error
            })));
          } else if (connection.request.url === '/api/me') {
            connection.mockError(new Response(new ResponseOptions({
              status: 401,
              type: ResponseType.Error,
            })));
          }
        });

        service['_isReady'] = true;
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
          done();
        });
      })();
    });

    it('should handle fail when token is expired', (done) => {
      inject([AuthService], (service: AuthService) => {

        // mock token response
        let firstRun = true;
        mockBackend.connections.subscribe(connection => {
          if (connection.request.url === '/oauth/token') {
            if (firstRun) {
              firstRun = false;
              connection.mockRespond(new Response(new ResponseOptions({
                body: JSON.stringify({
                  access_token: '5678',
                  token_type: 'bearer',
                  expires_in: 300,
                  created_at: new Date(0).getTime() / 1000,
                  refresh_token: '8910'
                })
              })));
            } else {
              connection.mockError(new Response(new ResponseOptions({})));
            }

          } else if (connection.request.url === '/api/me') {
            connection.mockError(new Response(new ResponseOptions({
              status: 401,
              type: ResponseType.Error
            })));
          }
        });

        service['_isReady'] = true;
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
          done();
        });
      })();
    });

    it('should handle fail when doAuthWithToken fails', (done) => {
      inject([AuthService], (service: AuthService) => {

        // mock token response
        mockBackend.connections.subscribe(connection => {
          if (connection.request.url === '/oauth/token') {
            connection.mockRespond(new Response(new ResponseOptions({
              body: JSON.stringify({
                access_token: '5678',
                token_type: 'bearer',
                expires_in: 300,
                created_at: new Date(0).getTime() / 1000,
                refresh_token: '8910'
              })
            })));
          } else if (connection.request.url === '/api/me') {
            connection.mockRespond(new Response(new ResponseOptions({
              body: JSON.stringify({
                username: 'joe',
                id: 1,
                followers: [],
                following: [],
                avatar: {},
                additional: {}
              })
            })));
          }
        });

        service['_isReady'] = true;
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
          done();
        }));
        service.authenticate().catch(() => {
          done();
        });
      })();
    });
  });
});
