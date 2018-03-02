import {Injectable, Injector} from '@angular/core';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import {Observable} from 'rxjs/Observable';
import {AuthService} from './auth.service';
import {NavbarDelegateService} from './navbar-delegate.service';
import {HttpBackend, HttpErrorResponse, HttpEvent, HttpEventType, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  static isTokenRequest(url: string): boolean {
    return /oauth\/token$/.test(url);
  }

  constructor(private injector: Injector, private backend: HttpBackend) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).do(null, error => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401 && !AuthInterceptor.isTokenRequest(error.url)) {
          // inform the ui that a re-auth is about to take place
          this.addInfoBannerToNav();
          // perform re-authentication
          return Observable.fromPromise(new Promise((resolve, reject) => {
            const auth: AuthService = this.injector.get(AuthService);
            auth.authenticate(null, true).then(() => {
              if (request.headers) {
                request.headers.set('Authorization', `Bearer ${auth.accessToken}`);
              }
              this.backend.handle(request).filter(event => event.type === HttpEventType.Response).subscribe(res => {
                this.removeInfoBannerFromNav();
                resolve(res);
              }, reject);
            }).catch(reject);
          }));
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
