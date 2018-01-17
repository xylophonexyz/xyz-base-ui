import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {CompositionDataInterface, CompositionParams, CreateZoneResponse, PageDataInterface} from '../index';
import {ApiService} from './api.service';
import {AuthService} from './auth.service';
import {ComponentService} from './component.service';
import {PagesService} from './pages.service';

@Injectable()
export class SitesService {

  constructor(private http: Http,
              private api: ApiService,
              private auth: AuthService,
              private pagesProvider: PagesService,
              private componentProvider: ComponentService) {

  }

  all(): Observable<CompositionDataInterface[]> {
    const url = `${this.api.baseUrl}/me/compositions`;
    const headers = this.auth.constructAuthHeader();
    return this.http.get(url, {headers}).map((res: Response) => {
      return res.json() as CompositionDataInterface[];
    });
  }

  create(params: CompositionParams): Observable<CompositionDataInterface> {
    const url = `${this.api.baseUrl}/compositions`;
    const headers = this.auth.constructAuthHeader();
    return new Observable(observer => {
      this.http.post(url, JSON.stringify(params), {headers}).map((res: Response) => {
        return res.json() as CompositionDataInterface;
      }).subscribe((c: CompositionDataInterface) => {
        this.pagesProvider.create({
          composition_id: c.id,
          title: 'Home',
          published: true,
          metadata: {
            index: 0,
            navigationItem: true,
            showNav: true
          }
        }).subscribe((page: PageDataInterface) => {
          c.pages = [page];
          observer.next(c);
          observer.complete();
        }, err => {
          observer.error(err);
          observer.complete();
        });
      }, err => {
        observer.error(err);
        observer.complete();
      });
    });
  }

  get(id: number): Observable<CompositionDataInterface> {
    const url = `${this.api.baseUrl}/compositions/${id}`;
    const headers = this.auth.constructAuthHeader();
    return this.http.get(url, {headers}).map((res: Response) => {
      return res.json() as CompositionDataInterface;
    });
  }

  update(id: number, params: CompositionParams): Observable<CompositionDataInterface> {
    const url = `${this.api.baseUrl}/compositions/${id}`;
    const headers = this.auth.constructAuthHeader();
    return this.http.put(url, JSON.stringify(params), {headers}).map((res: Response) => {
      return res.json() as CompositionDataInterface;
    });
  }

  uploadLogo(id: number, params: CompositionParams, file: File): Promise<CompositionDataInterface | Error> {
    return new Promise((resolve, reject) => {
      this.update(id, {add_cover: true, ...params}).subscribe((composition: CompositionDataInterface) => {
        this.componentProvider.upload(composition.cover.id, file).subscribe(cover => {
          // update the return data with the value returned by the observable
          composition.cover = cover;
        }, err => {
          reject(err);
        }, () => {
          // upload is completely done, resolve promise with the up to date composition object
          resolve(composition as CompositionDataInterface);
        });
      }, err => {
        reject(err);
      });
    });
  }

  removeLogo(id: number): Promise<CompositionDataInterface | Error> {
    return new Promise((resolve, reject) => {
      this.update(id, {remove_cover: true}).subscribe((composition: CompositionDataInterface) => {
        resolve(composition as CompositionDataInterface);
      }, err => {
        reject(err);
      });
    });
  }

  link(id: number, pageId: number, shouldLink: boolean): Observable<CompositionDataInterface> {
    const url = `${this.api.baseUrl}/compositions/${id}/pages/${pageId}`;
    const headers = this.auth.constructAuthHeader();
    if (shouldLink) {
      return this.http.post(url, null, {headers}).map((res: Response) => {
        return res.json() as CompositionDataInterface;
      });
    } else {
      return this.http.delete(url, {headers}).map((res: Response) => {
        return res.json() as CompositionDataInterface;
      });
    }
  }

  publish(id: number, shouldPublish: boolean): Observable<CompositionDataInterface> {
    return this.update(id, {publish: shouldPublish} as CompositionParams);
  }

  destroy(id: number): Observable<Response> {
    const headers = this.auth.constructAuthHeader();
    return this.http.delete(`${this.api.baseUrl}/compositions/${id}`, {headers});
  }

  addCustomDomain(siteId: number, domainName: string): Observable<CreateZoneResponse> {
    const headers = this.auth.constructAuthHeader();
    const payload = {
      domainName: domainName,
      siteId: siteId
    };
    return this.http.post(`${this.api.baseUrl}/domains`, payload, {headers}).map((res: Response) => {
      return res.json();
    });
  }

  removeCustomDomain(siteId: number): Observable<Response> {
    const headers = this.auth.constructAuthHeader();
    return this.http.delete(`${this.api.baseUrl}/domains/${siteId}`, {headers});
  }

  addDomainNameKeyPair(siteId: number, domainName: string, subdomain: string): Observable<any> {
    const headers = this.auth.constructAuthHeader();
    const payload = {
      domainName: domainName,
      subdomain: subdomain,
      siteId: siteId
    };
    return this.http.post(`${this.api.baseUrl}/domainMappings`, payload, {headers}).map((res: Response) => {
      return res.json();
    });
  }

  removeDomainNameKeyPair(siteId: number, domainName: string, subdomain: string): Observable<any> {
    const headers = this.auth.constructAuthHeader();
    return this.http.delete(
      `${this.api.baseUrl}/domainMappings/${siteId}?domainName=${domainName}&subdomain=${subdomain}`,
      {headers}
    ).map((res: Response) => {
      return res.json();
    });
  }

}
