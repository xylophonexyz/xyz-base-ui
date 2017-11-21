import {Injectable} from '@angular/core';
import {Headers, Http} from '@angular/http';
import {Router} from '@angular/router';
import {LoginType} from '../index';
import {ApiService} from './api.service';
import {AuthService} from './auth.service';

@Injectable()
export class LoginService {

  constructor(private http: Http,
              private api: ApiService,
              private router: Router,
              private auth: AuthService) {
  }

  /**
   * attempt a login by first checking if the given email is taken. then proceed to send an authorization code
   * request to the backend, or post a request to create the user, and then recursively call doLogin again
   * @param email
   * @returns {Promise<T>}
   */
  doLogin(email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.doEmailCheck(email).then(() => {
        this.sendLoginRequest(email).then(() => {
          resolve(LoginType.LOGIN);
        }).catch(reject);
      }).catch(() => {
        this.doRegistration(email).then(() => {
          resolve(LoginType.REGISTER);
        }).catch(reject);
      });
    });
  }

  /**
   * send an authorization code request through the proxy to our backend. the proxy fills in the request with the
   * necessary client credentials needed to perform the request.
   * @param email
   * @returns {Promise<T>}
   */
  sendLoginRequest(email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const headers = new Headers({'Content-Type': 'application/json'});
      const body = JSON.stringify({email: email});
      this.http.post(this.api.authCodeUrl, body, {headers}).subscribe(resolve, reject);
    });
  }

  /**
   * send a request via proxy to create a user given an email. the proxy fills in the request with the
   * necessary client credentials needed to perform the request. when the user is successfully created,
   * we send a request to log the newly created user in via oauth authorization code request
   * @param email
   * @returns {Promise<T>}
   */
  doRegistration(email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const headers = new Headers({'Content-Type': 'application/json'});
      const body = JSON.stringify({email: email});
      this.http.post(`${this.api.baseUrl}/users`, body, {headers}).subscribe(() => {
        this.sendLoginRequest(email).then(resolve).catch(reject);
      }, reject);
    });
  }

  /**
   * given an email address, send a request to the /users/check endpoint to see if the email is taken or is
   * available. the endpoint returns a 404 if the username is not taken, and a 200 otherwise
   * @param email
   * @returns {Promise<T>}
   */
  doEmailCheck(email: string): Promise<undefined> {
    return new Promise((resolve, reject) => {
      const endpoint = `${this.api.baseUrl}/users/check`;
      const headers = new Headers({'Content-Type': 'application/json'});
      const body = JSON.stringify({email: email});
      this.http.post(endpoint, body, {headers}).subscribe(() => resolve(), () => reject());
    });
  }

  /**
   * Sign out the current user and redirect to the login page
   * @returns {Promise<any>}
   */
  logout() {
    return this.auth.clear().then(() => {
      this.router.navigate(['/login']);
    });
  }

}
