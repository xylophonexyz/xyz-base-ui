import {async, getTestBed, inject, TestBed} from '@angular/core/testing';
import {
  BaseRequestOptions, Http, HttpModule, RequestMethod, Response, ResponseOptions,
  ResponseType
} from '@angular/http';
import {MockBackend} from '@angular/http/testing';
import {Observable} from 'rxjs/Observable';
import {apiServiceStub} from '../../test/stubs/api.service.stub.spec';
import {authServiceStub} from '../../test/stubs/auth.service.stub.spec';
import {componentServiceStub} from '../../test/stubs/component.service.stub.spec';
import {pagesServiceStub} from '../../test/stubs/pages.service.stub.spec';
import {CompositionDataInterface} from '../index';
import {Composition} from '../models/composition';
import {ApiService} from './api.service';
import {AuthService} from './auth.service';
import {ComponentService} from './component.service';
import {PagesService} from './pages.service';
import {mockPageResponse} from './pages.service.spec';

import {SitesService} from './sites.service';

export const mockCompositionResponse: CompositionDataInterface = {
  id: 1,
  title: 'MySite',
  published_on: new Date().getTime(),
  published: false,
  updated_at: new Date().getTime(),
  created_at: new Date().getTime(),
  metadata: {},
  parent: null,
  cover: {media: {url: null}},
  compositions: [],
  pages: [],
  errors: []
};

export const mockCompositionData = Object.assign({}, mockCompositionResponse);
export const getMockCompositionData = () => Object.assign({}, mockCompositionResponse);

export function mockComposition(data: CompositionDataInterface = mockCompositionResponse) {
  return new Composition(mockCompositionResponse);
}

