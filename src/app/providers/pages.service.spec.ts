import {async, getTestBed, inject, TestBed} from '@angular/core/testing';
import {
  BaseRequestOptions,
  Http,
  HttpModule,
  RequestMethod,
  Response,
  ResponseOptions,
  ResponseType
} from '@angular/http';
import {MockBackend} from '@angular/http/testing';
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

  let mockBackend: MockBackend;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
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
        {provide: ApiService, useValue: apiServiceStub},
        {provide: AuthService, useValue: authServiceStub},
        PagesService,
      ],
      imports: [HttpModule]
    });

    mockBackend = getTestBed().get(MockBackend);
  }));

  it('should ...', inject([PagesService], (service: PagesService) => {
    expect(service).toBeTruthy();
  }));

  describe('get', () => {
    let connection;

    afterEach(() => {
      connection = null;
    });

    it('should get a page', async(inject([PagesService], (service: PagesService) => {
      mockGetSucceed();
      const auth = getTestBed().get(AuthService);
      service.get(mockPageResponse.id).subscribe((res: PageDataInterface) => {
        expect(res.id).toEqual(mockPageResponse.id);
        expect(res.title).toEqual(mockPageResponse.title);
        expect(res.description).toEqual(mockPageResponse.description);
        expect(connection.request.url).toEqual('/api/pages/1');
        expect(connection.request.method).toEqual(RequestMethod.Get);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should return an error if a page fails to get', async(inject([PagesService], (service: PagesService) => {
      mockGetFail();
      const auth = getTestBed().get(AuthService);
      service.get(mockPageResponse.id).subscribe(null, err => {
        expect(err).toBeDefined();
        expect(connection.request.url).toEqual('/api/pages/1');
        expect(connection.request.method).toEqual(RequestMethod.Get);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    function mockGetSucceed() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockRespond(new Response(new ResponseOptions({
          body: mockPageResponse
        })));
      });
    }

    function mockGetFail() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockRespond(new Response(new ResponseOptions({
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

    it('should create a page', async(inject([PagesService], (service: PagesService) => {
      mockGetSucceed();
      const auth = getTestBed().get(AuthService);
      service.create({
        title: 'MyTitle',
        description: 'My Descript',
        published: false,
        composition_id: 1,
        metadata: {}
      }).subscribe((res: any) => {
        expect(res.id).toEqual(mockPageResponse.id);
        expect(res.title).toEqual(mockPageResponse.title);
        expect(connection.request.url).toEqual('/api/pages');
        expect(connection.request.getBody()).toEqual(JSON.stringify({
          title: 'MyTitle',
          description: 'My Descript',
          published: false,
          composition_id: 1,
          metadata: {}
        }));
        expect(connection.request.method).toEqual(RequestMethod.Post);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should create a page with a cover/logo image', async(inject([PagesService], (service: PagesService) => {
      mockGetSucceed();
      const auth = getTestBed().get(AuthService);
      service.create({
        title: 'MyTitle',
        description: 'My Descript',
        published: false,
        composition_id: 1,
        metadata: {}
      }).subscribe((res: any) => {
        expect(res.id).toEqual(mockPageResponse.id);
        expect(res.title).toEqual(mockPageResponse.title);
        expect(connection.request.url).toEqual('/api/pages');
        expect(connection.request.getBody()).toEqual(JSON.stringify({
          title: 'MyTitle',
          description: 'My Descript',
          published: false,
          composition_id: 1,
          metadata: {}
        }));
        expect(connection.request.method).toEqual(RequestMethod.Post);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should return an error if a page fails to create', async(inject([PagesService], (service: PagesService) => {
      mockGetFail();
      const auth = getTestBed().get(AuthService);
      service.create({
        title: 'MyTitle',
        description: 'My Descript',
        published: false,
        composition_id: 1,
        metadata: {}
      }).subscribe(null, err => {
        expect(err).toBeDefined();
        expect(connection.request.url).toEqual('/api/pages');
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    function mockGetSucceed() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(mockPageResponse)
        })));
      });
    }

    function mockGetFail() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockRespond(new Response(new ResponseOptions({
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

    it('should update a composition', async(inject([PagesService], (service: PagesService) => {
      mockGetSucceed();
      const auth = getTestBed().get(AuthService);
      service.update(1, {
        title: 'MyPage2',
        description: 'New Description2',
        published: false
      }).subscribe((res: any) => {
        expect(res.id).toEqual(mockPageResponse.id);
        expect(res.title).toEqual(mockPageResponse.title);
        expect(connection.request.url).toEqual('/api/pages/1');
        expect(connection.request.getBody()).toEqual(JSON.stringify({
          title: 'MyPage2',
          description: 'New Description2',
          published: false
        }));
        expect(connection.request.method).toEqual(RequestMethod.Put);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should update a pages cover/logo image', async(inject([PagesService], (service: PagesService) => {
      mockGetSucceed();
      const auth = getTestBed().get(AuthService);
      service.update(1, {
        title: 'MySite',
        description: 'New Description',
        published: false
      }).subscribe((res: any) => {
        expect(res.id).toEqual(mockPageResponse.id);
        expect(res.title).toEqual(mockPageResponse.title);
        expect(connection.request.url).toEqual('/api/pages/1');
        expect(connection.request.getBody()).toEqual(JSON.stringify({
          title: 'MySite',
          description: 'New Description',
          published: false
        }));
        expect(connection.request.method).toEqual(RequestMethod.Put);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should return an error if a composition fails to update', async(inject([PagesService], (service: PagesService) => {
      mockGetFail();
      const auth = getTestBed().get(AuthService);
      service.update(1, {
        title: 'MySite',
        description: 'New Description',
        published: false
      }).subscribe(null, err => {
        expect(err).toBeDefined();
        expect(connection.request.url).toEqual('/api/pages/1');
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    function mockGetSucceed() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(mockPageResponse)
        })));
      });
    }

    function mockGetFail() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockRespond(new Response(new ResponseOptions({
          status: 400,
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

    it('should delete a page', async(inject([PagesService], (service: PagesService) => {
      mockGetSucceed();
      const auth = getTestBed().get(AuthService);
      service.destroy(1).subscribe((res: any) => {
        expect(res.status).toEqual(200);
        expect(connection.request.url).toEqual('/api/pages/1');
        expect(connection.request.method).toEqual(RequestMethod.Delete);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should return an error if a page fails to delete', async(inject([PagesService], (service: PagesService) => {
      mockGetFail();
      const auth = getTestBed().get(AuthService);
      service.destroy(1).subscribe(null, err => {
        expect(err).toBeDefined();
        expect(connection.request.url).toEqual('/api/pages/1');
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    function mockGetSucceed() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: JSON.stringify(mockPageResponse)
        })));
      });
    }

    function mockGetFail() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockRespond(new Response(new ResponseOptions({
          status: 400,
          body: JSON.stringify({
            errors: ['Bad request']
          })
        })));
      });
    }
  });

  describe('addComponentCollection', () => {
    let connection;

    afterEach(() => {
      connection = null;
    });

    it('should add a component collection', async(inject([PagesService], (service: PagesService) => {
      mockGetSucceed();
      const auth = getTestBed().get(AuthService);
      service.addComponentCollection(1, mockComponentCollectionData).subscribe((res: any) => {
        expect(connection.request.url).toEqual('/api/pages/1/collections');
        expect(connection.request.method).toEqual(RequestMethod.Post);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should return an error if a component collection fails to add', async(inject([PagesService], (service: PagesService) => {
      mockGetFail();
      const auth = getTestBed().get(AuthService);
      service.addComponentCollection(1, mockComponentCollectionData).subscribe(null, err => {
        expect(err).toBeDefined();
        expect(connection.request.url).toEqual('/api/pages/1/collections');
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    function mockGetSucceed() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: JSON.stringify(mockComponentCollectionData)
        })));
      });
    }

    function mockGetFail() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockRespond(new Response(new ResponseOptions({
          status: 400,
          body: JSON.stringify({
            errors: ['Bad request']
          })
        })));
      });
    }
  });

  describe('removeComponentCollection', () => {
    let connection;

    afterEach(() => {
      connection = null;
    });

    it('should remove a component collection', async(inject([PagesService], (service: PagesService) => {
      mockGetSucceed();
      const auth = getTestBed().get(AuthService);
      service.removeComponentCollection(1, 12).subscribe((res: any) => {
        expect(connection.request.url).toEqual('/api/pages/1/collections/12');
        expect(connection.request.method).toEqual(RequestMethod.Delete);
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    it('should return an error if a component collection fails to remove', async(inject([PagesService], (service: PagesService) => {
      mockGetFail();
      const auth = getTestBed().get(AuthService);
      service.removeComponentCollection(1, 12).subscribe(null, err => {
        expect(err).toBeDefined();
        expect(connection.request.url).toEqual('/api/pages/1/collections/12');
        expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        expect(connection.request.headers.get('Authorization')).toEqual(`Bearer ${auth.accessToken}`);
      });
    })));

    function mockGetSucceed() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: JSON.stringify(mockComponentCollectionData)
        })));
      });
    }

    function mockGetFail() {
      mockBackend.connections.subscribe(c => {
        connection = c;
        connection.mockRespond(new Response(new ResponseOptions({
          status: 400,
          body: JSON.stringify({
            errors: ['Bad request']
          })
        })));
      });
    }
  });
});
