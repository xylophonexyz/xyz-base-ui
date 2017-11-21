import {inject, TestBed} from '@angular/core/testing';

import {LoginModalDelegateService} from './login-modal-delegate.service';

describe('LoginModalDelegateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoginModalDelegateService]
    });
  });

  it('should provide a method to notify subscribers of login show status', inject(
    [LoginModalDelegateService], (service: LoginModalDelegateService) => {
      spyOn(service.shouldDisplay$, 'next').and.callThrough();
      service.displayLoginComponent(true);
      expect(service.shouldDisplay$.next).toHaveBeenCalledWith(true);
    })
  );

  it('should provide a method to notify subscribers of login hide status', inject(
    [LoginModalDelegateService], (service: LoginModalDelegateService) => {
      spyOn(service.shouldDisplay$, 'next').and.callThrough();
      service.displayLoginComponent(false);
      expect(service.shouldDisplay$.next).toHaveBeenCalledWith(false);
    })
  );

});
