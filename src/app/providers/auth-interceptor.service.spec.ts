import {getTestBed} from '@angular/core/testing';

import {AuthInterceptor} from './auth-interceptor.service';
import {NavbarDelegateService} from './navbar-delegate.service';

xdescribe('AuthInterceptor', () => {

  it('should catch 401 responses and try to reauth', (done) => {
  });

  it('should throw back any other received error', (done) => {
  });

  it('should provide a static method to check for token requests', () => {
    let url = 'http://mysite.com/oauth/token';
    expect(AuthInterceptor.isTokenRequest(url)).toEqual(true);
    url = 'http://some/other/page';
    expect(AuthInterceptor.isTokenRequest(url)).toEqual(false);
  });

  it('should provide a method to remove the info banner from the nav', () => {
    const nav = getTestBed().get(NavbarDelegateService);
    spyOn(nav, 'setInfoBannerMessage').and.stub();
    const authHttp = getTestBed().get(AuthInterceptor);
    authHttp.removeInfoBannerFromNav();
    expect(nav.setInfoBannerMessage).toHaveBeenCalledWith(null);
  });

  it('should provide a method to add an info banner from the nav', () => {
    const nav = getTestBed().get(NavbarDelegateService);
    spyOn(nav, 'setInfoBannerMessage').and.stub();
    const authHttp = getTestBed().get(AuthInterceptor);
    authHttp.addInfoBannerToNav();
    expect(nav.setInfoBannerMessage).toHaveBeenCalled();
  });
});