describe('SitesService', () => {

  let mockBackend: MockBackend;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SitesService,
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
        {provide: ComponentService, useValue: componentServiceStub},
        {provide: PagesService, useValue: pagesServiceStub},
        {provide: AuthService, useValue: authServiceStub},
      ],
      imports: [HttpModule]
    });

    mockBackend = getTestBed().get(MockBackend);
  });

  describe('get', () => {
    let connection;

    afterEach(() => {
      connection = null;
    });

    it('should get a composition', async(inject([SitesService], (service: SitesService) => {
      mockGetSucceed();
      const auth = getTestBed().get(AuthService);
      service.get(mockCompositionResponse.id).subscribe((res: any) => {
        expect(res.id).toEqual(mockCompositionResponse.id);
        expect(res.title).toEqual(mockCompositionResponse.title);
        expect(connection.request.url).toEqual('/api/compositions/1');
        expect(connection.request.method).toEqual(RequestMethod.Get);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should return an error if a composition fails to get', async(inject([SitesService], (service: SitesService) => {
      mockGetFail();
      const auth = getTestBed().get(AuthService);
      service.get(mockCompositionResponse.id).subscribe(null, err => {
        expect(err).toBeDefined();
        expect(connection.request.url).toEqual('/api/compositions/1');
        expect(connection.request.method).toEqual(RequestMethod.Get);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    function mockGetSucceed() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(mockCompositionResponse)
        })));
      });
    }

    function mockGetFail() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockError(new Response(new ResponseOptions({
          status: 404,
          type: ResponseType.Error,
          body: JSON.stringify({
            errors: ['Not found']
          })
        })));
      });
    }
  });

  describe('index', () => {
    let connection;

    afterEach(() => {
      connection = null;
    });

    it('should get compositions owned by the current user', async(inject([SitesService], (service: SitesService) => {
      mockGetSucceed();
      const auth = getTestBed().get(AuthService);
      service.all().subscribe((res: any) => {
        expect(res.length).toEqual(1);
        expect(res[0].id).toEqual(mockCompositionResponse.id);
        expect(res[0].title).toEqual(mockCompositionResponse.title);
        expect(connection.request.url).toEqual('/api/me/compositions');
        expect(connection.request.method).toEqual(RequestMethod.Get);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should return an error if compositions fail to get', async(inject([SitesService], (service: SitesService) => {
      mockGetFail();
      const auth = getTestBed().get(AuthService);
      service.all().subscribe(null, err => {
        expect(err).toBeDefined();
        expect(connection.request.url).toEqual('/api/me/compositions');
        expect(connection.request.method).toEqual(RequestMethod.Get);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    function mockGetSucceed() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify([mockCompositionResponse])
        })));
      });
    }

    function mockGetFail() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockError(new Response(new ResponseOptions({
          status: 404,
          type: ResponseType.Error,
          body: JSON.stringify({
            errors: ['Not found']
          })
        })));
      });
    }
  });

  describe('create', () => {
    let connection;

    afterEach(() => {
      connection = null;
    });

    it('should create a composition', async(inject([SitesService], (service: SitesService) => {
      mockGetSucceed();
      const auth = getTestBed().get(AuthService);
      service.create({title: 'MySite', add_cover: false, publish: false}).subscribe((res: any) => {
        expect(res.id).toEqual(mockCompositionResponse.id);
        expect(res.title).toEqual(mockCompositionResponse.title);
        expect(connection.request.url).toEqual('/api/compositions');
        expect(connection.request.getBody()).toEqual(JSON.stringify({
          title: 'MySite',
          add_cover: false,
          publish: false
        }));
        expect(connection.request.method).toEqual(RequestMethod.Post);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should create a composition with a cover/logo image', async(inject([SitesService], (service: SitesService) => {
      mockGetSucceed();
      const auth = getTestBed().get(AuthService);
      service.create({title: 'MySite', add_cover: true, publish: false}).subscribe((res: any) => {
        expect(res.id).toEqual(mockCompositionResponse.id);
        expect(res.title).toEqual(mockCompositionResponse.title);
        expect(connection.request.url).toEqual('/api/compositions');
        expect(connection.request.getBody()).toEqual(JSON.stringify({
          title: 'MySite',
          add_cover: true,
          publish: false
        }));
        expect(connection.request.method).toEqual(RequestMethod.Post);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should return an error if a composition fails to create', async(inject([SitesService], (service: SitesService) => {
      mockGetFail();
      const auth = getTestBed().get(AuthService);
      service.create({title: null, add_cover: null, publish: false}).subscribe(null, err => {
        expect(err).toBeDefined();
        expect(connection.request.url).toEqual('/api/compositions');
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should create an associated page object on create', async(inject([SitesService], (service: SitesService) => {
      mockGetSucceed();
      const pagesProvider = getTestBed().get(PagesService);
      spyOn(pagesProvider, 'create').and.callFake(() => {
        return new Observable(subscriber => {
          subscriber.next(mockPageResponse);
        });
      });
      service.create({title: null, add_cover: null, publish: false}).subscribe(() => {
        expect(pagesProvider.create).toHaveBeenCalled();
      });
    })));

    it('should handle errors when creating an associated page object on create', async(inject([SitesService], (service: SitesService) => {
      mockGetSucceed();
      const pagesProvider = getTestBed().get(PagesService);
      spyOn(pagesProvider, 'create').and.callFake(() => {
        return new Observable(subscriber => {
          subscriber.error(new Error('Bad Bad Bad'));
        });
      });
      service.create({title: null, add_cover: null, publish: false}).subscribe(null, err => {
        expect(pagesProvider.create).toHaveBeenCalled();
      });
    })));

    function mockGetSucceed() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(mockCompositionResponse)
        })));
      });
    }

    function mockGetFail() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockError(new Response(new ResponseOptions({
          status: 400,
          body: JSON.stringify({
            errors: ['Bad request']
          })
        })));
      });
    }
  });

  describe('update', () => {
    let connection;

    afterEach(() => {
      connection = null;
    });

    it('should update a composition', async(inject([SitesService], (service: SitesService) => {
      mockGetSucceed();
      const auth = getTestBed().get(AuthService);
      service.update(1, {title: 'MySite2', remove_cover: true, publish: false}).subscribe((res: any) => {
        expect(res.id).toEqual(mockCompositionResponse.id);
        expect(res.title).toEqual(mockCompositionResponse.title);
        expect(connection.request.url).toEqual('/api/compositions/1');
        expect(connection.request.getBody()).toEqual(JSON.stringify({
          title: 'MySite2',
          remove_cover: true,
          publish: false
        }));
        expect(connection.request.method).toEqual(RequestMethod.Put);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should update a compositions cover/logo image', async(inject([SitesService], (service: SitesService) => {
      mockGetSucceed();
      const auth = getTestBed().get(AuthService);
      service.update(1, {title: 'MySite', add_cover: true, publish: false}).subscribe((res: any) => {
        expect(res.id).toEqual(mockCompositionResponse.id);
        expect(res.title).toEqual(mockCompositionResponse.title);
        expect(connection.request.url).toEqual('/api/compositions/1');
        expect(connection.request.getBody()).toEqual(JSON.stringify({
          title: 'MySite',
          add_cover: true,
          publish: false
        }));
        expect(connection.request.method).toEqual(RequestMethod.Put);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should return an error if a composition fails to update', async(inject([SitesService], (service: SitesService) => {
      mockGetFail();
      const auth = getTestBed().get(AuthService);
      service.update(1, {title: null, remove_cover: null, publish: false}).subscribe(null, err => {
        expect(err).toBeDefined();
        expect(connection.request.url).toEqual('/api/compositions/1');
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    function mockGetSucceed() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(mockCompositionResponse)
        })));
      });
    }

    function mockGetFail() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockError(new Response(new ResponseOptions({
          status: 400,
          type: ResponseType.Error,
          body: JSON.stringify({
            errors: ['Bad request']
          })
        })));
      });
    }
  });

  describe('destroy', () => {
    let connection;

    afterEach(() => {
      connection = null;
    });

    it('should delete a composition', async(inject([SitesService], (service: SitesService) => {
      mockGetSucceed();
      const auth = getTestBed().get(AuthService);
      service.destroy(1).subscribe((res: any) => {
        expect(res.status).toEqual(200);
        expect(connection.request.url).toEqual('/api/compositions/1');
        expect(connection.request.method).toEqual(RequestMethod.Delete);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should return an error if a composition fails to delete', async(inject([SitesService], (service: SitesService) => {
      mockGetFail();
      const auth = getTestBed().get(AuthService);
      service.destroy(1).subscribe(null, err => {
        expect(err).toBeDefined();
        expect(connection.request.url).toEqual('/api/compositions/1');
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    function mockGetSucceed() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: JSON.stringify(mockCompositionResponse)
        })));
      });
    }

    function mockGetFail() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockError(new Response(new ResponseOptions({
          status: 400,
          body: JSON.stringify({
            errors: ['Bad request']
          })
        })));
      });
    }
  });

  describe('publishing and unpublishing', () => {
    let connection;

    afterEach(() => {
      connection = null;
    });

    it('should publish a composition', async(inject([SitesService], (service: SitesService) => {
      mockGetSucceed();
      const auth = getTestBed().get(AuthService);
      service.publish(1, true).subscribe((res: any) => {
        expect(res.id).toEqual(mockCompositionResponse.id);
        expect(res.title).toEqual(mockCompositionResponse.title);
        expect(connection.request.url).toEqual('/api/compositions/1');
        expect(connection.request.getBody()).toEqual(JSON.stringify({
          publish: true
        }));
        expect(connection.request.method).toEqual(RequestMethod.Put);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should unpublish a composition', async(inject([SitesService], (service: SitesService) => {
      mockGetSucceed();
      const auth = getTestBed().get(AuthService);
      service.publish(1, false).subscribe((res: any) => {
        expect(res.id).toEqual(mockCompositionResponse.id);
        expect(res.title).toEqual(mockCompositionResponse.title);
        expect(connection.request.url).toEqual('/api/compositions/1');
        expect(connection.request.getBody()).toEqual(JSON.stringify({
          publish: false
        }));
        expect(connection.request.method).toEqual(RequestMethod.Put);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should return an error if a composition fails to publish/unpublish', async(inject([SitesService], (service: SitesService) => {
      mockGetFail();
      const auth = getTestBed().get(AuthService);
      service.publish(1, true).subscribe(null, err => {
        expect(err).toBeDefined();
        expect(connection.request.url).toEqual('/api/compositions/1');
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    function mockGetSucceed() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(mockCompositionResponse)
        })));
      });
    }

    function mockGetFail() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockError(new Response(new ResponseOptions({
          status: 400,
          body: JSON.stringify({
            errors: ['Bad request']
          })
        })));
      });
    }
  });

  describe('linking/unlinking pages', () => {
    let connection;

    afterEach(() => {
      connection = null;
    });

    it('should link a page', async(inject([SitesService], (service: SitesService) => {
      mockGetSucceed();
      const auth = getTestBed().get(AuthService);
      service.link(1, 2, true).subscribe((res: any) => {
        expect(res.id).toEqual(mockCompositionResponse.id);
        expect(res.title).toEqual(mockCompositionResponse.title);
        expect(connection.request.url).toEqual('/api/compositions/1/pages/2');
        expect(connection.request.method).toEqual(RequestMethod.Post);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should unlink a page', async(inject([SitesService], (service: SitesService) => {
      mockGetSucceed();
      const auth = getTestBed().get(AuthService);
      service.link(1, 2, false).subscribe((res: any) => {
        expect(res.id).toEqual(mockCompositionResponse.id);
        expect(res.title).toEqual(mockCompositionResponse.title);
        expect(connection.request.url).toEqual('/api/compositions/1/pages/2');
        expect(connection.request.method).toEqual(RequestMethod.Delete);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should return an error if a composition fails to link/unlink a page', async(inject([SitesService], (service: SitesService) => {
      mockGetFail();
      const auth = getTestBed().get(AuthService);
      service.link(1, 2, false).subscribe(null, err => {
        expect(err).toBeDefined();
        expect(connection.request.url).toEqual('/api/compositions/1/pages/2');
        expect(connection.request.method).toEqual(RequestMethod.Delete);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    function mockGetSucceed() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(mockCompositionResponse)
        })));
      });
    }

    function mockGetFail() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockError(new Response(new ResponseOptions({
          status: 400,
          body: JSON.stringify({
            errors: ['Bad request']
          })
        })));
      });
    }
  });

  describe('adding and removing custom domains', () => {
    let connection;

    afterEach(() => {
      connection = null;
    });

    it('should add a custom domain', async(inject([SitesService], (service: SitesService) => {
      mockSucceed();
      const auth = getTestBed().get(AuthService);
      service.addCustomDomain(1, 'example.com').subscribe((res: any) => {
        expect(res.zoneId).toEqual('123');
        expect(res.nameServers).toEqual(['foo.bar']);
        expect(res.domainName).toEqual('example.com');
        expect(connection.request.url).toEqual('/api/domains');
        expect(connection.request.method).toEqual(RequestMethod.Post);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should add a custom domain key pair', async(inject([SitesService], (service: SitesService) => {
      mockSucceed();
      const auth = getTestBed().get(AuthService);
      service.addDomainNameKeyPair(1, 'example.com', 'www').subscribe((res: any) => {
        expect(connection.request.url).toEqual('/api/domainMappings');
        expect(connection.request.method).toEqual(RequestMethod.Post);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should remove a custom domain', async(inject([SitesService], (service: SitesService) => {
      mockSucceed();
      const auth = getTestBed().get(AuthService);
      service.removeCustomDomain(1).subscribe((res: any) => {
        expect(connection.request.url).toEqual('/api/domains/1');
        expect(connection.request.method).toEqual(RequestMethod.Delete);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should remove a custom domain key par', async(inject([SitesService], (service: SitesService) => {
      mockSucceed();
      const auth = getTestBed().get(AuthService);
      service.removeDomainNameKeyPair(1, 'foo.com', 'www').subscribe((res: any) => {
        expect(connection.request.url).toEqual('/api/domainMappings/1?domainName=foo.com&subdomain=www');
        expect(connection.request.method).toEqual(RequestMethod.Delete);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should return an error if it fails to add a domain', async(inject([SitesService], (service: SitesService) => {
      mockPostFail();
      const auth = getTestBed().get(AuthService);
      service.addCustomDomain(1, 'example.com').subscribe(null, err => {
        expect(err).toBeDefined();
        expect(connection.request.url).toEqual('/api/domains');
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    function mockSucceed() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify({
            zoneId: '123',
            domainName: 'example.com',
            nameServers: ['foo.bar']
          })
        })));
      });
    }

    function mockPostFail() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockError(new Response(new ResponseOptions({
          status: 400,
          body: JSON.stringify({
            errors: ['Bad request']
          })
        })));
      });
    }
  });

  describe('uploading a logo', () => {
    let connection;

    afterEach(() => {
      connection = null;
    });

    it('should send a request to add a cover before uploading a logo', async(inject([SitesService], (service: SitesService) => {
        const component = getTestBed().get(ComponentService);
        spyOn(service, 'update').and.callFake(() => {
          return new Observable(subscriber => {
            subscriber.next({cover: {id: 2}});
          });
        });
        spyOn(component, 'upload').and.callThrough();
        service.uploadLogo(1, null, null).then(() => {
          expect(service.update).toHaveBeenCalledWith(1, {add_cover: true});
          expect(component.upload).toHaveBeenCalled();
        });
      }))
    );

    it('should handle errors returned by the update method', async(inject([SitesService], (service: SitesService) => {
        const component = getTestBed().get(ComponentService);
        spyOn(service, 'update').and.callFake(() => {
          return new Observable(subscriber => {
            subscriber.error(new Error('Bad Request'));
          });
        });
        spyOn(component, 'upload').and.callThrough();
        service.uploadLogo(1, null, null).catch((err) => {
          expect(err.message).toEqual('Bad Request');
        });
      }))
    );

    it('should handle errors returned by ComponentService', async(inject([SitesService], (service: SitesService) => {
        const component = getTestBed().get(ComponentService);
        spyOn(service, 'update').and.callFake(() => {
          return new Observable(subscriber => {
            subscriber.next({cover: {id: 2}});
          });
        });
        spyOn(component, 'upload').and.callFake(() => {
          return new Observable(subscriber => {
            subscriber.error(new Error('Bad Request'));
          });
        });
        service.uploadLogo(1, null, null).catch((err) => {
          expect(err.message).toEqual('Bad Request');
        });
      }))
    );

    it('should handle complete events returned by ComponentService', async(inject([SitesService], (service: SitesService) => {
        const component = getTestBed().get(ComponentService);
        spyOn(service, 'update').and.callFake(() => {
          return new Observable(subscriber => {
            subscriber.next({cover: {id: 2}});
          });
        });
        spyOn(component, 'upload').and.callFake(() => {
          return new Observable(subscriber => {
            subscriber.complete();
          });
        });
        service.uploadLogo(1, null, null).then(() => {
          expect(component.upload).toHaveBeenCalled();
        });
      }))
    );
  });

  describe('Removing a logo', () => {
    it('should remove a logo', async(inject([SitesService], (service: SitesService) => {
      spyOn(service, 'update').and.callFake(() => {
        return new Observable(subscriber => {
          subscriber.next({cover: {id: 2}});
        });
      });
      service.removeLogo(1).then(() => {
        expect(service.update).toHaveBeenCalled();
      });
    })));

    it('should handle errors when removing a logo', async(inject([SitesService], (service: SitesService) => {
      spyOn(service, 'update').and.callFake(() => {
        return new Observable(subscriber => {
          subscriber.error(new Error('mock error removing logo'));
        });
      });
      service.removeLogo(1).catch(() => {
        expect(service.update).toHaveBeenCalled();
      });
    })));
  });
});
