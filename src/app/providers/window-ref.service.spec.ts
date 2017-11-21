import {inject, TestBed} from '@angular/core/testing';

import {WindowRefService} from './window-ref.service';

describe('WindowRefService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WindowRefService]
    });
  });

  it('should be created', inject([WindowRefService], (service: WindowRefService) => {
    expect(service).toBeTruthy();
  }));

  it('should provide a getter to return the dom element', inject([WindowRefService], (service: WindowRefService) => {
    expect(service.nativeWindow).toEqual(window);
  }));
});
