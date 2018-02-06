import {inject, TestBed} from '@angular/core/testing';

import {QuillService} from './quill.service';

export class MockQuillService {
  getInstance(element, options) {
    const Quill = require('quill');
    return new Quill(element, options);
  }

  getStatic() {
    return require('quill');
  }
}

describe('QuillService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QuillService
      ]
    });
  });

  it('should be created', inject([QuillService], (service: QuillService) => {
    expect(service).toBeTruthy();
  }));

  it('should return a new quill instance', inject([QuillService], (service: QuillService) => {
    const instance = service.getInstance(document.createElement('div'), {});
    expect(instance).toBeDefined();
  }));

  it('should return the quill static object', inject([QuillService], (service: QuillService) => {
    const quill = service.getStatic();
    expect(quill).toBeDefined();
  }));

});
