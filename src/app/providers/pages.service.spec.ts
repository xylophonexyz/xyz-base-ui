import {async, getTestBed, inject, TestBed} from '@angular/core/testing';
import {apiServiceStub} from '../../test/stubs/api.service.stub.spec';
import {authServiceStub} from '../../test/stubs/auth.service.stub.spec';
import {PageDataInterface} from '../index';
import {mockComponentCollectionData} from '../models/component-collection.spec';
import {Page} from '../models/page';
import {mockUserData} from '../models/user.spec';
import {ApiService} from './api.service';
import {AuthService} from './auth.service';

import {PagesService} from './pages.service';
import {mockCompositionData} from './sites.service.spec';
import * as getSlug from 'speakingurl';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpClientModule} from '@angular/common/http';

export const mockPageResponse = {
  id: 1,
  title: 'MyTitle',
  description: 'My Descript',
  created_at: new Date().getTime(),
  updated_at: new Date().getTime(),
  published: false,
  cover: null,
  guessed_title: null,
  session: null,
  rating: 10000,
  comment_count: 0,
  views: 1,
  nods: [],
  metadata: {index: 0, showNav: false, navigationItem: false, hasTransparentHeader: false},
  user_id: mockUserData.id,
  user: Object.assign({}, mockUserData),
  page_id: 2,
  tags: [],
  composition_id: null,
  composition: mockCompositionData,
  errors: [],
  components: [
    mockComponentCollectionData
  ]
};
export const mockPageData = Object.assign({}, mockPageResponse);

export function mockPage(data: PageDataInterface = mockPageResponse) {
  return new Page(Object.assign({}, data));
}

