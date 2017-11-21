import {isPlatformServer} from '@angular/common';
import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {Headers, Http, Response} from '@angular/http';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {AuthorizationCode, OAuthToken, UserDataInterface} from '../index';
import {User} from '../models/user';
import {ApiService} from './api.service';
import {StorageService} from './storage.service';

export interface AuthStrategy {
  authenticate: () => Promise<User | Error>;
}

@Injectable()
export class AuthService {

  static readonly OAUTH_TOKEN_KEY = '__OAUTH_TOKEN__';
  currentUser$ = new BehaviorSubject<User>(null);
  private _oauthToken: OAuthToken;
  private _currentUser: User;

  /**
   * check if the oauth token provided is expired
   * @param token
   * @returns {boolean}
   */
  static isTokenExpired(token: OAuthToken): boolean {
    return new Date().getTime() > ((token.created_at + token.expires_in) * 1000);
  }

  constructor(private http: Http,
              private api: ApiService,
              private storage: StorageService,
              @Inject(PLATFORM_ID) private platformId) {
  }

  /**
   * Returns the current user
   * @returns {User}
   */
  get currentUser(): User {
    return this._currentUser;
  }

  /**
   * Returns the stored oauth token
   * @returns {OAuthToken}
   */
  get token(): OAuthToken {
    return this._oauthToken;
  }

  /**
   * Provides a safe method of retrieving the access token
   * @returns {string}
   */
  get accessToken(): string {
    if (this.token) {
      return this.token.access_token;
    } else {
      return '';
    }
  }

