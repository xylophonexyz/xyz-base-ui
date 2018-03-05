import {Injectable, Injector} from '@angular/core';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/finally';
import {Observable} from 'rxjs/Observable';
import {AuthService} from './auth.service';
import {NavbarDelegateService} from './navbar-delegate.service';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  static isTokenRequest(url: string): boolean {
    return /oauth\/token$/.test(url);
  }

  constructor(private injector: Injector) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).catch(error => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401 && !AuthInterceptor.isTokenRequest(error.url)) {
          // inform the ui that a re-auth is about to take place
          this.addInfoBannerToNav();
          // perform re-auth and retry the request with the new token
          const auth: AuthService = this.injector.get(AuthService);
          return Observable.fromPromise(auth.authenticate(null, true)).switchMap(() => {
            const requestWithNewToken = request.clone({
              headers: request.headers.set('Authorization', `Bearer ${auth.accessToken}`)
            });
            return next.handle(requestWithNewToken);
          }).finally(() => this.removeInfoBannerFromNav());
        } else {
          return Observable.throw(error);
        }
      }
    });
  }

  addInfoBannerToNav() {
    const nav: NavbarDelegateService = this.injector.get(NavbarDelegateService);
    nav.setInfoBannerMessage('The current session has expired. Refreshing...');
  }

  removeInfoBannerFromNav() {
    const nav: NavbarDelegateService = this.injector.get(NavbarDelegateService);
    nav.setInfoBannerMessage(null);
  }
}