describe('PagesService', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ApiService, useValue: apiServiceStub},
        {provide: AuthService, useValue: authServiceStub},
        PagesService
      ],
      imports: [HttpClientTestingModule, HttpClientModule]
    });
  }));

  it('should ...', inject([PagesService], (service: PagesService) => {
    expect(service).toBeTruthy();
  }));

  describe('get', () => {

    it('should get a page', async(
      inject([PagesService, HttpTestingController], (service: PagesService, backend: HttpTestingController) => {
        service.get(mockPageResponse.id).subscribe((res: PageDataInterface) => {
          expect(res.id).toEqual(mockPageResponse.id);
          expect(res.title).toEqual(mockPageResponse.title);
          expect(res.description).toEqual(mockPageResponse.description);
        });
        backend.expectOne({
          url: '/api/pages/1',
          method: 'GET'
        }).flush(mockPageResponse);
      })));

    it('should cache a page after the first get', async(
      inject([PagesService, HttpTestingController], (service: PagesService, backend: HttpTestingController) => {
        service.get(mockPageResponse.id).subscribe(() => {
          service.get(mockPageResponse.id).subscribe(() => {
          });
        });
        backend.expectOne({
          url: '/api/pages/1',
          method: 'GET'
        }).flush(mockPageResponse);
      })));

    it('should return an error if a page fails to get', async(
      inject([PagesService, HttpTestingController], (service: PagesService, backend: HttpTestingController) => {
        service.get(mockPageResponse.id).subscribe(null, err => {
          expect(err).toBeDefined();
        });
        backend.expectOne({
          url: '/api/pages/1',
          method: 'GET'
        }).flush({errors: ['Not found']}, {status: 400, statusText: '400'});
      })));
  });

  describe('create', () => {

    it('should create a page', async(
      inject([PagesService, HttpTestingController], (service: PagesService, backend: HttpTestingController) => {
        service.create({
          title: 'MyTitle',
          description: 'My Descript',
          published: false,
          composition_id: 1,
          metadata: {}
        }).subscribe((res: any) => {
          expect(res.id).toEqual(mockPageResponse.id);
          expect(res.title).toEqual(mockPageResponse.title);
        });
        backend.expectOne({
          url: '/api/pages',
          method: 'POST'
        }).flush(mockPageResponse);
      })));

    it('should create a page with a cover/logo image', async(
      inject([PagesService, HttpTestingController], (service: PagesService, backend: HttpTestingController) => {
        service.create({
          title: 'MyTitle',
          description: 'My Descript',
          published: false,
          composition_id: 1,
          metadata: {}
        }).subscribe((res: any) => {
          expect(res.id).toEqual(mockPageResponse.id);
          expect(res.title).toEqual(mockPageResponse.title);
        });
        backend.expectOne({
          url: '/api/pages',
          method: 'POST'
        }).flush(mockPageResponse);
      })));

    it('should return an error if a page fails to create', async(
      inject([PagesService, HttpTestingController], (service: PagesService, backend: HttpTestingController) => {
        service.create({
          title: 'MyTitle',
          description: 'My Descript',
          published: false,
          composition_id: 1,
          metadata: {}
        }).subscribe(null, err => {
          expect(err).toBeDefined();
        });
        backend.expectOne({
          url: '/api/pages',
          method: 'POST'
        }).flush({errors: ['Bad request']}, {status: 400, statusText: '400'});
      })));
  });

  describe('update', () => {

    it('should update a composition', async(
      inject([PagesService, HttpTestingController], (service: PagesService, backend: HttpTestingController) => {
        service.update(1, {
          title: 'MyPage2',
          description: 'New Description2',
          published: false
        }).subscribe((res: any) => {
          expect(res.id).toEqual(mockPageResponse.id);
          expect(res.title).toEqual(mockPageResponse.title);
        });
        backend.expectOne({
          url: '/api/pages/1',
          method: 'PUT'
        }).flush(mockPageResponse);
      })));

    it('should update a pages cover/logo image', async(
      inject([PagesService, HttpTestingController], (service: PagesService, backend: HttpTestingController) => {
        service.update(1, {
          title: 'MySite',
          description: 'New Description',
          published: false
        }).subscribe((res: any) => {
          expect(res.id).toEqual(mockPageResponse.id);
          expect(res.title).toEqual(mockPageResponse.title);
        });
        backend.expectOne({
          url: '/api/pages/1',
          method: 'PUT'
        }).flush(mockPageResponse);
      })));

    it('should return an error if a composition fails to update', async(
      inject([PagesService, HttpTestingController], (service: PagesService, backend: HttpTestingController) => {
        service.update(1, {
          title: 'MySite',
          description: 'New Description',
          published: false
        }).subscribe(null, err => {
          expect(err).toBeDefined();
        });
        backend.expectOne({
          url: '/api/pages/1',
          method: 'PUT'
        }).flush({errors: ['Bad request']}, {status: 400, statusText: '400'});
      })));
  });

  describe('destroy', () => {

    it('should delete a page', async(
      inject([PagesService, HttpTestingController], (service: PagesService, backend: HttpTestingController) => {
        service.destroy(1).subscribe();
        backend.expectOne({
          url: '/api/pages/1',
          method: 'DELETE'
        }).flush(null);
      })));

    it('should return an error if a page fails to delete', async(
      inject([PagesService, HttpTestingController], (service: PagesService, backend: HttpTestingController) => {
        service.destroy(1).subscribe(null, err => {
          expect(err).toBeDefined();
        });
        backend.expectOne({
          url: '/api/pages/1',
          method: 'DELETE'
        }).flush({errors: ['Bad Request']}, {status: 400, statusText: '400'});
      })));
  });

  describe('addComponentCollection', () => {

    it('should add a component collection', async(
      inject([PagesService, HttpTestingController], (service: PagesService, backend: HttpTestingController) => {
        service.addComponentCollection(1, mockComponentCollectionData).subscribe((res: any) => {
        });
        backend.expectOne({
          url: '/api/pages/1/collections',
          method: 'POST'
        }).flush(mockComponentCollectionData);
      })));

    it('should return an error if a component collection fails to add', async(
      inject([PagesService, HttpTestingController], (service: PagesService, backend: HttpTestingController) => {
        service.addComponentCollection(1, mockComponentCollectionData).subscribe(null, err => {
          expect(err).toBeDefined();
        });
        backend.expectOne({
          url: '/api/pages/1/collections',
          method: 'POST'
        }).flush({errors: ['Bad Request']}, {status: 400, statusText: '400'});
      })));
  });

  describe('removeComponentCollection', () => {

    it('should remove a component collection', async(
      inject([PagesService, HttpTestingController], (service: PagesService, backend: HttpTestingController) => {
        service.removeComponentCollection(1, 12).subscribe();
        backend.expectOne({
          url: '/api/pages/1/collections/12',
          method: 'DELETE'
        }).flush(mockComponentCollectionData);
      })));

    it('should return an error if a component collection fails to remove', async(
      inject([PagesService, HttpTestingController], (service: PagesService, backend: HttpTestingController) => {
        const auth = getTestBed().get(AuthService);
        service.removeComponentCollection(1, 12).subscribe(null, err => {
          expect(err).toBeDefined();
        });
        backend.expectOne({
          url: '/api/pages/1/collections/12',
          method: 'DELETE'
        }).flush({errors: ['Bad Request']}, {status: 400, statusText: '400'});
      })));
  });

  describe('static methods', () => {
    it('should provide a method to return an internal url', () => {
      const page = mockPage();
      expect(PagesService.getInternalPageUrl(page)).toEqual(`/p/${page.id}`);
    });

    it('should provide a method to return an a public url', () => {
      const page = mockPage();
      expect(PagesService.getPublicPageUrl(page)).toEqual(`/${getSlug(page.title)}-${page.id}`);
    });

    it('should fallback to an internal url if a page title is not avaialbel', () => {
      const page = mockPage();
      page.title = null;
      expect(PagesService.getPublicPageUrl(page)).toEqual(`/p/${page.id}`);
    });
  });
});