  constructAuthHeader(): Headers {
    if (this.token) {
      return new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      });
    } else {
      return new Headers({
        'Content-Type': 'application/json',
      });
    }
  }

  /**
   * Perform a full authentication. This method will authenticate the user from an authorization code or
   * by a stored oauth token. If no auth code is provided and no oauth token is stored, return an error.
   * If an auth code is provided, this is considered a "reauth", and oauth token will be refreshed and user data
   * re-retrieved. If no auth code is provided and a current user object is cached, return the cached current user.
   * If no current user is cached, go and fetch the current user and cache.
   * @param authCode
   * @returns {Promise<any>}
   */
  authenticate(authCode?: AuthorizationCode, doReauth?: boolean): Promise<User | Error> {
    return new Promise((resolve, reject) => {
      if (!doReauth && this._currentUser) {
        this.emitCurrentUser(this._currentUser);
        resolve(this._currentUser);
      } else {
        this.getAuthStrategy(authCode).then((strategy: AuthStrategy) => {
          strategy.authenticate().then((currentUser: User) => {
            this.onAuthSuccess(currentUser).then(resolve).catch(reject);
          }).catch(err => {
            this.onAuthFail(err).then(reject).catch(reject);
          });
        });
      }
    });
  }

  /**
   * clear all stored authentication credentials
   * @returns {Promise<T>}
   */
  clear(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.clearToken().then(() => {
        this._currentUser = null;
        this.currentUser$.next(null);
        resolve();
      }).catch(reject);
    });
  }

  /**
   * make a request to authenticate the user by the provided access_token.
   * @param token
   * @returns {Promise<T>}
   */
  authenticateWithToken(token: OAuthToken): Observable<Response> {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.access_token}`
    });
    return this.http.get(`${this.api.baseUrl}/me`, {headers});
  }

  authenticateWithRefreshToken(token: OAuthToken): Observable<Response> {
    const headers = new Headers({'Content-Type': 'application/json'});
    const body = JSON.stringify({refresh_token: token.refresh_token, grant_type: 'refresh_token'});
    return this.http.post(this.api.authTokenUrl, body, {headers});
  }

  /**
   * make a request to trade a valid authorization code for an oauth token from the backend
   * @param code
   * @returns {Promise<T>}
   */
  authenticateWithCode(code: string): Observable<Response> {
    const headers = new Headers({'Content-Type': 'application/json'});
    const body = JSON.stringify({code: code, grant_type: 'authorization_code'});
    return this.http.post(this.api.authTokenUrl, body, {headers});
  }

  /**
   * Thin wrapper over isPlatformServer for mocking in tests.
   * @returns {boolean}
   */
  isPlatformServer(): boolean {
    return isPlatformServer(this.platformId);
  }

  /**
   * Return an AuthStrategy based on the provided authcode and whether an existing stored oauth token can be found.
   * @param {AuthorizationCode} authCode
   * @returns {Promise<AuthStrategy>}
   */
  private getAuthStrategy(authCode?: AuthorizationCode): Promise<AuthStrategy> {
    return new Promise(resolve => {
      if (this.isPlatformServer()) {
        resolve(this.nullStrategy());
      } else {
        const getToken = this.tokenRetrievalStrategy(authCode);
        // get the oauth token
        getToken().then((token: OAuthToken) => {
          if (token) {
            if (AuthService.isTokenExpired(token)) {
              // renew the oauth token
              resolve(this.authWithRefreshTokenStrategy(token));
            } else {
              resolve(this.authWithTokenStrategy(token));
            }
          } else {
            resolve(this.authFailedStrategy(new Error('Could not get token for auth request.')));
          }
        }).catch(err => {
          return resolve(this.authFailedStrategy(err));
        });
      }
    });
  }

  /**
   * helper method that finalizes the authentication process by storing the given oauth token,
   * authenticating the user against the backend, and emitting the authentication result
   * @param token
   * @param retry - is this a retry attempt? if so dont recurse into the method upon receipt of 401
   * @returns {Promise<T>}
   */
  private doAuthWithToken(token: OAuthToken, retry?: boolean): Promise<User | Error> {
    return new Promise((resolve, reject) => {
      // authenticate the user by token
      this.authenticateWithToken(token).subscribe((res: Response) => {
        // success - set the current user and resolve the authentication result
        const currentUser = res.json() as UserDataInterface;
        this.onTokenSuccess(token).then(() => {
          resolve(new User(currentUser));
        }).catch(reject);
      }, (err: Response) => {
        // if authentication fails with 401 and a refresh token is present, try a reauth before giving up
        if (err.status === 401 && token.refresh_token && !retry) {
          this.authenticateWithRefreshToken(token).subscribe((res: Response) => {
            this.doAuthWithToken(res.json() as OAuthToken, true).then(resolve).catch(reject);
          }, () => {
            reject(err);
          });
        } else {
          reject(err);
        }
      });
    });
  }

  /**
   * return the token retrieval method. if an auth code is passed in, this defaults to sending a request against
   * /oauth/token endpoint with an authorization code. otherwise, the token retrieval method is to try to
   * access one stored on disk
   * @param authCode
   * @returns {()=>Promise<OAuthToken>}
   */
  private tokenRetrievalStrategy(authCode: AuthorizationCode): () => Promise<OAuthToken> {
    const shouldAuthWithTokenRequest = !!authCode;
    // the vessel for retrieving an oauth token
    let getToken: () => Promise<OAuthToken>;
    // this block defines the retrieval method for the oauth token by performing re-auth or fetching a stored token
    if (shouldAuthWithTokenRequest) {
      // define the token retrieval method as oauth-token request based
      getToken = () => new Promise((resolve, reject) => {
        this.authenticateWithCode(authCode).subscribe((res: Response) => {
          resolve(res.json() as OAuthToken);
        }, (err) => {
          reject(err);
        });
      });
    } else {
      // define the token retrieval method as cache/storage
      getToken = () => this.getToken();
    }
    return getToken;
  }

  /**
   * retrieve the stored oauth token from cache. if the token isnt found in cache, fetch it from storage and
   * place it in cache
   * @returns {Promise<OAuthToken>}
   */
  private getToken(): Promise<OAuthToken> {
    if (this._oauthToken) {
      return new Promise(resolve => resolve(this._oauthToken));
    } else {
      return this.storage.get(AuthService.OAUTH_TOKEN_KEY).then((token: OAuthToken) => {
        this.setToken(token);
        return token;
      });
    }
  }

  /**
   * Auth strategy that performs an auth with the provided oauth token.
   * @param token
   * @returns {AuthStrategy}
   */
  private authWithTokenStrategy(token): AuthStrategy {
    return {
      authenticate: () => {
        return new Promise((resolve, reject) => {
          this.doAuthWithToken(token).then(resolve).catch(reject);
        });
      }
    };
  }

  /**
   * Auth strategy for authentication with a refresh token. Performs a refresh token request, followed by a normal
   * auth request.
   * @param {OAuthToken} token
   * @returns {AuthStrategy}
   */
  private authWithRefreshTokenStrategy(token: OAuthToken): AuthStrategy {
    return {
      authenticate: () => {
        return new Promise((resolve, reject) => {
          this.authenticateWithRefreshToken(token).subscribe((res: Response) => {
            const newToken = res.json() as OAuthToken;
            this.doAuthWithToken(newToken).then(resolve).catch(reject);
          });
        });
      }
    };
  }

  /**
   * Auth strategy that fails with an error
   * @param {Error} err
   * @returns {AuthStrategy}
   */
  private authFailedStrategy(err: Error): AuthStrategy {
    return {
      authenticate: () => new Promise((_, reject) => reject(err))
    };
  }

  /**
   * Auth strategy that resolves null. Used for the server-side rendering platform.
   * @returns {AuthStrategy}
   */
  private nullStrategy(): AuthStrategy {
    return {
      authenticate: () => {
        return new Promise(resolve => resolve(null));
      }
    };
  }

  /**
   * cache the oauth token
   * @param token
   */
  private setToken(token: OAuthToken) {
    this._oauthToken = token;
  }

  /**
   * remove the stored oauth token from storage and cache
   * @returns {Promise<void>}
   */
  private clearToken(): Promise<void> {
    this._oauthToken = null;
    return this.storage.remove(AuthService.OAUTH_TOKEN_KEY);
  }

  /**
   * set the current user object
   * @param user
   */
  private setCurrentUser(user: User) {
    this._currentUser = user;
  }

  /**
   * Emit the current user on the observable stream
   * @param {User} currentUser
   */
  private emitCurrentUser(currentUser: User) {
    this.currentUser$.next(currentUser);
  }

  /**
   * stores the oauth token under a known key in available local storage (localstorage, indexedDB, etc)
   * @param token
   * @returns {Promise<any>}
   */
  private storeToken(token: OAuthToken): Promise<any> {
    return this.storage.set(AuthService.OAUTH_TOKEN_KEY, token);
  }

  private onTokenSuccess(token: OAuthToken): Promise<any> {
    // the authentication was successful, store the token
    this.setToken(token);
    return this.storeToken(token);
  }

  /**
   *
   * @param {User} currentUser
   */
  private onAuthSuccess(currentUser: User): Promise<User> {
    return new Promise(resolve => {
      // publish currentUser to observable stream
      this.emitCurrentUser(currentUser);
      // cache user
      this.setCurrentUser(currentUser);
      resolve(this._currentUser);
    });
  }

  /**
   * authentication fail handler. performs cleanup tasks around emitting values and clearing any stored token
   * from storage
   * @param err
   * @returns {Promise<T>}
   */
  private onAuthFail(err: Error): Promise<Error> {
    return new Promise((resolve, reject) => {
      this.clear().then(() => resolve(err), reject);
    });
  }
}
