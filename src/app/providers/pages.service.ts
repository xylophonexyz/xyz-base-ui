import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {ComponentCollectionDataInterface, PageDataInterface, PageParams} from '../index';
import {ApiService} from './api.service';
import {AuthService} from './auth.service';
import {Page} from '../models/page';
import * as getSlug from 'speakingurl';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class PagesService {

  private pageCache = {};

  static getPublicPageUrl(page: Page): string {
    if (page.title) {
      return `/${getSlug(page.title)}-${page.id}`;
    } else {
      return this.getInternalPageUrl(page);
    }
  }

  static getInternalPageUrl(page: Page): string {
    return '/p/' + page.id;
  }

  constructor(private http: HttpClient,
              private api: ApiService,
              private auth: AuthService) {
  }

  get(id: number, useCache: boolean = true): Observable<PageDataInterface> {
    const url = `${this.api.baseUrl}/pages/${id}`;
    const headers = this.auth.constructAuthHeader();
    if (useCache && this.pageCache[id]) {
      return Observable.create(observer => observer.next(this.pageCache[id]));
    } else {
      return this.http.get(url, {headers}).map((res: Object) => {
        this.updatePageCache(id, res);
        return res as PageDataInterface;
      });
    }
  }

  create(params: PageParams): Observable<PageDataInterface> {
    const url = `${this.api.baseUrl}/pages`;
    const headers = this.auth.constructAuthHeader();
    return this.http.post(url, JSON.stringify(params), {headers}).map((res: Object) => {
      return res as PageDataInterface;
    });
  }

  update(id: number, params: PageParams): Observable<PageDataInterface> {
    const url = `${this.api.baseUrl}/pages/${id}`;
    const headers = this.auth.constructAuthHeader();
    return this.http.put(url, JSON.stringify(params), {headers}).map((res: Object) => {
      this.updatePageCache(id, res);
      return res as PageDataInterface;
    });
  }

  destroy(id: number): Observable<Object> {
    const headers = this.auth.constructAuthHeader();
    this.updatePageCache(id);
    return this.http.delete(`${this.api.baseUrl}/pages/${id}`, {headers});
  }

  addComponentCollection(pageId: number, payload: ComponentCollectionDataInterface): Observable<ComponentCollectionDataInterface> {
    const url = `${this.api.baseUrl}/pages/${pageId}/collections`;
    const headers = this.auth.constructAuthHeader();
    this.updatePageCache(pageId);
    return this.http.post(url, JSON.stringify(payload), {headers}).map((res: Object) => {
      return res as ComponentCollectionDataInterface;
    });
  }

  removeComponentCollection(pageId: number, componentCollectionId: number): Observable<Object> {
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
