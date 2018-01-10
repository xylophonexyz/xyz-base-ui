import {async, getTestBed, inject, TestBed} from '@angular/core/testing';

import {UtilService} from './util.service';
import {WindowRefService} from './window-ref.service';

describe('UtilService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        WindowRefService,
        UtilService,
      ]
    });
  }));

  it('should be created', inject([UtilService], (service: UtilService) => {
    expect(service).toBeTruthy();
  }));

  it('should provide a method to copy content to the clipboard', inject([UtilService], (service: UtilService) => {
    const content = 'foo';
    const windowRef: WindowRefService = getTestBed().get(WindowRefService);
    spyOn(windowRef.nativeWindow.document, 'execCommand');
    service.copyToClipboard(content);
    expect(windowRef.nativeWindow.document.execCommand).toHaveBeenCalled();
  }));
});
