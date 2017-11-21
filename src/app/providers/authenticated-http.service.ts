import {Injectable, Injector} from '@angular/core';
import {Http, Request, RequestOptions, RequestOptionsArgs, Response, XHRBackend} from '@angular/http';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/Observable';
import {AuthService} from './auth.service';

@Injectable()
export class AuthenticatedHttpService extends Http {

  static isTokenRequest(url: string): boolean {
    return /oauth\/token$/.test(url);
  }

  constructor(backend: XHRBackend, defaultOptions: RequestOptions, protected injector: Injector) {
    super(backend, defaultOptions);
  }

  request(req: Request, options?: RequestOptionsArgs): Observable<Response> {
    return super.request(req, options).catch((error: Response) => {
      if (error.status === 401 && !AuthenticatedHttpService.isTokenRequest(error.url)) {
        console.log('The authentication session has expired or the user is not authorized. Refreshing...');
        const auth: AuthService = this.injector.get(AuthService);
        return Observable.fromPromise(new Promise((resolve, reject) => {
          auth.authenticate(null, true).then(() => {
            if (req.headers) {
              req.headers.set('Authorization', `Bearer ${auth.accessToken}`);
            }
            super.request(req, options).subscribe(resolve, reject);
          }).catch(reject);
        }));
      } else {
        return Observable.throw(error);
      }
    });
  }
}
