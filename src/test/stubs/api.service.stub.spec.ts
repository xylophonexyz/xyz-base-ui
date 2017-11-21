class ApiServiceStub {
  private _basePath = '/api';
  private _oauthAuthorizationPath = '/oauth/authorize';
  private _oauthTokenPath = '/oauth/token';
  private _callbackPath = '/callback/email';

  get baseUrl() {
    return this._basePath;
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
}

export const apiServiceStub = new ApiServiceStub();
