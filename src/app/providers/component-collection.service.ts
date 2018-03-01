import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {ComponentCollectionDataInterface} from '../index';
import {ApiService} from './api.service';
import {AuthService} from './auth.service';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class ComponentCollectionService {

  constructor(protected http: HttpClient,
              protected auth: AuthService,
              protected api: ApiService) {
  }

  create(params: ComponentCollectionDataInterface): Observable<ComponentCollectionDataInterface> {
    const url = `${this.api.baseUrl}/collections`;
    const headers = this.auth.constructAuthHeader();
    return this.http.post(url, JSON.stringify(params), {headers}).map((res: Object) => {
      return res as ComponentCollectionDataInterface;
    });
  }

  update(id: number, params: ComponentCollectionDataInterface): Observable<ComponentCollectionDataInterface> {
    const url = `${this.api.baseUrl}/collections/${id}`;
    const headers = this.auth.constructAuthHeader();
    return this.http.put(url, JSON.stringify(params), {headers}).map((res: Object) => {
      return res as ComponentCollectionDataInterface;
    });
  }

}
