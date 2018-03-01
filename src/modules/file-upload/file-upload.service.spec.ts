import {fakeAsync, getTestBed, inject, TestBed} from '@angular/core/testing';
import {BaseRequestOptions, Http, ResponseOptions} from '@angular/http';
import {MockBackend} from '@angular/http/testing';
import {Observable} from 'rxjs/Observable';
import {FileUploadConfig} from './file-upload-config';
import {FileUploadModule} from './file-upload.module';
import {FileUploadService} from './file-upload.service';
import {UploadRequestQueue} from './index';
import {HttpClientModule, HttpHeaders} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';

export function mockFile(size, name): File {
  const data = new Uint32Array(size);
  data.fill(1);
  return new File(data.slice(0) as any, name);
}

describe('FileUploadService', () => {

  let mockBackend: MockBackend;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FileUploadModule, HttpClientTestingModule, HttpClientModule],
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
      ]
    });
    mockBackend = getTestBed().get(MockBackend);
  });

  it('should be injectable', inject([FileUploadService], (service: FileUploadService) => {
    expect(service).toBeTruthy();
  }));

  it('should expose an upload method', inject([FileUploadService], (service: FileUploadService) => {
    expect(service.upload).toBeDefined();
  }));

  it('should slice a file from a given offset', inject([FileUploadService], (service: FileUploadService) => {
    const file = mockFile(1000, 'myFile.jpg');
    const part = service.sliceFile(file, 0, 10);
    expect(part.size).toEqual(10);
  }));

  it('should slice a file at an arbitrary offset', inject([FileUploadService], (service: FileUploadService) => {
    const file = mockFile(1000, 'myFile.jpg');
    const part = service.sliceFile(file, 543, 10);
    expect(part.size).toEqual(10);
  }));

  it('should slice a file only to end of the file size', inject([FileUploadService], (service: FileUploadService) => {
    const file = mockFile(1000, 'myFile.jpg');
    const part = service.sliceFile(file, 999, 10);
    expect(part.size).toEqual(1);
  }));

  describe('Upload', () => {
    it('should upload a file by queueing up uploadPart requests', fakeAsync(inject([FileUploadService], (service: FileUploadService) => {
      const file = mockFile(1000, 'myFile.jpg');
      spyOn(service, 'processUploadRequestQueue').and.callThrough();
      service.upload(file, {
        url: 'my/endpoint',
        headers: new HttpHeaders(),
        partSize: 1
      }).then(() => {
        expect(service.processUploadRequestQueue).toHaveBeenCalled();
      });
    })));

    it('should upload an entire file in one request if resumable uploads are disabled', fakeAsync(
      inject([FileUploadService], (service: FileUploadService) => {
        const config = getTestBed().get(FileUploadConfig);
        config.resumableUploadEnabled = false;
        const file = mockFile(1000, 'myFile.jpg');
        spyOn(service, 'processUploadRequestQueue').and.callThrough();
        service.upload(file, {
          url: 'my/endpoint',
          headers: new HttpHeaders(),
          partSize: 1
        }).then(() => {
          expect(service.processUploadRequestQueue).toHaveBeenCalled();
        });
      })));

    it('should upload a file in a multi-part request', fakeAsync(
      inject([FileUploadService], (service: FileUploadService) => {
        const http = getTestBed().get(Http);
        const file = mockFile(1000, 'myFile.jpg');
        spyOn(service, 'sliceFile').and.callThrough();
        spyOn(http, 'post').and.callFake(() => {
          return new Observable(subscriber => {
            subscriber.next(new Response(new ResponseOptions({
              status: 200,
              body: JSON.stringify({})
            })));
          });
        });
        service.uploadPart(file, 500, {
          url: 'my/endpoint',
          headers: new HttpHeaders(),
          partSize: 1
        }).then(() => {
          expect(http.post).toHaveBeenCalled();
        });
      })));

    it('should handle errors when upload a file in a multi-part request', fakeAsync(
      inject([FileUploadService], (service: FileUploadService) => {
        const http = getTestBed().get(Http);
        const file = mockFile(1000, 'myFile.jpg');
        spyOn(service, 'sliceFile').and.callThrough();
        spyOn(http, 'post').and.callFake(() => {
          return new Observable(subscriber => {
            subscriber.error(new Response(new ResponseOptions({
              status: 400,
              body: JSON.stringify({})
            })));
          });
        });
        service.uploadPart(file, 500, {
          url: 'my/endpoint',
          headers: new HttpHeaders(),
          partSize: 1
        }).catch(() => {
          expect(http.post).toHaveBeenCalled();
        });
      }))
    );
  });

  describe('RequestQueue', () => {
    it('should fulfill the request queue until it is empty', fakeAsync(
      inject([FileUploadService], (service: FileUploadService) => {
        const queue: UploadRequestQueue = [];
        let modifiedVal = 0;
        queue.push(() => {
          return new Promise(resolve => resolve(modifiedVal++));
        });
        queue.push(() => {
          return new Promise(resolve => resolve(modifiedVal++));
        });
        service.processUploadRequestQueue(queue).then(() => {
          expect(queue.length).toEqual(0);
          expect(modifiedVal).toEqual(2);
        });
      }))
    );
  });
});
