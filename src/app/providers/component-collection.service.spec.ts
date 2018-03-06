import {fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
import {apiServiceStub} from '../../test/stubs/api.service.stub.spec';
import {authServiceStub} from '../../test/stubs/auth.service.stub.spec';
import {FileUploadTestingModule} from '../../modules/file-upload/file-upload-testing.module';
import {mockComponentCollectionData} from '../models/component-collection.spec';
import {ApiService} from './api.service';
import {AuthService} from './auth.service';

import {ComponentCollectionService} from './component-collection.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpClientModule} from '@angular/common/http';

describe('ComponentCollectionService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: AuthService, useValue: authServiceStub},
        {provide: ApiService, useValue: apiServiceStub},
        ComponentCollectionService
      ],
      imports: [HttpClientTestingModule, HttpClientModule, FileUploadTestingModule]
    });
  });

  it('should be created', inject([ComponentCollectionService], (service: ComponentCollectionService) => {
    expect(service).toBeTruthy();
  }));

  describe('UPDATE', () => {
    it('should provide a method to UPDATE', fakeAsync(
      inject([ComponentCollectionService, HttpTestingController], (service: ComponentCollectionService, backend: HttpTestingController) => {
        service.update(1, mockComponentCollectionData).subscribe(data => {
          expect(data).toBeDefined();
        });
        tick();
        backend.expectOne({
          url: '/api/collections/1',
          method: 'PUT'
        }).flush(mockComponentCollectionData);
      })));

    it('should handle errors on UPDATE', fakeAsync(
      inject([ComponentCollectionService, HttpTestingController], (service: ComponentCollectionService, backend: HttpTestingController) => {
        service.update(1, mockComponentCollectionData).subscribe(null, (err) => {
          expect(err.status).toEqual(400);
        });
        tick();
        backend.expectOne({
          url: '/api/collections/1',
          method: 'PUT'
        }).flush({errors: ['Bad Request']}, {status: 400, statusText: '400'});
      })));
  });

  describe('CREATE', () => {
    it('should provide a method to CREATE', fakeAsync(
      inject([ComponentCollectionService, HttpTestingController], (service: ComponentCollectionService, backend: HttpTestingController) => {
        service.create(mockComponentCollectionData).subscribe(data => {
          expect(data).toBeDefined();
        });
        tick();
        backend.expectOne({
          url: '/api/collections',
          method: 'POST'
        }).flush(mockComponentCollectionData);
      })));

    it('should handle errors on CREATE', fakeAsync(
      inject([ComponentCollectionService, HttpTestingController], (service: ComponentCollectionService, backend: HttpTestingController) => {
        service.create(mockComponentCollectionData).subscribe(null, (err) => {
          expect(err.status).toEqual(400);
        });
        tick();
        backend.expectOne({
          url: '/api/collections',
          method: 'POST'
        }).flush({errors: ['Bad Request']}, {status: 400, statusText: '400'});
      })));
  });
});
