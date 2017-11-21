import {fakeAsync, getTestBed, inject, TestBed, tick} from '@angular/core/testing';
import {BaseRequestOptions, Http, HttpModule, RequestMethod, ResponseOptions, ResponseType} from '@angular/http';
import {MockBackend} from '@angular/http/testing';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {apiServiceStub} from '../../test/stubs/api.service.stub.spec';
import {authServiceStub} from '../../test/stubs/auth.service.stub.spec';
import {FileUploadTestingModule} from '../../modules/file-upload/file-upload-testing.module';
import {FileUploadService} from '../../modules/file-upload/file-upload.service';
import {ComponentDataInterface} from '../index';
import {mockComponentData} from '../models/component.spec';
import {ApiService} from './api.service';
import {AuthService} from './auth.service';

import {ComponentService} from './component.service';

describe('ComponentService', () => {

  let mockBackend: MockBackend;

  const mockComponent: ComponentDataInterface = {
    id: 1,
    type: 'Component',
    media: {},
    media_processing: false,
    index: 0,
    metadata: {} as any,
    component_collection_id: 1,
    created_at: new Date().getTime(),
    updated_at: new Date().getTime()
  };

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
        ComponentService
      ],
      imports: [HttpModule, FileUploadTestingModule]
    });

    mockBackend = getTestBed().get(MockBackend);
  });

  it('should ...', inject([ComponentService], (service: ComponentService) => {
    expect(service).toBeTruthy();
  }));

  describe('GET', () => {
    it('should provide a method to GET', fakeAsync(
      inject([ComponentService], (service: ComponentService) => {
        mockBackend.connections.subscribe(connection => {
          connection.mockRespond(new Response(new ResponseOptions({
            body: JSON.stringify(mockComponent)
          })));
          expect(connection.request.url).toEqual('/api/components/1');
          expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        });
        service.get(1).subscribe(data => {
          expect(data).toBeDefined();
        });
        tick();
      })));

    it('should handle errors on GET', fakeAsync(inject([ComponentService], (service: ComponentService) => {
      mockBackend.connections.subscribe(connection => {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 400,
          type: ResponseType.Error,
          body: JSON.stringify({errors: ['Bad Request']})
        })));
      });
      service.get(1).subscribe(null, (err) => {
        expect(err.status).toEqual(400);
      });
      tick();
    })));
  });

  describe('UPDATE', () => {
    it('should provide a method to UPDATE', fakeAsync(
      inject([ComponentService], (service: ComponentService) => {
        mockBackend.connections.subscribe(connection => {
          connection.mockRespond(new Response(new ResponseOptions({
            body: JSON.stringify(mockComponent)
          })));
          expect(connection.request.url).toEqual('/api/components/1');
          expect(connection.request.method).toEqual(RequestMethod.Put);
          expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
        });
        service.update(1, mockComponentData).subscribe(data => {
          expect(data).toBeDefined();
        });
        tick();
      })));

    it('should handle errors on UPDATE', fakeAsync(inject([ComponentService], (service: ComponentService) => {
      mockBackend.connections.subscribe(connection => {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 400,
          type: ResponseType.Error,
          body: JSON.stringify({errors: ['Bad Request']})
        })));
      });
      service.update(1, mockComponentData).subscribe(null, (err) => {
        expect(err.status).toEqual(400);
      });
      tick();
    })));
  });

  describe('Process', () => {
    it('should provide a method to "process" a component', fakeAsync(
      inject([ComponentService], (service: ComponentService) => {
        mockBackend.connections.subscribe(connection => {
          if (connection.request.url === '/api/components/1') {
            connection.mockRespond(new Response(new ResponseOptions({
              body: JSON.stringify(mockComponent)
            })));
          } else {
            connection.mockRespond(new Response(new ResponseOptions({
              status: 200
            })));
            expect(connection.request.url).toEqual('/api/components/1/process');
            expect(connection.request.headers.get('Content-Type')).toEqual('application/json');
          }
        });
        spyOn(service, 'get').and.callFake(() => {
          return new Observable(subscriber => {
            subscriber.next(mockComponent);
          });
        });
        service.process(1).subscribe((data) => {
          expect(data).toEqual(mockComponent);
        });
        tick();
      }))
    );

    it('should handle errors when "processing" a component', (done) => {
      inject([ComponentService], (service: ComponentService) => {
        mockBackend.connections.subscribe(connection => {
          connection.mockError(new Error('Bad Request'));
        });
        spyOn(service, 'get').and.callFake(() => {
          return new Observable(subscriber => {
            subscriber.next(mockComponent);
          });
        });
        service.process(1).subscribe(null, (err) => {
          expect(err.message).toEqual('Bad Request');
          done();
        });
      })();
    });

    it('should poll if a component is not yet ready', fakeAsync(
      inject([ComponentService], (service: ComponentService) => {
        mockBackend.connections.subscribe(connection => {
          if (connection.request.url === '/api/components/1/process') {
            connection.mockRespond(new Response(new ResponseOptions({
              status: 200
            })));
          }
        });
        const spy = spyOn(service, 'get').and.callFake(() => {
          return new Observable(subscriber => {
            mockComponent.media_processing = (spy.calls.count() === 1);
            subscriber.next(mockComponent);
            tick(ComponentService.POLLING_INTERVAL);
          });
        });
        service.process(1).subscribe(null, null, () => {
          expect(spy.calls.count()).toEqual(2);
        });
        tick(ComponentService.POLLING_INTERVAL);
      }))
    );

    it('should handle errors if polling request fails', fakeAsync(
      inject([ComponentService], (service: ComponentService) => {
        mockBackend.connections.subscribe(connection => {
          if (connection.request.url === '/api/components/1/process') {
            connection.mockRespond(new Response(new ResponseOptions({
              status: 200
            })));
          }
        });
        const spy = spyOn(service, 'get').and.callFake(() => {
          return new Observable(subscriber => {
            subscriber.error(new Error('Bad Request'));
            tick(ComponentService.POLLING_INTERVAL);
          });
        });
        service.process(1).subscribe(null, (err) => {
          expect(err.message).toEqual('Bad Request');
          expect(spy.calls.count()).toEqual(1);
        });
        tick(ComponentService.POLLING_INTERVAL);
      }))
    );
  });

  describe('Upload', () => {
    it('should use file upload service to upload files', fakeAsync(inject([ComponentService], (service: ComponentService) => {
      const fileUploadService = getTestBed().get(FileUploadService);
      spyOn(fileUploadService, 'upload').and.callThrough();
      spyOn(service, 'process').and.callFake(() => {
        return new Observable(subscriber => {
          subscriber.complete();
        });
      });
      service.upload(1, null).subscribe(null, null, () => {
        expect(fileUploadService.upload).toHaveBeenCalled();
      });
    })));

    it('should handle errors when uploading files', fakeAsync(inject([ComponentService], (service: ComponentService) => {
      const fileUploadService = getTestBed().get(FileUploadService);
      spyOn(fileUploadService, 'upload').and.callFake(() => {
        return new Promise((resolve, reject) => {
          reject({foo: 'bar'});
        });
      });
      spyOn(service, 'process').and.callFake(() => {
        return new Observable(subscriber => {
          subscriber.complete();
        });
      });
      service.upload(1, null).subscribe(null, (err) => {
        expect(err).toEqual({foo: 'bar'});
      });
    })));

    it('should handle subscriber errors when uploading files', fakeAsync(inject([ComponentService], (service: ComponentService) => {
      const fileUploadService = getTestBed().get(FileUploadService);
      spyOn(fileUploadService, 'upload').and.callThrough();
      spyOn(service, 'process').and.callFake(() => {
        return new Observable(subscriber => {
          subscriber.error({foo: 'bar'});
        });
      });
      service.upload(1, null).subscribe(null, (err) => {
        expect(err).toEqual({foo: 'bar'});
      }, () => {
        expect(fileUploadService.upload).toHaveBeenCalled();
      });
      tick();
    })));

    it('should handle subscriber complete events when uploading files', fakeAsync(
      inject([ComponentService], (service: ComponentService) => {
        const fileUploadService = getTestBed().get(FileUploadService);
        const mockData = {foo: 'bar'};
        spyOn(fileUploadService, 'upload').and.callThrough();
        spyOn(service, 'process').and.callFake(() => {
          return new Observable(subscriber => {
            subscriber.next(mockData);
            subscriber.complete();
          });
        });
        service.upload(1, null).subscribe((data) => {
          expect(data).toEqual(mockData as any);
        }, null, () => {
          expect(fileUploadService.upload).toHaveBeenCalled();
        });
        tick();
      }))
    );
  });
});
