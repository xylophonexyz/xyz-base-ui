import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {ComponentCollectionDataInterface, PageDataInterface, PageParams} from '../index';
import {ApiService} from './api.service';
import {AuthService} from './auth.service';

@Injectable()
export class PagesService {

  private pageCache = {};

  constructor(private http: Http,
              private api: ApiService,
              private auth: AuthService) {
  }

  get(id: number): Observable<PageDataInterface> {
    const url = `${this.api.baseUrl}/pages/${id}`;
    const headers = this.auth.constructAuthHeader();
    if (this.pageCache[id]) {
      return Observable.create(observer => observer.next(this.pageCache[id]));
    } else {
      return this.http.get(url, {headers}).map((res: Response) => {
        this.updatePageCache(id, res.json());
        return res.json() as PageDataInterface;
      });
    }
  }

  create(params: PageParams): Observable<PageDataInterface> {
    const url = `${this.api.baseUrl}/pages`;
    const headers = this.auth.constructAuthHeader();
    return this.http.post(url, JSON.stringify(params), {headers}).map((res: Response) => {
      return res.json() as PageDataInterface;
    });
  }

  update(id: number, params: PageParams): Observable<PageDataInterface> {
    const url = `${this.api.baseUrl}/pages/${id}`;
    const headers = this.auth.constructAuthHeader();
    return this.http.put(url, JSON.stringify(params), {headers}).map((res: Response) => {
      this.updatePageCache(id, res.json());
      return res.json() as PageDataInterface;
    });
  }

  destroy(id: number): Observable<Response> {
    const headers = this.auth.constructAuthHeader();
    this.updatePageCache(id);
    return this.http.delete(`${this.api.baseUrl}/pages/${id}`, {headers});
  }

  addComponentCollection(pageId: number, payload: ComponentCollectionDataInterface): Observable<ComponentCollectionDataInterface> {
    const url = `${this.api.baseUrl}/pages/${pageId}/collections`;
    const headers = this.auth.constructAuthHeader();
    this.updatePageCache(pageId);
    return this.http.post(url, JSON.stringify(payload), {headers}).map((res: Response) => {
      return res.json() as ComponentCollectionDataInterface;
    });
  }

  removeComponentCollection(pageId: number, componentCollectionId: number): Observable<Response> {
    const url = `${this.api.baseUrl}/pages/${pageId}/collections/${componentCollectionId}`;
    const headers = this.auth.constructAuthHeader();
    this.updatePageCache(pageId);
    return this.http.delete(url, {headers});
  }

  private updatePageCache(pageId: number, data?: any) {
    if (data) {
      this.pageCache[pageId] = data;
    } else {
      delete this.pageCache[pageId];
    }
  }

}
