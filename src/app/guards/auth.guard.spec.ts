import {Location} from '@angular/common';
import {inject, TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {authServiceStub} from '../../test/stubs/auth.service.stub.spec';
import {routerStub} from '../../test/stubs/router.stub.spec';
import {UserDataInterface} from '../index';
import {AuthService} from '../providers/auth.service';

import {AuthGuard} from './auth.guard';

describe('AuthGuard', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: Router, useValue: routerStub},
        {provide: AuthService, useValue: authServiceStub},
        Location,
        AuthGuard
      ],
      imports: [RouterTestingModule]
    });
  });

  it('should reject canActivate if authenticate() is rejected', (done) => {
    inject([AuthGuard, AuthService], (guard: AuthGuard, auth: AuthService) => {
      (auth.authenticate as any).and.callFake(() => {
        return new Promise(resolve => resolve(null));
      });
      guard.canActivate(<any>{}, <any>{}).then(result => {
        expect(result).toBe(false);
        done();
      });
    })();
  });

  it('should resolve canActivate if authenticate() is resolved', (done) => {
    inject([AuthGuard, AuthService], (guard: AuthGuard, auth: AuthService) => {
      const user = {id: 1, username: 'joe'} as UserDataInterface;
      (auth.authenticate as any).and.callFake(() => {
        return new Promise(resolve => resolve(user));
      });
      guard.canActivate(<any>{}, <any>{}).then(result => {
        expect(result).toBe(true);
        done();
      });
    })();
  });

  it('should call authenticate()', (done) => {
    inject([AuthGuard, AuthService], (guard: AuthGuard, auth: AuthService) => {
      const user = {id: 1, username: 'joe'} as UserDataInterface;
      (auth.authenticate as any).and.callFake(() => {
        return new Promise(resolve => resolve(user));
      });
      guard.canActivate(<any>{}, <any>{}).then(() => {
        expect(auth.authenticate).toHaveBeenCalled();
        done();
      });
    })();
  });

  it('should catch errors thrown by calls to authenticate()', (done) => {
    inject([AuthGuard, AuthService], (guard: AuthGuard, auth: AuthService) => {
      (auth as any).authenticate.and.callFake(() => {
        return new Promise((_, reject) => reject());
      });
      guard.canActivate(<any>{}, <any>{}).then(result => {
        expect(result).toBe(false);
        expect(auth.authenticate).toHaveBeenCalled();
        done();
      });
    })();
  });

  it('should reject canActivateChild', (done) => {
    inject([AuthGuard, AuthService], (guard: AuthGuard, auth: AuthService) => {
      (auth as any).authenticate.and.callFake(() => {
        return new Promise((_, reject) => reject());
      });
      guard.canActivateChild(<any>{}, <any>{}).then(result => {
        expect(result).toBe(false);
        done();
      });
    })();
  });

  it('should should reject canActivate if the server platform is detected', (done) => {
    inject([AuthGuard, AuthService], (guard: AuthGuard) => {
      spyOn(guard, 'isPlatformServer').and.returnValue(true);
      guard.canActivate(<any>{}, <any>{}).then(result => {
        expect(result).toBe(false);
        done();
      });
    })();
  });
});
