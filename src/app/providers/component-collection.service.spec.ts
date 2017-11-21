import {fakeAsync, getTestBed, inject, TestBed, tick} from '@angular/core/testing';
import {BaseRequestOptions, Http, HttpModule, RequestMethod, ResponseOptions, ResponseType} from '@angular/http';
import {MockBackend} from '@angular/http/testing';
import {apiServiceStub} from '../../test/stubs/api.service.stub.spec';
import {authServiceStub} from '../../test/stubs/auth.service.stub.spec';
import {FileUploadTestingModule} from '../../modules/file-upload/file-upload-testing.module';
import {mockComponentCollectionData} from '../models/component-collection.spec';
import {ApiService} from './api.service';
import {AuthService} from './auth.service';

import {ComponentCollectionService} from './component-collection.service';

describe('ComponentCollectionService', () => {
  let mockBackend: MockBackend;

  beforeEach(() => {
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
        {provide: AuthService, useValue: authServiceStub},
        {provide: ApiService, useValue: apiServiceStub},
        ComponentCollectionService
      ],
      imports: [HttpModule, FileUploadTestingModule]
    });

    mockBackend = getTestBed().get(MockBackend);
  });

  it('should be created', inject([ComponentCollectionService], (service: ComponentCollectionService) => {
    expect(service).toBeTruthy();
  }));

  describe('UPDATE', () => {
    it('should provide a method to UPDATE', fakeAsync(
      inject([ComponentCollectionService], (service: ComponentCollectionService) => {
        mockBackend.connections.subscribe(connection => {
          connection.mockRespond(new Response(new ResponseOptions({
            body: JSON.stringify(mockComponentCollectionData)
          })));
          expect(connection.request.url).toEqual('/api/collections/1');
          expect(connection.request.method).toEqual(RequestMethod.Put);
          expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        });
        service.update(1, mockComponentCollectionData).subscribe(data => {
          expect(data).toBeDefined();
        });
        tick();
      })));

    it('should handle errors on UPDATE', fakeAsync(inject([ComponentCollectionService], (service: ComponentCollectionService) => {
      mockBackend.connections.subscribe(connection => {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 400,
          type: ResponseType.Error,
          body: JSON.stringify({errors: ['Bad Request']})
        })));
      });
      service.update(1, mockComponentCollectionData).subscribe(null, (err) => {
        expect(err.status).toEqual(400);
      });
      tick();
    })));
  });

  describe('CREATE', () => {
    it('should provide a method to CREATE', fakeAsync(
      inject([ComponentCollectionService], (service: ComponentCollectionService) => {
        mockBackend.connections.subscribe(connection => {
          connection.mockRespond(new Response(new ResponseOptions({
            body: JSON.stringify(mockComponentCollectionData)
          })));
          expect(connection.request.url).toEqual('/api/collections');
          expect(connection.request.method).toEqual(RequestMethod.Post);
          expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        });
        service.create(mockComponentCollectionData).subscribe(data => {
          expect(data).toBeDefined();
        });
        tick();
      })));

    it('should handle errors on CREATE', fakeAsync(inject([ComponentCollectionService], (service: ComponentCollectionService) => {
      mockBackend.connections.subscribe(connection => {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 400,
          type: ResponseType.Error,
          body: JSON.stringify({errors: ['Bad Request']})
        })));
      });
      service.create(mockComponentCollectionData).subscribe(null, (err) => {
        expect(err.status).toEqual(400);
      });
      tick();
    })));
  });
});
