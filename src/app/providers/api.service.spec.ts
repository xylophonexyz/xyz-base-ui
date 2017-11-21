import {inject, TestBed} from '@angular/core/testing';
import {originUrlFactory} from '../../test/stubs/tokens.stub.spec';
import {ORIGIN_URL} from '../index';

import {ApiService} from './api.service';

describe('ApiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        {provide: ORIGIN_URL, useFactory: originUrlFactory}
      ]
    });
  });

  it('should provide api endpoints', inject([ApiService], (service: ApiService) => {
    expect(service.baseUrl).toEqual('/api');
    expect(service.authCodeUrl).toEqual('/oauth/authorize');
    expect(service.callbackUrl).toEqual('/callback/email');
    expect(service.authTokenUrl).toEqual('/oauth/token');
  }));

  it('should provide a absolute url on the server platform', inject([ApiService, ORIGIN_URL], (service: ApiService, originUrl) => {
    spyOn(service, 'isPlatformServer').and.returnValue(true);
    expect(service.baseUrl).toEqual('http://123.1.2.3/api');
  }));
});
