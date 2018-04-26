import {async, getTestBed, inject, TestBed} from '@angular/core/testing';
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
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpClientModule} from '@angular/common/http';
import {mockUserData} from '../models/user.spec';

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
  errors: [],
  user: mockUserData
};

export const mockCompositionData = Object.assign({}, mockCompositionResponse);
export const getMockCompositionData = () => Object.assign({}, mockCompositionResponse);

export function mockComposition(data: CompositionDataInterface = mockCompositionResponse) {
  return new Composition(mockCompositionResponse);
}

describe('SitesService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SitesService,
        {provide: ApiService, useValue: apiServiceStub},
        {provide: ComponentService, useValue: componentServiceStub},
        {provide: PagesService, useValue: pagesServiceStub},
        {provide: AuthService, useValue: authServiceStub}
      ],
      imports: [HttpClientTestingModule, HttpClientModule]
    });
  });

  describe('get', () => {

    it('should get a composition', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        service.get(mockCompositionResponse.id).subscribe((res: any) => {
          expect(res.id).toEqual(mockCompositionResponse.id);
          expect(res.title).toEqual(mockCompositionResponse.title);
        });
        mockGetSucceed(backend);
      })));

    it('should return an error if a composition fails to get', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        service.get(mockCompositionResponse.id).subscribe(null, err => {
          expect(err).toBeDefined();
        });
        mockGetFail(backend);
      })));

    function mockGetSucceed(backend) {
      backend.expectOne({
        url: '/api/compositions/1',
        method: 'GET'
      }).flush(mockCompositionResponse);
    }

    function mockGetFail(backend) {
      backend.expectOne({
        url: '/api/compositions/1',
        method: 'GET'
      }).flush({errors: ['Not found']}, {status: 404, statusText: '404'});
    }
  });

  describe('index', () => {

    it('should get compositions owned by the current user', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        service.all().subscribe((res: any) => {
          expect(res.length).toEqual(1);
          expect(res[0].id).toEqual(mockCompositionResponse.id);
          expect(res[0].title).toEqual(mockCompositionResponse.title);
        });
        mockGetSucceed(backend);
      })));

    it('should return an error if compositions fail to get', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        service.all().subscribe(null, err => {
          expect(err).toBeDefined();
        });
        mockGetFail(backend);
      })));

    function mockGetSucceed(backend) {
      backend.expectOne({
        url: '/api/me/compositions',
        method: 'GET'
      }).flush([mockCompositionResponse]);
    }

    function mockGetFail(backend) {
      backend.expectOne({
        url: '/api/me/compositions',
        method: 'GET'
      }).flush({errors: ['Not found']}, {status: 404, statusText: '404'});
    }
  });

  describe('create', () => {

    it('should create a composition', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        service.create({title: 'MySite', add_cover: false, publish: false}).subscribe((res: any) => {
          expect(res.id).toEqual(mockCompositionResponse.id);
          expect(res.title).toEqual(mockCompositionResponse.title);
        });
        mockPostSucceed(backend);
      })));

    it('should create a composition with a cover/logo image', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        service.create({title: 'MySite', add_cover: true, publish: false}).subscribe((res: any) => {
          expect(res.id).toEqual(mockCompositionResponse.id);
          expect(res.title).toEqual(mockCompositionResponse.title);
        });
        mockPostSucceed(backend);
      })));

    it('should return an error if a composition fails to create', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        service.create({title: null, add_cover: null, publish: false}).subscribe(null, err => {
          expect(err).toBeDefined();
        });
        mockPostFail(backend);
      })));

    it('should create an associated page object on create', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        const pagesProvider = getTestBed().get(PagesService);
        spyOn(pagesProvider, 'create').and.callFake(() => {
          return new Observable(subscriber => {
            subscriber.next(mockPageResponse);
          });
        });
        service.create({title: null, add_cover: null, publish: false}).subscribe(() => {
          expect(pagesProvider.create).toHaveBeenCalled();
        });
        mockPostSucceed(backend);
      })));

    it('should handle errors when creating an associated page object on create', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        const pagesProvider = getTestBed().get(PagesService);
        spyOn(pagesProvider, 'create').and.callFake(() => {
          return new Observable(subscriber => {
            subscriber.error(new Error('Bad Bad Bad'));
          });
        });
        service.create({title: null, add_cover: null, publish: false}).subscribe(null, () => {
          expect(pagesProvider.create).toHaveBeenCalled();
        });
        mockPostSucceed(backend);
      })));

    function mockPostSucceed(backend, title: string = 'MySite', addCover: boolean = false, publish: boolean = false) {
      backend.expectOne({
        method: 'POST',
        url: '/api/compositions'
      }).flush(mockCompositionResponse);
    }

    function mockPostFail(backend) {
      backend.expectOne({
        url: '/api/compositions',
        method: 'POST'
      }).flush({errors: ['Bad request']}, {status: 400, statusText: '400'});
    }
  });

  describe('update', () => {

    it('should update a composition', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        service.update(1, {title: 'MySite2', remove_cover: true, publish: false}).subscribe((res: any) => {
          expect(res.id).toEqual(mockCompositionResponse.id);
          expect(res.title).toEqual(mockCompositionResponse.title);
        });
        backend.expectOne({
          url: '/api/compositions/1',
          method: 'PUT'
        }).flush(mockCompositionResponse);
      })));

    it('should update a compositions cover/logo image', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        service.update(1, {title: 'MySite', add_cover: true, publish: false}).subscribe((res: any) => {
          expect(res.id).toEqual(mockCompositionResponse.id);
          expect(res.title).toEqual(mockCompositionResponse.title);
        });
        backend.expectOne({
          url: '/api/compositions/1',
          method: 'PUT'
        }).flush(mockCompositionResponse);
      })));

    it('should return an error if a composition fails to update', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        service.update(1, {title: null, remove_cover: null, publish: false}).subscribe(null, err => {
          expect(err).toBeDefined();
        });
        mockPutFail(backend);
      })));

    function mockPutFail(backend) {
      backend.expectOne({
        url: '/api/compositions/1',
        method: 'PUT'
      }).flush({errors: ['Bad request']}, {status: 400, statusText: '400'});
    }
  });

  describe('destroy', () => {

    it('should delete a composition', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        service.destroy(1).subscribe();
        backend.expectOne({
          url: '/api/compositions/1',
          method: 'DELETE'
        }).flush(null);
      })));

    it('should return an error if a composition fails to delete', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        service.destroy(1).subscribe(null, err => {
          expect(err).toBeDefined();
        });
        mockDeleteFail(backend);
      })));

    function mockDeleteFail(backend) {
      backend.expectOne({
        url: '/api/compositions/1',
        method: 'DELETE'
      }).flush({errors: ['Bad request']}, {status: 400, statusText: '400'});
    }
  });

  describe('publishing and unpublishing', () => {

    it('should publish a composition', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        service.publish(1, true).subscribe((res: any) => {
          expect(res.id).toEqual(mockCompositionResponse.id);
          expect(res.title).toEqual(mockCompositionResponse.title);
        });
        backend.expectOne({
          url: '/api/compositions/1',
          method: 'PUT'
        }).flush(mockCompositionResponse);
      })));

    it('should unpublish a composition', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        service.publish(1, false).subscribe((res: any) => {
          expect(res.id).toEqual(mockCompositionResponse.id);
          expect(res.title).toEqual(mockCompositionResponse.title);
        });
        backend.expectOne({
          url: '/api/compositions/1',
          method: 'PUT'
        }).flush(mockCompositionResponse);
      })));

    it('should return an error if a composition fails to publish/unpublish', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        service.publish(1, true).subscribe(null, err => {
          expect(err).toBeDefined();
        });
        mockPutFail(backend);
      })));

    function mockPutFail(backend) {
      backend.expectOne({
        url: '/api/compositions/1',
        method: 'PUT'
      }).flush({errors: ['Bad request']}, {status: 400, statusText: '400'});
    }
  });

  describe('linking/unlinking pages', () => {

    it('should link a page', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        service.link(1, 2, true).subscribe((res: any) => {
          expect(res.id).toEqual(mockCompositionResponse.id);
          expect(res.title).toEqual(mockCompositionResponse.title);
        });

        backend.expectOne({
          url: '/api/compositions/1/pages/2',
          method: 'POST'
        }).flush(mockCompositionResponse);
      })));

    it('should unlink a page', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        service.link(1, 2, false).subscribe((res: any) => {
          expect(res.id).toEqual(mockCompositionResponse.id);
          expect(res.title).toEqual(mockCompositionResponse.title);
        });
        backend.expectOne({
          url: '/api/compositions/1/pages/2',
          method: 'DELETE'
        }).flush(mockCompositionResponse);
      })));

    it('should return an error if a composition fails to link/unlink a page', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        service.link(1, 2, false).subscribe(null, err => {
          expect(err).toBeDefined();
        });
        mockDeleteFail(backend);
      })));

    function mockDeleteFail(backend) {
      backend.expectOne({
        url: '/api/compositions/1/pages/2',
        method: 'DELETE'
      }).flush({errors: ['Bad request']}, {status: 400, statusText: '400'});
    }
  });

  describe('adding and removing custom domains', () => {

    it('should add a custom domain', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        service.addCustomDomain(1, 'example.com').subscribe((res: any) => {
          expect(res.zoneId).toEqual('123');
          expect(res.nameServers).toEqual(['foo.bar']);
          expect(res.domainName).toEqual('example.com');
        });
        backend.expectOne({
          url: '/api/domains',
          method: 'POST'
        }).flush({
          zoneId: '123',
          domainName: 'example.com',
          nameServers: ['foo.bar']
        });
      })));

    it('should add a custom domain key pair', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        service.addDomainNameKeyPair(1, 'example.com', 'www').subscribe();

        backend.expectOne({
          url: '/api/domainMappings',
          method: 'POST'
        }).flush({
          zoneId: '123',
          domainName: 'example.com',
          nameServers: ['foo.bar']
        });
      })));

    it('should remove a custom domain', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        service.removeCustomDomain(1).subscribe();

        backend.expectOne({
          url: '/api/domains/1',
          method: 'DELETE'
        }).flush({
          zoneId: '123',
          domainName: 'example.com',
          nameServers: ['foo.bar']
        });
      })));

    it('should remove a custom domain key par', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        service.removeDomainNameKeyPair(1, 'foo.com', 'www').subscribe();

        backend.expectOne({
          url: '/api/domainMappings/1?domainName=foo.com&subdomain=www',
          method: 'DELETE'
        }).flush({
          zoneId: '123',
          domainName: 'example.com',
          nameServers: ['foo.bar']
        });
      })));

    it('should return an error if it fails to add a domain', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        service.addCustomDomain(1, 'example.com').subscribe(null, err => {
          expect(err).toBeDefined();
        });
        backend.expectOne({
          url: '/api/domains',
          method: 'POST'
        }).flush({errors: ['Bad request']}, {status: 400, statusText: '400'});
      })));
  });

  describe('uploading a logo', () => {

    it('should send a request to add a cover before uploading a logo', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
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

    it('should handle errors returned by the update method', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
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

    it('should handle errors returned by ComponentService', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
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

    it('should handle complete events returned by ComponentService', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
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
    it('should remove a logo', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
        spyOn(service, 'update').and.callFake(() => {
          return new Observable(subscriber => {
            subscriber.next({cover: {id: 2}});
          });
        });
        service.removeLogo(1).then(() => {
          expect(service.update).toHaveBeenCalled();
        });
      })));

    it('should handle errors when removing a logo', async(
      inject([SitesService, HttpTestingController], (service: SitesService, backend: HttpTestingController) => {
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
