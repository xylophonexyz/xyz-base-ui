import {async, fakeAsync, getTestBed, inject, TestBed, tick} from '@angular/core/testing';
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
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpClientModule} from '@angular/common/http';

describe('ComponentService', () => {

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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: AuthService, useValue: authServiceStub},
        {provide: ApiService, useValue: apiServiceStub},
        ComponentService
      ],
      imports: [HttpClientTestingModule, HttpClientModule, FileUploadTestingModule]
    }).compileComponents();
  }));

  it('should ...', inject([ComponentService], (service: ComponentService) => {
    expect(service).toBeTruthy();
  }));

  describe('GET', () => {
    it('should provide a method to GET', fakeAsync(
      inject([ComponentService, HttpTestingController], (service: ComponentService, backend: HttpTestingController) => {
        service.get(1).subscribe(data => {
          expect(data).toBeDefined();
        });
        const request = backend.expectOne({
          url: '/api/components/1',
          method: 'GET'
        });
        request.flush(mockComponent);
        tick();
      })));

    it('should handle errors on GET',
      fakeAsync(
        inject([ComponentService, HttpTestingController], (service: ComponentService, backend: HttpTestingController) => {
          service.get(1).subscribe(null, (err) => {
            expect(err.status).toEqual(400);
          });
          const request = backend.expectOne({
            url: '/api/components/1',
            method: 'GET'
          });
          request.flush({errors: ['Bad Request']}, {status: 400, statusText: '400'});
          tick();
        })));
  });

  describe('UPDATE', () => {
    it('should provide a method to UPDATE', fakeAsync(
      inject([ComponentService, HttpTestingController], (service: ComponentService, backend: HttpTestingController) => {
        service.update(1, mockComponentData).subscribe(data => {
          expect(data).toBeDefined();
        });
        const request = backend.expectOne({
          url: '/api/components/1',
          method: 'PUT'
        });
        request.flush(mockComponent);
        tick();
      })));

    it('should handle errors on UPDATE',
      fakeAsync(
        inject([ComponentService, HttpTestingController], (service: ComponentService, backend: HttpTestingController) => {
          service.update(1, mockComponentData).subscribe(null, (err) => {
            expect(err.status).toEqual(400);
          });
          const request = backend.expectOne({
            url: '/api/components/1',
            method: 'PUT'
          });
          request.flush({errors: ['Bad Request']}, {status: 400, statusText: '400'});
          tick();
        })));
  });

  describe('Process', () => {
    it('should provide a method to "process" a component', fakeAsync(
      inject([ComponentService, HttpTestingController], (service: ComponentService, backend: HttpTestingController) => {
        service.process(1).subscribe((data) => {
          expect(data).toEqual(mockComponent);
        });
        spyOn(service, 'get').and.callFake(() => {
          return new Observable(subscriber => {
            subscriber.next(mockComponent);
          });
        });
        const processRequest = backend.expectOne({
          url: '/api/components/1/process',
          method: 'POST'
        });
        processRequest.flush(null);
        tick();
      }))
    );

    it('should handle errors when "processing" a component', (done) => {
      inject([ComponentService, HttpTestingController], (service: ComponentService, backend: HttpTestingController) => {
        service.process(1).subscribe(null, (err) => {
          expect(err.status).toEqual(400);
          done();
        });
        spyOn(service, 'get').and.callFake(() => {
          return new Observable(subscriber => {
            subscriber.next(mockComponent);
          });
        });
        const request = backend.expectOne({
          url: '/api/components/1/process',
          method: 'POST'
        });
        request.flush({errors: ['Bad Request']}, {status: 400, statusText: '400'});
      })();
    });

    it('should poll if a component is not yet ready', fakeAsync(
      inject([ComponentService, HttpTestingController], (service: ComponentService, backend: HttpTestingController) => {
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
        const request = backend.expectOne({
          url: '/api/components/1/process',
          method: 'POST'
        });
        request.flush(null);
        tick(ComponentService.POLLING_INTERVAL);
      }))
    );

    it('should handle errors if polling request fails', fakeAsync(
      inject([ComponentService, HttpTestingController], (service: ComponentService, backend: HttpTestingController) => {
        service.process(1).subscribe(null, (err) => {
          expect(err.status).toEqual(400);
        });
        const request = backend.expectOne({
          url: '/api/components/1/process',
          method: 'POST'
        });
        request.flush({errors: ['Bad Request']}, {status: 400, statusText: '400'});
        tick(ComponentService.POLLING_INTERVAL);
      }))
    );
  });

  describe('Upload', () => {
    it('should use file upload service to upload files',
      fakeAsync(
        inject([ComponentService], (service: ComponentService) => {
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

    it('should handle errors when uploading files',
      fakeAsync(
        inject([ComponentService], (service: ComponentService) => {
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

    it('should handle subscriber errors when uploading files',
      fakeAsync(
        inject([ComponentService], (service: ComponentService) => {
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
