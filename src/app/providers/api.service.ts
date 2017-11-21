import {isPlatformServer} from '@angular/common';
import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {ORIGIN_URL} from '../index';

@Injectable()
export class ApiService {

  private _basePath = '/api';
  private _oauthAuthorizationPath = '/oauth/authorize';
  private _oauthTokenPath = '/oauth/token';
  private _callbackPath = '/callback/email';

  constructor(@Inject(PLATFORM_ID) private platformId, @Inject(ORIGIN_URL) private originUrl) {
  }

  get baseUrl() {
    if (this.isPlatformServer()) {
      return `${this.originUrl()}${this._basePath}`;
    } else {
      return this._basePath;
    }
  }

  get authCodeUrl() {
    return this._oauthAuthorizationPath;
  }

  get authTokenUrl() {
    return this._oauthTokenPath;
  }

  get callbackUrl() {
    return this._callbackPath;
  }

  isPlatformServer(): boolean {
    return isPlatformServer(this.platformId);
  }

}
