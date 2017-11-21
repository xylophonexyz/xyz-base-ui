import {getTestBed, inject, TestBed} from '@angular/core/testing';

import {StorageService} from './storage.service';

describe('StorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService]
    });
  });

  it('should be created', inject([StorageService], (service: StorageService) => {
    expect(service).toBeTruthy();
  }));

  afterEach((done) => {
    const service = getTestBed().get(StorageService);
    service.remove('someKey').then(done);
  });

  it('should provide a method to get an item', (done) => {
    const service = getTestBed().get(StorageService);
    expect(service.get).toBeDefined();
    service.get('someKey').then(val => {
      expect(val).toBeNull();
      done();
    });
  });

  it('should provide a method to set an item', (done) => {
    const service = getTestBed().get(StorageService);
    expect(service.set).toBeDefined();
    service.set('someKey', 'someVal').then(() => {
      service.get('someKey').then(val => {
        expect(val).toEqual('someVal');
        done();
      });
    });
  });

  it('should provide a method to remove an item', (done) => {
    const service = getTestBed().get(StorageService);
    expect(service.remove).toBeDefined();
    service.set('someKey', 'someVal').then(() => {
      service.remove('someKey').then(() => {
        service.get('someKey').then(val => {
          expect(val).toBeNull();
          done();
        });
      });
    });
  });
});
