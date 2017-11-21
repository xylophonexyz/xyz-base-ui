import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {UserDataInterface} from '../index';
import {ApiService} from './api.service';
import {AuthService} from './auth.service';

@Injectable()
export class UserService {

  constructor(protected http: Http,
              protected auth: AuthService,
              protected api: ApiService) {
  }

  update(params: UserDataInterface): Observable<UserDataInterface> {
    const url = `${this.api.baseUrl}/me`;
    const headers = this.auth.constructAuthHeader();
    return this.http.put(url, JSON.stringify(params), {headers}).map((res: Response) => {
      return res.json() as UserDataInterface;
    });
  }

  updateUserPhoto(userId: number, dataUrl: string): Observable<UserDataInterface> {
    const url = `${this.api.baseUrl}/users/${userId}/avatar`;
    const body = JSON.stringify({
      image_data_url: dataUrl
    });
    const headers = this.auth.constructAuthHeader();
    return this.http.post(url, body, {headers}).map((res: Response) => {
      return res.json() as UserDataInterface;
    });
  }

  deleteUser(userId: number): Observable<Response> {
    const url = `${this.api.baseUrl}/users/${userId}`;
    const headers = this.auth.constructAuthHeader();
    return this.http.delete(url, {headers});
  }

}
