import {inject, TestBed} from '@angular/core/testing';

import {NavbarDelegateService} from './navbar-delegate.service';

describe('NavbarDelegateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NavbarDelegateService]
    });
  });

  it('should provide a method to notify subscribers of navbar show status', inject(
    [NavbarDelegateService], (service: NavbarDelegateService) => {
      spyOn(service.shouldDisplay$, 'next').and.callThrough();
      service.displayNavbar(true);
      expect(service.shouldDisplay$.next).toHaveBeenCalledWith(true);
    })
  );

  it('should provide a method to notify subscribers of navbar hide status', inject(
    [NavbarDelegateService], (service: NavbarDelegateService) => {
      spyOn(service.shouldDisplay$, 'next').and.callThrough();
      service.displayNavbar(false);
      expect(service.shouldDisplay$.next).toHaveBeenCalledWith(false);
    })
  );
});
