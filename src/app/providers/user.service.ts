import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {UserDataInterface} from '../index';
import {ApiService} from './api.service';
import {AuthService} from './auth.service';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class UserService {

  constructor(protected http: HttpClient,
              protected auth: AuthService,
              protected api: ApiService) {
  }

  update(params: UserDataInterface): Observable<UserDataInterface> {
    const url = `${this.api.baseUrl}/me`;
    const headers = this.auth.constructAuthHeader();
    return this.http.put(url, JSON.stringify(params), {headers}).map((res: Object) => {
      return res as UserDataInterface;
    });
  }

  updateUserPhoto(userId: number, dataUrl: string): Observable<UserDataInterface> {
    const url = `${this.api.baseUrl}/users/${userId}/avatar`;
    const body = JSON.stringify({
      image_data_url: dataUrl
    });
    const headers = this.auth.constructAuthHeader();
    return this.http.post(url, body, {headers}).map((res: Object) => {
      return res as UserDataInterface;
    });
  }

  deleteUser(userId: number): Observable<Object> {
    const url = `${this.api.baseUrl}/users/${userId}`;
    const headers = this.auth.constructAuthHeader();
    return this.http.delete(url, {headers});
  }

}
